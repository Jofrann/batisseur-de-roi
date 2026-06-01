import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AppLayout from "@/components/layout/AppLayout";
import PillarBadge, { PILLARS } from "@/components/shared/PillarBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { BookOpen, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const MOOD_LABELS = { 1: "😞 Très bas", 3: "😟 Bas", 5: "😐 Moyen", 7: "🙂 Bien", 9: "😄 Excellent" };

export default function DailyJournal() {
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    entry_date: new Date().toISOString().split("T")[0],
    pillar: "",
    mood_score: 5,
    content: "",
    blockers: "",
    gratitude: "",
  });

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    setLoading(true);
    const data = await base44.entities.DailyJournalEntry.list("-entry_date", 30);
    setEntries(data);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.DailyJournalEntry.create(form);
    setForm({ entry_date: new Date().toISOString().split("T")[0], pillar: "", mood_score: 5, content: "", blockers: "", gratitude: "" });
    setShowForm(false);
    await loadEntries();
    setSaving(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.DailyJournalEntry.delete(id);
    setEntries(entries.filter(e => e.id !== id));
  };

  const getMoodLabel = (score) => {
    const keys = [1, 3, 5, 7, 9];
    const closest = keys.reduce((a, b) => Math.abs(b - score) < Math.abs(a - score) ? b : a);
    return MOOD_LABELS[closest];
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="w-6 h-6" /> Journal Quotidien</h1>
            <p className="text-muted-foreground text-sm mt-1">Documente tes réflexions et ressentis</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="w-4 h-4" /> Nouvelle entrée
          </Button>
        </div>

        {/* Formulaire */}
        {showForm && (
          <Card className="border-2 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Nouvelle entrée de journal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Date</Label>
                  <Input type="date" value={form.entry_date} onChange={e => setForm({ ...form, entry_date: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Pilier</Label>
                  <Select value={form.pillar} onValueChange={v => setForm({ ...form, pillar: v })}>
                    <SelectTrigger><SelectValue placeholder="Choisir un pilier" /></SelectTrigger>
                    <SelectContent>
                      {PILLARS.map(p => <SelectItem key={p.key} value={p.key}>{p.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Humeur du jour : <strong>{getMoodLabel(form.mood_score)}</strong> ({form.mood_score}/10)</Label>
                <Slider min={1} max={10} step={1} value={[form.mood_score]} onValueChange={([v]) => setForm({ ...form, mood_score: v })} />
              </div>
              <div className="space-y-1.5">
                <Label>Réflexion du jour *</Label>
                <Textarea placeholder="Qu'est-ce qui s'est passé aujourd'hui ? Quelles leçons en tires-tu ?" rows={4} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Points de blocage</Label>
                <Textarea placeholder="Qu'est-ce qui t'a freiné ou posé problème ?" rows={2} value={form.blockers} onChange={e => setForm({ ...form, blockers: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Gratitude</Label>
                <Textarea placeholder="Pour quoi es-tu reconnaissant aujourd'hui ?" rows={2} value={form.gratitude} onChange={e => setForm({ ...form, gratitude: e.target.value })} />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
                <Button onClick={handleSave} disabled={saving || !form.content}>
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Liste des entrées */}
        {loading ? (
          <p className="text-muted-foreground text-sm">Chargement...</p>
        ) : entries.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">Aucune entrée pour l'instant. Commence à écrire !</CardContent></Card>
        ) : (
          <div className="space-y-4">
            {entries.map(entry => (
              <Card key={entry.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold">{format(new Date(entry.entry_date), "d MMMM yyyy", { locale: fr })}</span>
                      {entry.pillar && <PillarBadge pillar={entry.pillar} />}
                      {entry.mood_score && <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{getMoodLabel(entry.mood_score)}</span>}
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => handleDelete(entry.id)}>
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{entry.content}</p>
                  {entry.blockers && (
                    <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700 border border-red-100">
                      🚧 <strong>Blocage :</strong> {entry.blockers}
                    </div>
                  )}
                  {entry.gratitude && (
                    <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-700 border border-green-100">
                      🙏 <strong>Gratitude :</strong> {entry.gratitude}
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