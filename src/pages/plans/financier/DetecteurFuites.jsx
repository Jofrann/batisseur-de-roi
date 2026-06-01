import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, AlertTriangle, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

const TRIGGERS_EMOTIONNELS = [
  "Stress au travail", "Conflit relationnel", "Sentiment de rejet",
  "Solitude / ennui", "Peur du futur", "Célébration impulsive", "Autre"
];

export default function DetecteurFuites() {
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    montant: "",
    description: "",
    trigger: "",
    regret_score: "5",
    lecon: "",
  });

  useEffect(() => { loadEntries(); }, []);

  const loadEntries = async () => {
    setLoading(true);
    const data = await base44.entities.DailyJournalEntry.filter({ pillar: "emotional" }, "-entry_date", 50);
    const fuites = data.filter(d => d.blockers?.startsWith("FUITE:"));
    setEntries(fuites);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.DailyJournalEntry.create({
      entry_date: form.date,
      pillar: "emotional",
      content: `Dépense impulsive : ${form.description} — ${form.montant}€`,
      blockers: `FUITE:${form.trigger}:${form.regret_score}`,
      gratitude: form.lecon,
      mood_score: 11 - parseInt(form.regret_score),
    });
    setForm({ date: new Date().toISOString().slice(0, 10), montant: "", description: "", trigger: "", regret_score: "5", lecon: "" });
    setShowForm(false);
    await loadEntries();
    setSaving(false);
  };

  const totalFuites = entries.reduce((sum, e) => {
    const match = e.content.match(/— ([\d.]+)€/);
    return sum + (match ? parseFloat(match[1]) : 0);
  }, 0);

  const handleDelete = async (id) => {
    await base44.entities.DailyJournalEntry.delete(id);
    setEntries(entries.filter(e => e.id !== id));
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-950 text-white p-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/plan/financier">
            <Button variant="ghost" size="sm" className="text-white/40 hover:text-white gap-1">
              <ArrowLeft className="w-4 h-4" /> Retour
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Détecteur de Fuites Émotionnelles</h1>
            <p className="text-white/50 text-sm">Dépenses impulsives liées à l'état de l'âme</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} size="sm" className="bg-red-600 hover:bg-red-500 gap-1">
            <Plus className="w-4 h-4" /> Déclarer
          </Button>
        </div>

        {/* Counter */}
        <Card className="border-red-500/30 bg-red-950/20 mb-6">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <div>
                <p className="text-sm text-white/60">Total des fuites déclarées</p>
                <p className="text-xs text-white/30">{entries.length} incident(s) enregistré(s)</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-red-400">-{totalFuites.toFixed(2)} €</p>
          </CardContent>
        </Card>

        {showForm && (
          <Card className="border-red-500/30 bg-red-950/10 mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-red-300">Déclarer une fuite émotionnelle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-white/50 mb-1 block">Date</Label>
                  <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                    className="bg-white/5 border-white/10 text-white" />
                </div>
                <div>
                  <Label className="text-xs text-white/50 mb-1 block">Montant (€)</Label>
                  <Input type="number" value={form.montant} onChange={e => setForm({ ...form, montant: e.target.value })}
                    placeholder="0.00" className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                </div>
              </div>
              <div>
                <Label className="text-xs text-white/50 mb-1 block">Quoi as-tu acheté / dépensé ?</Label>
                <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Ex: commande sur Amazon, restaurant..." className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
              </div>
              <div>
                <Label className="text-xs text-white/50 mb-1 block">Déclencheur émotionnel</Label>
                <div className="flex flex-wrap gap-2">
                  {TRIGGERS_EMOTIONNELS.map(t => (
                    <button key={t} onClick={() => setForm({ ...form, trigger: t })}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                        form.trigger === t ? "border-red-400 bg-red-500/20 text-white" : "border-white/10 text-white/50 hover:text-white"
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs text-white/50 mb-1 block">Score de regret (1-10) : {form.regret_score}</Label>
                <input type="range" min="1" max="10" value={form.regret_score}
                  onChange={e => setForm({ ...form, regret_score: e.target.value })}
                  className="w-full accent-red-400" />
              </div>
              <div>
                <Label className="text-xs text-white/50 mb-1 block">Leçon / décision pour l'avenir</Label>
                <Textarea value={form.lecon} onChange={e => setForm({ ...form, lecon: e.target.value })}
                  placeholder="Qu'est-ce que cette fuite t'apprend sur toi ?" rows={2}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setShowForm(false)} className="text-white/40">Annuler</Button>
                <Button onClick={handleSave} disabled={saving || !form.montant || !form.description} className="bg-red-600 hover:bg-red-500">
                  {saving ? "..." : "Enregistrer la fuite"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          {entries.length === 0 ? (
            <Card className="border-dashed border-white/10">
              <CardContent className="p-8 text-center text-white/40 text-sm">
                Aucune fuite déclarée. Transparence totale requise.
              </CardContent>
            </Card>
          ) : entries.map(e => {
            const parts = (e.blockers || "").split(":");
            const trigger = parts[1] || "";
            const regret = parts[2] || "";
            const amountMatch = e.content.match(/— ([\d.]+)€/);
            const amount = amountMatch ? amountMatch[1] : "?";
            return (
              <div key={e.id} className="flex items-start justify-between p-3 rounded-lg border border-red-500/20 bg-red-950/10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-sm font-medium text-white">{e.content.replace(/Dépense impulsive : /, "").replace(/ — [\d.]+€/, "")}</span>
                    <span className="text-red-400 font-bold">-{amount}€</span>
                  </div>
                  <div className="flex gap-2 text-xs text-white/40">
                    <span>{e.entry_date}</span>
                    {trigger && <span>· Trigger : {trigger}</span>}
                    {regret && <span>· Regret : {regret}/10</span>}
                  </div>
                  {e.gratitude && <p className="text-xs text-white/50 mt-1 italic">{e.gratitude}</p>}
                </div>
                <button onClick={() => handleDelete(e.id)} className="text-white/20 hover:text-red-400 transition-colors ml-3 mt-1">
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