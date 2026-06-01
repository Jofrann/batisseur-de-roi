import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ClipboardList, Plus, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

const TYPES_ENGAGEMENT = [
  "Temps de qualité", "Appel téléphonique", "Repas partagé",
  "Prière ensemble", "Conseil donné", "Encouragement", "Service rendu", "Autre"
];

export default function Engagements() {
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    personne: "",
    type: "",
    duree_minutes: "",
    description: "",
    honore: "oui",
  });

  useEffect(() => { loadEntries(); }, []);

  const loadEntries = async () => {
    const data = await base44.entities.DailyActionLogEntry.filter({ pillar: "relational" }, "-action_date", 60);
    setEntries(data.filter(d => d.notes?.startsWith("ENGAGEMENT:")));
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.DailyActionLogEntry.create({
      action_date: form.date,
      pillar: "relational",
      title: `${form.type} — ${form.personne}`,
      description: form.description,
      time_spent_minutes: parseInt(form.duree_minutes) || 0,
      status: form.honore === "oui" ? "completed" : "cancelled",
      notes: `ENGAGEMENT:${form.personne}:${form.type}:${form.honore}`,
    });
    setForm({ date: new Date().toISOString().slice(0, 10), personne: "", type: "", duree_minutes: "", description: "", honore: "oui" });
    setShowForm(false);
    await loadEntries();
    setSaving(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.DailyActionLogEntry.delete(id);
    setEntries(entries.filter(e => e.id !== id));
  };

  const honores = entries.filter(e => e.status === "completed").length;
  const faillis = entries.filter(e => e.status === "cancelled").length;
  const totalMinutes = entries.filter(e => e.status === "completed").reduce((s, e) => s + (e.time_spent_minutes || 0), 0);

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

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Registre des Engagements</h1>
              <p className="text-white/50 text-sm">Présence qualitative & Actions d'honneur</p>
            </div>
          </div>
          <Button onClick={() => setShowForm(!showForm)} size="sm" className="bg-amber-600 hover:bg-amber-500 gap-1">
            <Plus className="w-4 h-4" /> Enregistrer
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="border-green-500/30 bg-green-950/10">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-green-400">{honores}</p>
              <p className="text-xs text-white/40">Honorés</p>
            </CardContent>
          </Card>
          <Card className="border-red-500/30 bg-red-950/10">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-red-400">{faillis}</p>
              <p className="text-xs text-white/40">Défaillances</p>
            </CardContent>
          </Card>
          <Card className="border-amber-500/30 bg-amber-950/10">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-amber-400">{Math.round(totalMinutes / 60)}h</p>
              <p className="text-xs text-white/40">Temps de qualité</p>
            </CardContent>
          </Card>
        </div>

        {showForm && (
          <Card className="border-amber-500/30 bg-amber-950/10 mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-amber-300">Nouvel engagement de présence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-white/50 mb-1 block">Date</Label>
                  <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                    className="bg-white/5 border-white/10 text-white" />
                </div>
                <div>
                  <Label className="text-xs text-white/50 mb-1 block">Durée (min)</Label>
                  <Input type="number" value={form.duree_minutes} onChange={e => setForm({ ...form, duree_minutes: e.target.value })}
                    placeholder="60" className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                </div>
              </div>
              <div>
                <Label className="text-xs text-white/50 mb-1 block">Avec qui ?</Label>
                <Input value={form.personne} onChange={e => setForm({ ...form, personne: e.target.value })}
                  placeholder="Ex: mon épouse, mes enfants..." className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
              </div>
              <div>
                <Label className="text-xs text-white/50 mb-1 block">Type d'engagement</Label>
                <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPES_ENGAGEMENT.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-white/50 mb-1 block">Description</Label>
                <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Décris l'engagement posé..." rows={2}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
              </div>
              <div>
                <Label className="text-xs text-white/50 mb-1 block">Engagement honoré ?</Label>
                <div className="flex gap-2">
                  <button onClick={() => setForm({ ...form, honore: "oui" })}
                    className={`flex-1 py-2 rounded-lg border text-sm transition-all ${form.honore === "oui" ? "border-green-400 bg-green-500/20 text-green-400" : "border-white/10 text-white/40"}`}>
                    ✓ Oui, honoré
                  </button>
                  <button onClick={() => setForm({ ...form, honore: "non" })}
                    className={`flex-1 py-2 rounded-lg border text-sm transition-all ${form.honore === "non" ? "border-red-400 bg-red-500/20 text-red-400" : "border-white/10 text-white/40"}`}>
                    ✗ Défaillance
                  </button>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setShowForm(false)} className="text-white/40">Annuler</Button>
                <Button onClick={handleSave} disabled={saving || !form.personne || !form.type} className="bg-amber-600 hover:bg-amber-500">
                  {saving ? "..." : "Sceller l'engagement"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          {entries.length === 0 ? (
            <Card className="border-dashed border-white/10">
              <CardContent className="p-8 text-center text-white/40 text-sm">
                Aucun engagement enregistré. L'honneur se mesure en actes.
              </CardContent>
            </Card>
          ) : entries.map(e => {
            const isHonored = e.status === "completed";
            const parts = (e.notes || "").split(":");
            const personne = parts[1] || "";
            const type = parts[2] || "";
            return (
              <div key={e.id} className={`flex items-start justify-between p-3 rounded-lg border ${
                isHonored ? "border-green-500/20 bg-green-950/5" : "border-red-500/20 bg-red-950/5"
              }`}>
                <div className="flex items-start gap-3">
                  {isHonored
                    ? <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    : <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  }
                  <div>
                    <p className="text-sm font-medium text-white">{e.title}</p>
                    <div className="flex gap-2 text-xs text-white/40 mt-0.5">
                      <span>{e.action_date}</span>
                      {e.time_spent_minutes > 0 && <span>· {e.time_spent_minutes} min</span>}
                    </div>
                    {e.description && <p className="text-xs text-white/50 mt-0.5 italic">{e.description}</p>}
                  </div>
                </div>
                <button onClick={() => handleDelete(e.id)} className="text-white/20 hover:text-red-400 transition-colors ml-2 mt-0.5">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}