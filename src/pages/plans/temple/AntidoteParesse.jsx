import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Flame, CheckCircle2, Upload, Dumbbell } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const TYPES_SESSION = [
  "Musculation", "Course / Cardio", "HIIT", "Yoga / Stretching",
  "Sport collectif", "Natation", "Arts martiaux", "Autre"
];

export default function AntidoteParesse() {
  const [sessions, setSessions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [streak, setStreak] = useState(0);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    type: "",
    duree: "",
    intensite: "7",
    description: "",
  });

  useEffect(() => { loadSessions(); }, []);

  const loadSessions = async () => {
    const data = await base44.entities.DailyActionLogEntry.filter({ pillar: "physical" }, "-action_date", 60);
    const sessions = data.filter(d => d.notes?.startsWith("SPORT:") && d.status === "completed");
    setSessions(sessions);
    calculateStreak(sessions);
  };

  const calculateStreak = (sessions) => {
    if (!sessions.length) { setStreak(0); return; }
    let count = 0;
    const today = new Date();
    const sorted = [...sessions].sort((a, b) => new Date(b.action_date) - new Date(a.action_date));
    const unique = [...new Set(sorted.map(s => s.action_date))];
    for (let i = 0; i < unique.length; i++) {
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);
      if (unique[i] === expected.toISOString().slice(0, 10)) count++;
      else break;
    }
    setStreak(count);
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.DailyActionLogEntry.create({
      action_date: form.date,
      pillar: "physical",
      title: `${form.type} — ${form.duree} min`,
      description: form.description,
      time_spent_minutes: parseInt(form.duree) || 0,
      progress_percentage: parseInt(form.intensite) * 10,
      status: "completed",
      notes: `SPORT:${form.type}:${form.intensite}`,
    });
    setForm({ date: new Date().toISOString().slice(0, 10), type: "", duree: "", intensite: "7", description: "" });
    setShowForm(false);
    await loadSessions();
    setSaving(false);
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const sessionAujourdhui = sessions.find(s => s.action_date === todayStr);

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-950 text-white p-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/plan/temple">
            <Button variant="ghost" size="sm" className="text-white/40 hover:text-white gap-1">
              <ArrowLeft className="w-4 h-4" /> Retour
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
              <Flame className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Antidote de la Paresse</h1>
              <p className="text-white/50 text-sm">Validation des routines — Tolérance zéro</p>
            </div>
          </div>
          <Button onClick={() => setShowForm(!showForm)} size="sm" className="bg-red-600 hover:bg-red-500 gap-1">
            <Dumbbell className="w-4 h-4" /> Valider
          </Button>
        </div>

        {/* Status aujourd'hui + Streak */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className={`border ${sessionAujourdhui ? "border-green-500/30 bg-green-950/20" : "border-red-500/30 bg-red-950/20"}`}>
            <CardContent className="p-4 flex items-center gap-3">
              {sessionAujourdhui
                ? <CheckCircle2 className="w-8 h-8 text-green-400" />
                : <Flame className="w-8 h-8 text-red-400" />
              }
              <div>
                <p className="font-bold text-white">{sessionAujourdhui ? "✓ Fait !" : "⚠ Pas encore"}</p>
                <p className="text-xs text-white/40">Aujourd'hui</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-yellow-500/30 bg-yellow-950/20">
            <CardContent className="p-4 flex items-center gap-3">
              <span className="text-3xl font-bold text-yellow-400">{streak}</span>
              <div>
                <p className="font-bold text-white">jours consécutifs</p>
                <p className="text-xs text-white/40">Série actuelle 🔥</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {showForm && (
          <Card className="border-red-500/30 bg-red-950/10 mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-red-300">Valider une session physique</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-white/50 mb-1 block">Date</Label>
                  <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                    className="bg-white/5 border-white/10 text-white" />
                </div>
                <div>
                  <Label className="text-xs text-white/50 mb-1 block">Durée (minutes)</Label>
                  <Input type="number" value={form.duree} onChange={e => setForm({ ...form, duree: e.target.value })}
                    placeholder="45" className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                </div>
              </div>
              <div>
                <Label className="text-xs text-white/50 mb-1 block">Type de session</Label>
                <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPES_SESSION.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-white/50 mb-1 block">Intensité (1-10) : {form.intensite}</Label>
                <input type="range" min="1" max="10" value={form.intensite}
                  onChange={e => setForm({ ...form, intensite: e.target.value })}
                  className="w-full accent-red-400" />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setShowForm(false)} className="text-white/40">Annuler</Button>
                <Button onClick={handleSave} disabled={saving || !form.type || !form.duree} className="bg-red-600 hover:bg-red-500">
                  {saving ? "..." : "Valider la session ✓"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          {sessions.length === 0 ? (
            <Card className="border-dashed border-white/10">
              <CardContent className="p-8 text-center text-white/40 text-sm">
                Aucune session validée. Le temple ne se construit pas sans discipline.
              </CardContent>
            </Card>
          ) : sessions.slice(0, 15).map(s => {
            const parts = (s.notes || "").split(":");
            const type = parts[1] || "";
            const intensite = parts[2] || "";
            return (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-white">{type}</p>
                    <p className="text-xs text-white/40">{s.action_date} · {s.time_spent_minutes} min{intensite ? ` · Intensité ${intensite}/10` : ""}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}