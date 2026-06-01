import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Calendar, Plus, Clock, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const BLOCS = [
  { key: "sacre", label: "🙏 Bloc Sacré", desc: "Prière, Parole, Intimité", color: "border-purple-500/30 bg-purple-950/10", textColor: "text-purple-300" },
  { key: "temple", label: "💪 Bloc Temple", desc: "Sport, Santé, Corps", color: "border-orange-500/30 bg-orange-950/10", textColor: "text-orange-300" },
  { key: "conquete", label: "⚔️ Bloc Conquête", desc: "Travail, Mission, Projets", color: "border-yellow-500/30 bg-yellow-950/10", textColor: "text-yellow-300" },
  { key: "honneur", label: "🤝 Bloc Honneur", desc: "Famille, Relations, Cercles", color: "border-green-500/30 bg-green-950/10", textColor: "text-green-300" },
];

export default function Planificateur() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [tasks, setTasks] = useState({});
  const [newTask, setNewTask] = useState({ bloc: "", titre: "", heure_debut: "", heure_fin: "" });
  const [showForm, setShowForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadTasks(); }, [selectedDate]);

  const loadTasks = async () => {
    const data = await base44.entities.DailyActionLogEntry.filter({ action_date: selectedDate }, "created_date", 100);
    const grouped = {};
    BLOCS.forEach(b => { grouped[b.key] = []; });
    data.forEach(t => {
      const bloc = t.notes?.replace("BLOC:", "") || "conquete";
      if (grouped[bloc]) grouped[bloc].push(t);
    });
    setTasks(grouped);
  };

  const handleAdd = async (blocKey) => {
    if (!newTask.titre) return;
    setSaving(true);
    await base44.entities.DailyActionLogEntry.create({
      action_date: selectedDate,
      pillar: "time_management",
      title: newTask.titre,
      description: newTask.heure_debut && newTask.heure_fin ? `${newTask.heure_debut} → ${newTask.heure_fin}` : "",
      status: "planned",
      notes: `BLOC:${blocKey}`,
    });
    setNewTask({ bloc: "", titre: "", heure_debut: "", heure_fin: "" });
    setShowForm(null);
    await loadTasks();
    setSaving(false);
  };

  const toggleStatus = async (task) => {
    const newStatus = task.status === "completed" ? "planned" : "completed";
    await base44.entities.DailyActionLogEntry.update(task.id, { status: newStatus });
    await loadTasks();
  };

  const handleDelete = async (id) => {
    await base44.entities.DailyActionLogEntry.delete(id);
    await loadTasks();
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-950 text-white p-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/plan/temps">
            <Button variant="ghost" size="sm" className="text-white/40 hover:text-white gap-1">
              <ArrowLeft className="w-4 h-4" /> Retour
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Planificateur Directif</h1>
              <p className="text-white/50 text-sm">4 Blocs souverains de la journée</p>
            </div>
          </div>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
            className="bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-1.5" />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {BLOCS.map(bloc => (
            <Card key={bloc.key} className={`border ${bloc.color}`}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-sm font-bold ${bloc.textColor}`}>{bloc.label}</CardTitle>
                <p className="text-xs text-white/30">{bloc.desc}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {(tasks[bloc.key] || []).map(t => (
                  <div key={t.id} className="flex items-center gap-2">
                    <button onClick={() => toggleStatus(t)}
                      className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all ${
                        t.status === "completed" ? "bg-green-500 border-green-500" : "border-white/20"
                      }`}>
                      {t.status === "completed" && <span className="text-white text-xs">✓</span>}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${t.status === "completed" ? "line-through text-white/30" : "text-white"}`}>
                        {t.title}
                      </p>
                      {t.description && <p className="text-xs text-white/30">{t.description}</p>}
                    </div>
                    <button onClick={() => handleDelete(t.id)} className="text-white/10 hover:text-red-400 shrink-0">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {showForm === bloc.key ? (
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <Input value={newTask.titre} onChange={e => setNewTask({ ...newTask, titre: e.target.value })}
                      placeholder="Titre de la tâche..." className="bg-white/5 border-white/10 text-white text-sm placeholder:text-white/30 h-8" />
                    <div className="flex gap-2">
                      <Input type="time" value={newTask.heure_debut} onChange={e => setNewTask({ ...newTask, heure_debut: e.target.value })}
                        className="bg-white/5 border-white/10 text-white text-xs h-8 flex-1" />
                      <Input type="time" value={newTask.heure_fin} onChange={e => setNewTask({ ...newTask, heure_fin: e.target.value })}
                        className="bg-white/5 border-white/10 text-white text-xs h-8 flex-1" />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleAdd(bloc.key)} disabled={saving || !newTask.titre}
                        className="flex-1 h-7 text-xs bg-blue-600 hover:bg-blue-500">
                        Ajouter
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowForm(null)} className="h-7 text-xs text-white/30">
                        Annuler
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowForm(bloc.key)}
                    className="w-full flex items-center gap-2 text-xs text-white/30 hover:text-white/60 pt-1 transition-colors">
                    <Plus className="w-3 h-3" /> Ajouter une tâche
                  </button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}