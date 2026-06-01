import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Activity, Moon, Droplets, Apple } from "lucide-react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const TARGETS = { sommeil: 8, hydratation: 2.5, poids_objectif: 75 };

export default function CadranVitalite() {
  const [entries, setEntries] = useState([]);
  const [today, setToday] = useState({
    date: new Date().toISOString().slice(0, 10),
    sommeil: "",
    hydratation: "",
    poids: "",
    energie: "7",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { loadEntries(); }, []);

  const loadEntries = async () => {
    const data = await base44.entities.DailyActionLogEntry.filter({ pillar: "physical" }, "-action_date", 30);
    const vitality = data.filter(d => d.notes?.startsWith("VITAL:"));
    setEntries(vitality);
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.DailyActionLogEntry.create({
      action_date: today.date,
      pillar: "physical",
      title: `Vitalité ${today.date}`,
      description: `Sommeil:${today.sommeil}h Eau:${today.hydratation}L Poids:${today.poids}kg`,
      time_spent_minutes: Math.round(parseFloat(today.energie || 7) * 10),
      status: "completed",
      notes: `VITAL:${today.sommeil}:${today.hydratation}:${today.poids}:${today.energie}`,
    });
    setSaved(true);
    setSaving(false);
    loadEntries();
  };

  const parseEntry = (e) => {
    const parts = (e.notes || "").replace("VITAL:", "").split(":");
    return {
      date: e.action_date,
      sommeil: parseFloat(parts[0]) || 0,
      hydratation: parseFloat(parts[1]) || 0,
      poids: parseFloat(parts[2]) || 0,
      energie: parseFloat(parts[3]) || 0,
    };
  };

  const chartData = entries.slice(0, 14).reverse().map(e => {
    const p = parseEntry(e);
    return { date: p.date.slice(5), sommeil: p.sommeil, hydratation: p.hydratation, energie: p.energie };
  });

  const latest = entries[0] ? parseEntry(entries[0]) : null;

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

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
            <Activity className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Cadran de Vitalité Métabolique</h1>
            <p className="text-white/50 text-sm">Sommeil · Hydratation · Nutrition · Énergie</p>
          </div>
        </div>

        {/* Indicateurs du jour */}
        {latest && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <Card className={`border ${latest.sommeil >= TARGETS.sommeil ? "border-green-500/30 bg-green-950/10" : "border-red-500/30 bg-red-950/10"}`}>
              <CardContent className="p-3 text-center">
                <Moon className="w-4 h-4 mx-auto mb-1 text-indigo-400" />
                <p className="text-lg font-bold">{latest.sommeil}h</p>
                <p className="text-xs text-white/40">Sommeil</p>
                <p className="text-xs text-white/30">cible : {TARGETS.sommeil}h</p>
              </CardContent>
            </Card>
            <Card className={`border ${latest.hydratation >= TARGETS.hydratation ? "border-green-500/30 bg-green-950/10" : "border-red-500/30 bg-red-950/10"}`}>
              <CardContent className="p-3 text-center">
                <Droplets className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                <p className="text-lg font-bold">{latest.hydratation}L</p>
                <p className="text-xs text-white/40">Hydratation</p>
                <p className="text-xs text-white/30">cible : {TARGETS.hydratation}L</p>
              </CardContent>
            </Card>
            <Card className="border-orange-500/30 bg-orange-950/10">
              <CardContent className="p-3 text-center">
                <Apple className="w-4 h-4 mx-auto mb-1 text-orange-400" />
                <p className="text-lg font-bold">{latest.energie}/10</p>
                <p className="text-xs text-white/40">Énergie</p>
                <p className="text-xs text-white/30">{latest.poids ? `${latest.poids} kg` : "—"}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Formulaire saisie */}
        <Card className="border-orange-500/30 bg-orange-950/10 mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-orange-300">Saisie du jour</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-white/50 mb-1 block">Sommeil (h)</Label>
                <Input type="number" step="0.5" min="0" max="12" value={today.sommeil}
                  onChange={e => setToday({ ...today, sommeil: e.target.value })}
                  placeholder="7.5" className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
              </div>
              <div>
                <Label className="text-xs text-white/50 mb-1 block">Hydratation (L)</Label>
                <Input type="number" step="0.25" min="0" max="5" value={today.hydratation}
                  onChange={e => setToday({ ...today, hydratation: e.target.value })}
                  placeholder="2.5" className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
              </div>
              <div>
                <Label className="text-xs text-white/50 mb-1 block">Poids (kg)</Label>
                <Input type="number" step="0.1" value={today.poids}
                  onChange={e => setToday({ ...today, poids: e.target.value })}
                  placeholder="75.0" className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
              </div>
              <div>
                <Label className="text-xs text-white/50 mb-1 block">Énergie (1-10) : {today.energie}</Label>
                <input type="range" min="1" max="10" value={today.energie}
                  onChange={e => setToday({ ...today, energie: e.target.value })}
                  className="w-full mt-2 accent-orange-400" />
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving || saved || !today.sommeil} className="w-full bg-orange-600 hover:bg-orange-500">
              {saved ? "✓ Vitalité enregistrée" : saving ? "..." : "Enregistrer ma vitalité"}
            </Button>
          </CardContent>
        </Card>

        {/* Graphique */}
        {chartData.length > 1 && (
          <Card className="border-white/10 bg-white/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-white/60">Évolution des 14 derniers jours</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={chartData} barSize={8} barGap={2}>
                  <XAxis dataKey="date" tick={{ fill: "#ffffff40", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ background: "#111827", border: "1px solid #ffffff10", borderRadius: "8px", color: "#fff" }} />
                  <Bar dataKey="sommeil" fill="#818cf8" name="Sommeil (h)" radius={[2,2,0,0]} />
                  <Bar dataKey="energie" fill="#fb923c" name="Énergie /10" radius={[2,2,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}