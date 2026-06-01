import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Target, TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";

const BLOCS = [
  { key: "sacre", label: "🙏 Bloc Sacré", color: "text-purple-400" },
  { key: "temple", label: "💪 Bloc Temple", color: "text-orange-400" },
  { key: "conquete", label: "⚔️ Bloc Conquête", color: "text-yellow-400" },
  { key: "honneur", label: "🤝 Bloc Honneur", color: "text-green-400" },
];

export default function Ecartometre() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [planifie, setPlanifie] = useState({});
  const [reel, setReel] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => {
    const data = await base44.entities.PillarDiagnosticEntry.list("-diagnosis_date", 10);
    setHistory(data.filter(d => d.blocking_notes?.startsWith("ECART:")));
  };

  const getEcart = (key) => {
    const p = parseFloat(planifie[key] || 0);
    const r = parseFloat(reel[key] || 0);
    return r - p;
  };

  const getScore = () => {
    let total = 0;
    let count = 0;
    BLOCS.forEach(b => {
      const ecart = Math.abs(getEcart(b.key));
      const p = parseFloat(planifie[b.key] || 0);
      if (p > 0) { total += Math.max(0, 100 - (ecart / p) * 100); count++; }
    });
    return count > 0 ? Math.round(total / count) : 0;
  };

  const handleSave = async () => {
    setSaving(true);
    const score = getScore();
    await base44.entities.PillarDiagnosticEntry.create({
      diagnosis_date: selectedDate,
      month: new Date(selectedDate).getMonth() + 1,
      year: new Date(selectedDate).getFullYear(),
      time_management_score: Math.round(score / 10),
      blocking_notes: `ECART:${JSON.stringify({ planifie, reel })}`,
      summary_notes: `Score de précision : ${score}%`,
    });
    setSaved(true);
    setSaving(false);
    await loadHistory();
  };

  const score = getScore();
  const scoreColor = score >= 80 ? "text-green-400" : score >= 60 ? "text-yellow-400" : "text-red-400";

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
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <Target className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Écartomètre de Focus</h1>
              <p className="text-white/50 text-sm">Planifié vs Réel — Mesure de discipline</p>
            </div>
          </div>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
            className="bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-1.5" />
        </div>

        {/* Score */}
        {score > 0 && (
          <Card className="border-cyan-500/30 bg-cyan-950/10 mb-6">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Score de précision temporelle</p>
                <p className="text-xs text-white/30">Plus tu te rapproches de 100%, plus tu es discipliné</p>
              </div>
              <p className={`text-4xl font-bold ${scoreColor}`}>{score}%</p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3 mb-6">
          <div className="grid grid-cols-3 gap-2 text-xs text-white/40 text-center mb-2">
            <span></span>
            <span>Planifié (h)</span>
            <span>Réel (h)</span>
          </div>
          {BLOCS.map(bloc => {
            const ecart = getEcart(bloc.key);
            const hasData = planifie[bloc.key] || reel[bloc.key];
            return (
              <Card key={bloc.key} className="border-white/10 bg-white/5">
                <CardContent className="p-4">
                  <div className="grid grid-cols-3 gap-3 items-center">
                    <p className={`text-sm font-medium ${bloc.color}`}>{bloc.label}</p>
                    <Input
                      type="number" min="0" max="24" step="0.5"
                      value={planifie[bloc.key] || ""}
                      onChange={e => setPlanifie({ ...planifie, [bloc.key]: e.target.value })}
                      placeholder="0"
                      className="bg-white/5 border-white/10 text-white text-center h-9"
                    />
                    <Input
                      type="number" min="0" max="24" step="0.5"
                      value={reel[bloc.key] || ""}
                      onChange={e => setReel({ ...reel, [bloc.key]: e.target.value })}
                      placeholder="0"
                      className="bg-white/5 border-white/10 text-white text-center h-9"
                    />
                  </div>
                  {hasData && parseFloat(planifie[bloc.key] || 0) > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${ecart >= 0 ? "bg-green-500" : "bg-red-500"}`}
                          style={{ width: `${Math.min(100, (parseFloat(reel[bloc.key] || 0) / parseFloat(planifie[bloc.key])) * 100)}%` }}
                        />
                      </div>
                      <span className={`text-xs ${ecart >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {ecart >= 0 ? "+" : ""}{ecart.toFixed(1)}h
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Button onClick={handleSave} disabled={saving || saved} className="w-full bg-cyan-600 hover:bg-cyan-500">
          {saved ? "✓ Analyse sauvegardée" : saving ? "Enregistrement..." : "Sceller l'analyse du jour"}
        </Button>

        {history.length > 0 && (
          <div className="mt-8">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Historique</p>
            <div className="space-y-2">
              {history.slice(0, 5).map(h => (
                <div key={h.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-sm text-white/60">{h.diagnosis_date}</span>
                  <span className="text-sm font-medium text-cyan-400">{h.summary_notes}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}