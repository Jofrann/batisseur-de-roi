import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AppLayout from "@/components/layout/AppLayout";
import PillarBadge, { PILLARS } from "@/components/shared/PillarBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Plus, Clock, X, CheckCircle2, Circle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const STATUS_CONFIG = {
  planned: { label: "Planifiée", color: "bg-gray-100 text-gray-600" },
  in_progress: { label: "En cours", color: "bg-blue-100 text-blue-700" },
  completed: { label: "Terminée", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Annulée", color: "bg-red-100 text-red-600" },
};

export default function DailyActions() {
  const [actions, setActions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filterPillar, setFilterPillar] = useState("all");
  const [form, setForm] = useState({
    action_date: new Date().toISOString().split("T")[0],
    pillar: "",
    title: "",
    description: "",
    time_spent_minutes: "",
    progress_percentage: 100,
    status: "completed",
    notes: "",
  });

  useEffect(() => { loadActions(); }, []);

  const loadActions = async () => {
    setLoading(true);
    const data = await base44.entities.DailyActionLogEntry.list("-action_date", 50);
    setActions(data);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.DailyActionLogEntry.create({
      ...form,
      time_spent_minutes: form.time_spent_minutes ? parseInt(form.time_spent_minutes) : undefined,
    });
    setForm({ action_date: new Date().toISOString().split("T")[0], pillar: "", title: "", description: "", time_spent_minutes: "", progress_percentage: 100, status: "completed", notes: "" });
    setShowForm(false);
    await loadActions();
    setSaving(false);
  };

  const toggleStatus = async (action) => {
    const newStatus = action.status === "completed" ? "planned" : "completed";
    await base44.entities.DailyActionLogEntry.update(action.id, { status: newStatus });
    setActions(actions.map(a => a.id === action.id ? { ...a, status: newStatus } : a));
  };

  const handleDelete = async (id) => {
    await base44.entities.DailyActionLogEntry.delete(id);
    setActions(actions.filter(a => a.id !== id));
  };

  const filtered = filterPillar === "all" ? actions : actions.filter(a => a.pillar === filterPillar);

  const totalMinutes = actions.filter(a => a.status === "completed").reduce((s, a) => s + (a.time_spent_minutes || 0), 0);

  return (
    <AppLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><CheckSquare className="w-6 h-6" /> Actions Quotidiennes</h1>
            <p className="text-muted-foreground text-sm mt-1">Suis tes actions et ton temps investi</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="w-4 h-4" /> Nouvelle action
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{actions.filter(a => a.status === "completed").length}</p><p className="text-xs text-muted-foreground">Complétées</p></CardContent></Card>
          <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{Math.round(totalMinutes / 60 * 10) / 10}h</p><p className="text-xs text-muted-foreground">Temps total</p></CardContent></Card>
          <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{actions.filter(a => a.status === "in_progress").length}</p><p className="text-xs text-muted-foreground">En cours</p></CardContent></Card>
        </div>

        {/* Formulaire */}
        {showForm && (
          <Card className="border-2 border-primary/20">
            <CardHeader className="pb-3"><CardTitle className="text-base">Nouvelle action</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Date</Label>
                  <Input type="date" value={form.action_date} onChange={e => setForm({ ...form, action_date: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Pilier</Label>
                  <Select value={form.pillar} onValueChange={v => setForm({ ...form, pillar: v })}>
                    <SelectTrigger><SelectValue placeholder="Pilier" /></SelectTrigger>
                    <SelectContent>{PILLARS.map(p => <SelectItem key={p.key} value={p.key}>{p.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Titre de l'action *</Label>
                <Input placeholder="Ex: Méditation 20 min, Lecture, Sport..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Temps passé (min)</Label>
                  <Input type="number" placeholder="30" value={form.time_spent_minutes} onChange={e => setForm({ ...form, time_spent_minutes: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Statut</Label>
                  <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Notes</Label>
                <Textarea placeholder="Détails complémentaires..." rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
                <Button onClick={handleSave} disabled={saving || !form.title}>{saving ? "Enregistrement..." : "Enregistrer"}</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filtre */}
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant={filterPillar === "all" ? "default" : "outline"} onClick={() => setFilterPillar("all")}>Tous</Button>
          {PILLARS.map(p => (
            <Button key={p.key} size="sm" variant={filterPillar === p.key ? "default" : "outline"} onClick={() => setFilterPillar(p.key)}>{p.label}</Button>
          ))}
        </div>

        {/* Liste */}
        {loading ? (
          <p className="text-sm text-muted-foreground">Chargement...</p>
        ) : filtered.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">Aucune action enregistrée.</CardContent></Card>
        ) : (
          <div className="space-y-2">
            {filtered.map(action => (
              <Card key={action.id} className={`transition-all ${action.status === "completed" ? "opacity-75" : ""}`}>
                <CardContent className="p-4 flex items-start gap-3">
                  <button onClick={() => toggleStatus(action)} className="mt-0.5 shrink-0">
                    {action.status === "completed" ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5 text-muted-foreground" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-medium ${action.status === "completed" ? "line-through text-muted-foreground" : ""}`}>{action.title}</span>
                      {action.pillar && <PillarBadge pillar={action.pillar} />}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{format(new Date(action.action_date), "d MMM", { locale: fr })}</span>
                      {action.time_spent_minutes && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{action.time_spent_minutes} min</span>}
                      <span className={`px-1.5 py-0.5 rounded-full text-xs ${STATUS_CONFIG[action.status]?.color}`}>{STATUS_CONFIG[action.status]?.label}</span>
                    </div>
                    {action.notes && <p className="text-xs text-muted-foreground mt-1">{action.notes}</p>}
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground shrink-0" onClick={() => handleDelete(action.id)}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}