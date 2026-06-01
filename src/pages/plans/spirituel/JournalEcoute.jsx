import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, BookHeart, Plus, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function JournalEcoute() {
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    entry_date: format(new Date(), "yyyy-MM-dd"),
    direction_recue: "",
    reference_scripturaire: "",
    action_concrete: "",
    manifestation: "",
    statut: "en_attente",
  });

  useEffect(() => { loadEntries(); }, []);

  const loadEntries = async () => {
    const data = await base44.entities.DailyJournalEntry.filter({ pillar: "spiritual" }, "-entry_date", 50);
    setEntries(data);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.DailyJournalEntry.create({
      entry_date: form.entry_date,
      pillar: "spiritual",
      content: form.direction_recue,
      gratitude: `Référence : ${form.reference_scripturaire}\nAction : ${form.action_concrete}\nManifestation : ${form.manifestation}\nStatut : ${form.statut}`,
    });
    setForm({ entry_date: format(new Date(), "yyyy-MM-dd"), direction_recue: "", reference_scripturaire: "", action_concrete: "", manifestation: "", statut: "en_attente" });
    setShowForm(false);
    await loadEntries();
    setSaving(false);
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-950 text-white p-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/plan/spirituel">
            <Button variant="ghost" size="sm" className="text-white/40 hover:text-white gap-1">
              <ArrowLeft className="w-4 h-4" /> Retour
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <BookHeart className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Journal d'Écoute</h1>
              <p className="text-white/50 text-sm">Bloc Sacré du matin — Intimité & Direction</p>
            </div>
          </div>
          <Button onClick={() => setShowForm(!showForm)} size="sm" className="bg-indigo-600 hover:bg-indigo-500 gap-1">
            <Plus className="w-4 h-4" /> Nouvelle entrée
          </Button>
        </div>

        {showForm && (
          <Card className="border-indigo-500/30 bg-indigo-950/20 mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-indigo-300">Direction reçue ce matin</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-white/60 text-xs">Date</Label>
                <Input type="date" value={form.entry_date} onChange={e => setForm({ ...form, entry_date: e.target.value })}
                  className="bg-white/5 border-white/10 text-white" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/60 text-xs">Direction / parole reçue *</Label>
                <Textarea value={form.direction_recue} onChange={e => setForm({ ...form, direction_recue: e.target.value })}
                  placeholder="Qu'est-ce que l'Esprit t'a dit ce matin ?" rows={4}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/60 text-xs">Référence scripturaire</Label>
                <Input value={form.reference_scripturaire} onChange={e => setForm({ ...form, reference_scripturaire: e.target.value })}
                  placeholder="Ex : Jérémie 29:11" className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/60 text-xs">Action concrète à poser</Label>
                <Input value={form.action_concrete} onChange={e => setForm({ ...form, action_concrete: e.target.value })}
                  placeholder="Quelle action spécifique dois-tu poser ?" className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/60 text-xs">Manifestation observée (si accomplie)</Label>
                <Textarea value={form.manifestation} onChange={e => setForm({ ...form, manifestation: e.target.value })}
                  placeholder="Comment cette direction s'est-elle manifestée concrètement ?" rows={2}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="ghost" onClick={() => setShowForm(false)} className="text-white/40">Annuler</Button>
                <Button onClick={handleSave} disabled={saving || !form.direction_recue} className="bg-indigo-600 hover:bg-indigo-500">
                  {saving ? "Enregistrement..." : "Sceller cette direction"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <p className="text-white/40 text-sm">Chargement...</p>
        ) : entries.length === 0 ? (
          <Card className="border-dashed border-white/10 bg-white/5">
            <CardContent className="p-8 text-center text-white/40">
              Aucune direction enregistrée. Commence ton bloc sacré du matin.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {entries.map(entry => (
              <Card key={entry.id} className="border-white/10 bg-white/5">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-xs text-white/40">
                          {entry.entry_date ? format(new Date(entry.entry_date), "EEEE d MMMM yyyy", { locale: fr }) : "—"}
                        </span>
                      </div>
                      <p className="text-sm text-white line-clamp-2">{entry.content}</p>
                    </div>
                    <button onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                      className="text-white/30 hover:text-white ml-3">
                      {expandedId === entry.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                  {expandedId === entry.id && entry.gratitude && (
                    <div className="mt-3 pt-3 border-t border-white/10 text-xs text-white/60 whitespace-pre-line">
                      {entry.gratitude}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}