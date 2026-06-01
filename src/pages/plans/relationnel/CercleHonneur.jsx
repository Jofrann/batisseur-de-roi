import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Globe, Plus, Heart, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

const CERCLES = [
  { key: "autorites", label: "⚔️ Autorités Spirituelles", desc: "Apôtres, pasteurs, mentors", color: "border-purple-500/30 bg-purple-950/10" },
  { key: "conjoint", label: "💍 Conjoint(e)", desc: "Pilier central du foyer", color: "border-pink-500/30 bg-pink-950/10" },
  { key: "enfants", label: "👨‍👩‍👧 Enfants", desc: "Héritage vivant", color: "border-yellow-500/30 bg-yellow-950/10" },
  { key: "equipes", label: "🤝 Équipes & Collaborateurs", desc: "Ceux qui portent la vision avec toi", color: "border-green-500/30 bg-green-950/10" },
  { key: "famille_elargie", label: "🌿 Famille élargie", desc: "Honneur envers les racines", color: "border-orange-500/30 bg-orange-950/10" },
];

export default function CercleHonneur() {
  const [selectedCercle, setSelectedCercle] = useState(null);
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nom: "", action_honneur: "", score: "8" });

  useEffect(() => { if (selectedCercle) loadEntries(selectedCercle); }, [selectedCercle]);

  const loadEntries = async (cercle) => {
    const data = await base44.entities.DailyActionLogEntry.filter({ pillar: "relational" }, "-action_date", 50);
    setEntries(data.filter(d => d.notes?.startsWith(`CERCLE:${cercle}`)));
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.DailyActionLogEntry.create({
      action_date: new Date().toISOString().slice(0, 10),
      pillar: "relational",
      title: form.nom,
      description: form.action_honneur,
      progress_percentage: parseInt(form.score) * 10,
      status: "completed",
      notes: `CERCLE:${selectedCercle}:${form.score}`,
    });
    setForm({ nom: "", action_honneur: "", score: "8" });
    setShowForm(false);
    await loadEntries(selectedCercle);
    setSaving(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.DailyActionLogEntry.delete(id);
    await loadEntries(selectedCercle);
  };

  const cercleInfo = CERCLES.find(c => c.key === selectedCercle);

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-950 text-white p-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/plan/relationnel">
            <Button variant="ghost" size="sm" className="text-white/40 hover:text-white gap-1">
              <ArrowLeft className="w-4 h-4" /> Retour
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
            <Globe className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Cercle Concentrique d'Honneur</h1>
            <p className="text-white/50 text-sm">Cartographie relationnelle & responsabilités</p>
          </div>
        </div>

        {!selectedCercle ? (
          <div className="space-y-3">
            <p className="text-white/40 text-sm mb-4">Choisis un cercle de responsabilité :</p>
            {CERCLES.map(c => (
              <button key={c.key} onClick={() => setSelectedCercle(c.key)} className="w-full text-left">
                <Card className={`border ${c.color} hover:opacity-90 transition-all`}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">{c.label}</p>
                      <p className="text-xs text-white/40">{c.desc}</p>
                    </div>
                    <span className="text-white/20">→</span>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <button onClick={() => setSelectedCercle(null)} className="text-xs text-white/40 hover:text-white mb-1">
                  ← Tous les cercles
                </button>
                <h2 className="text-lg font-bold">{cercleInfo?.label}</h2>
                <p className="text-xs text-white/40">{cercleInfo?.desc}</p>
              </div>
              <Button onClick={() => setShowForm(!showForm)} size="sm" className="bg-yellow-600 hover:bg-yellow-500 gap-1">
                <Plus className="w-4 h-4" /> Action d'honneur
              </Button>
            </div>

            {showForm && (
              <Card className="border-yellow-500/30 bg-yellow-950/10 mb-4">
                <CardContent className="p-4 space-y-3">
                  <div>
                    <Label className="text-xs text-white/50 mb-1 block">Nom de la personne</Label>
                    <Input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })}
                      placeholder="Qui ?" className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                  </div>
                  <div>
                    <Label className="text-xs text-white/50 mb-1 block">Action d'honneur posée</Label>
                    <Textarea value={form.action_honneur} onChange={e => setForm({ ...form, action_honneur: e.target.value })}
                      placeholder="Qu'as-tu fait concrètement pour honorer cette personne ?" rows={3}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                  </div>
                  <div>
                    <Label className="text-xs text-white/50 mb-1 block">Qualité de l'honneur (1-10) : {form.score}</Label>
                    <input type="range" min="1" max="10" value={form.score}
                      onChange={e => setForm({ ...form, score: e.target.value })}
                      className="w-full accent-yellow-400" />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" onClick={() => setShowForm(false)} className="text-white/40">Annuler</Button>
                    <Button onClick={handleSave} disabled={saving || !form.nom || !form.action_honneur} className="bg-yellow-600 hover:bg-yellow-500">
                      {saving ? "..." : "Sceller l'acte d'honneur"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              {entries.length === 0 ? (
                <Card className="border-dashed border-white/10">
                  <CardContent className="p-8 text-center text-white/40 text-sm">
                    Aucun acte d'honneur enregistré pour ce cercle.
                  </CardContent>
                </Card>
              ) : entries.map(e => {
                const score = (e.notes || "").split(":")[2] || "";
                return (
                  <div key={e.id} className="flex items-start justify-between p-3 rounded-lg border border-white/10 bg-white/5">
                    <div className="flex items-start gap-3">
                      <Heart className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white">{e.title}</p>
                          {score && <span className="text-xs text-yellow-400 bg-yellow-500/10 px-1.5 py-0.5 rounded">{score}/10</span>}
                        </div>
                        <p className="text-xs text-white/50 mt-0.5">{e.description}</p>
                        <p className="text-xs text-white/30 mt-0.5">{e.action_date}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(e.id)} className="text-white/20 hover:text-red-400 transition-colors ml-2">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}