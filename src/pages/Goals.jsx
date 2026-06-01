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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, Plus, X, ChevronDown, ChevronUp, Edit2, Check } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Entité générique pour tous les objectifs (on utilise GoalTemplate comme référentiel)
// On crée une entité unifiée Goal

const STATUS_OPTIONS = [
  { value: "not_started", label: "Non démarré", color: "bg-gray-100 text-gray-600" },
  { value: "in_progress", label: "En cours", color: "bg-blue-100 text-blue-700" },
  { value: "completed", label: "Complété", color: "bg-green-100 text-green-700" },
  { value: "paused", label: "En pause", color: "bg-yellow-100 text-yellow-700" },
];

export default function Goals() {
  const [templates, setTemplates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filterPillar, setFilterPillar] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    pillar: "",
    title: "",
    description: "",
    suggested_duration_months: 12,
    difficulty_level: "moyen",
    is_active: true,
    suggested_actions: [],
  });
  const [newAction, setNewAction] = useState("");

  useEffect(() => { loadGoals(); }, []);

  const loadGoals = async () => {
    setLoading(true);
    const data = await base44.entities.GoalTemplate.list("-created_date", 100);
    setTemplates(data);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    if (editingId) {
      await base44.entities.GoalTemplate.update(editingId, form);
    } else {
      await base44.entities.GoalTemplate.create(form);
    }
    setForm({ pillar: "", title: "", description: "", suggested_duration_months: 12, difficulty_level: "moyen", is_active: true, suggested_actions: [] });
    setShowForm(false);
    setEditingId(null);
    await loadGoals();
    setSaving(false);
  };

  const handleEdit = (goal) => {
    setForm({ ...goal });
    setEditingId(goal.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    await base44.entities.GoalTemplate.delete(id);
    setTemplates(templates.filter(t => t.id !== id));
  };

  const toggleActive = async (goal) => {
    await base44.entities.GoalTemplate.update(goal.id, { is_active: !goal.is_active });
    setTemplates(templates.map(t => t.id === goal.id ? { ...t, is_active: !t.is_active } : t));
  };

  const addAction = () => {
    if (newAction.trim()) {
      setForm({ ...form, suggested_actions: [...(form.suggested_actions || []), newAction.trim()] });
      setNewAction("");
    }
  };

  const removeAction = (i) => {
    setForm({ ...form, suggested_actions: form.suggested_actions.filter((_, idx) => idx !== i) });
  };

  const filtered = filterPillar === "all" ? templates : templates.filter(t => t.pillar === filterPillar);
  const byPillar = PILLARS.map(p => ({
    ...p,
    goals: filtered.filter(g => g.pillar === p.key),
  })).filter(p => filterPillar === "all" || p.key === filterPillar);

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Target className="w-6 h-6" /> Objectifs 3 Ans</h1>
            <p className="text-muted-foreground text-sm mt-1">Définis et suis tes objectifs par pilier</p>
          </div>
          <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ pillar: "", title: "", description: "", suggested_duration_months: 12, difficulty_level: "moyen", is_active: true, suggested_actions: [] }); }} className="gap-2">
            <Plus className="w-4 h-4" /> Nouvel objectif
          </Button>
        </div>

        {/* Formulaire */}
        {showForm && (
          <Card className="border-2 border-primary/20">
            <CardHeader className="pb-3"><CardTitle className="text-base">{editingId ? "Modifier l'objectif" : "Nouvel objectif"}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Pilier *</Label>
                  <Select value={form.pillar} onValueChange={v => setForm({ ...form, pillar: v })}>
                    <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                    <SelectContent>{PILLARS.map(p => <SelectItem key={p.key} value={p.key}>{p.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Difficulté</Label>
                  <Select value={form.difficulty_level} onValueChange={v => setForm({ ...form, difficulty_level: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="facile">Facile</SelectItem>
                      <SelectItem value="moyen">Moyen</SelectItem>
                      <SelectItem value="difficile">Difficile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Titre de l'objectif *</Label>
                <Input placeholder="Ex: Lire 24 livres en 2 ans, Atteindre 80kg..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea placeholder="Pourquoi cet objectif est important pour toi ?" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Durée suggérée (mois)</Label>
                <Input type="number" value={form.suggested_duration_months} onChange={e => setForm({ ...form, suggested_duration_months: parseInt(e.target.value) })} className="w-32" />
              </div>
              <div className="space-y-2">
                <Label>Actions types</Label>
                <div className="flex gap-2">
                  <Input placeholder="Ajouter une action type..." value={newAction} onChange={e => setNewAction(e.target.value)} onKeyDown={e => e.key === "Enter" && addAction()} />
                  <Button type="button" variant="outline" size="sm" onClick={addAction}>Ajouter</Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(form.suggested_actions || []).map((a, i) => (
                    <span key={i} className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded-full text-xs">
                      {a}
                      <button onClick={() => removeAction(i)} className="text-muted-foreground hover:text-foreground"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>Annuler</Button>
                <Button onClick={handleSave} disabled={saving || !form.title || !form.pillar}>{saving ? "Enregistrement..." : "Enregistrer"}</Button>
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

        {/* Liste par pilier */}
        {loading ? (
          <p className="text-sm text-muted-foreground">Chargement...</p>
        ) : (
          <div className="space-y-4">
            {byPillar.map(p => p.goals.length > 0 && (
              <div key={p.key}>
                <div className="flex items-center gap-2 mb-2">
                  <PillarBadge pillar={p.key} />
                  <span className="text-xs text-muted-foreground">{p.goals.length} objectif{p.goals.length > 1 ? "s" : ""}</span>
                </div>
                <div className="space-y-2">
                  {p.goals.map(goal => (
                    <Card key={goal.id} className={`transition-all ${!goal.is_active ? "opacity-60" : ""}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium">{goal.title}</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                goal.difficulty_level === "facile" ? "bg-green-100 text-green-700"
                                : goal.difficulty_level === "difficile" ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                              }`}>{goal.difficulty_level}</span>
                              {!goal.is_active && <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">Inactif</span>}
                            </div>
                            {goal.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{goal.description}</p>}
                            <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                              {goal.suggested_duration_months && <span>📅 {goal.suggested_duration_months} mois</span>}
                              {goal.suggested_actions?.length > 0 && <span>📋 {goal.suggested_actions.length} actions types</span>}
                            </div>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(goal)}><Edit2 className="w-3.5 h-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleActive(goal)}>
                              {goal.is_active ? <X className="w-3.5 h-3.5 text-muted-foreground" /> : <Check className="w-3.5 h-3.5 text-green-600" />}
                            </Button>
                          </div>
                        </div>

                        {goal.suggested_actions?.length > 0 && expandedId === goal.id && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <p className="text-xs font-medium mb-2">Actions types :</p>
                            <ul className="space-y-1">
                              {goal.suggested_actions.map((a, i) => (
                                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                  <span className="text-primary mt-0.5">•</span>{a}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {goal.suggested_actions?.length > 0 && (
                          <button onClick={() => setExpandedId(expandedId === goal.id ? null : goal.id)} className="mt-2 text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground">
                            {expandedId === goal.id ? <><ChevronUp className="w-3 h-3" /> Réduire</> : <><ChevronDown className="w-3 h-3" /> Voir les actions types</>}
                          </button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <Card><CardContent className="p-8 text-center text-muted-foreground">Aucun objectif. Commence à définir ton plan !</CardContent></Card>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}