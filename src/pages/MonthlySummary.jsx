import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AppLayout from "@/components/layout/AppLayout";
import PillarBadge, { PILLARS } from "@/components/shared/PillarBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { BarChart2, BookOpen, CheckSquare, TrendingUp, Clock, Smile, AlertTriangle } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: format(new Date(2024, i, 1), "MMMM", { locale: fr })
}));

const PILLAR_ICONS = {
  spiritual: "🙏", financial: "💰", emotional: "💛", physical: "💪",
  time_management: "⏰", relational: "🤝", identity_vocation: "🌟",
};

export default function MonthlySummary() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(String(now.getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadData(); }, [selectedMonth, selectedYear]);

  const loadData = async () => {
    setLoading(true);
    const month = parseInt(selectedMonth);
    const year = parseInt(selectedYear);
    const start = new Date(year, month - 1, 1).toISOString().split("T")[0];
    const end = new Date(year, month, 0).toISOString().split("T")[0];

    const [journals, actions, diagnostics] = await Promise.all([
      base44.entities.DailyJournalEntry.list("-entry_date", 100),
      base44.entities.DailyActionLogEntry.list("-action_date", 100),
      base44.entities.PillarDiagnosticEntry.list("-diagnosis_date", 12),
    ]);

    const monthJournals = journals.filter(j => j.entry_date >= start && j.entry_date <= end);
    const monthActions = actions.filter(a => a.action_date >= start && a.action_date <= end);
    const monthDiagnostic = diagnostics.find(d => d.month === month && d.year === year);
    const prevDiagnostic = diagnostics.find(d => {
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      return d.month === prevMonth && d.year === prevYear;
    });

    // Agréger par pilier
    const pillarStats = PILLARS.map(p => {
      const pJournals = monthJournals.filter(j => j.pillar === p.key);
      const pActions = monthActions.filter(a => a.pillar === p.key);
      const completedActions = pActions.filter(a => a.status === "completed");
      const totalMinutes = completedActions.reduce((s, a) => s + (a.time_spent_minutes || 0), 0);
      const avgMood = pJournals.length ? Math.round(pJournals.reduce((s, j) => s + (j.mood_score || 5), 0) / pJournals.length * 10) / 10 : null;
      const diagScore = monthDiagnostic ? monthDiagnostic[`${p.key}_score`] : null;
      const prevScore = prevDiagnostic ? prevDiagnostic[`${p.key}_score`] : null;

      return {
        ...p,
        journalCount: pJournals.length,
        actionCount: completedActions.length,
        totalMinutes,
        avgMood,
        diagScore,
        prevScore,
        evolution: diagScore && prevScore ? diagScore - prevScore : null,
        blockers: pJournals.filter(j => j.blockers).map(j => j.blockers),
      };
    });

    setData({
      journals: monthJournals,
      actions: monthActions,
      diagnostic: monthDiagnostic,
      pillarStats,
      totalActions: monthActions.filter(a => a.status === "completed").length,
      totalMinutes: monthActions.filter(a => a.status === "completed").reduce((s, a) => s + (a.time_spent_minutes || 0), 0),
      avgMood: monthJournals.length ? Math.round(monthJournals.reduce((s, j) => s + (j.mood_score || 5), 0) / monthJournals.length * 10) / 10 : null,
    });
    setLoading(false);
  };

  const radarData = data?.pillarStats.filter(p => p.diagScore).map(p => ({
    pillar: PILLAR_ICONS[p.key] + " " + p.label.split("/")[0],
    score: p.diagScore,
  }));

  const barData = data?.pillarStats.filter(p => p.totalMinutes > 0).map(p => ({
    name: PILLAR_ICONS[p.key],
    minutes: p.totalMinutes,
    label: p.label,
  }));

  const years = [String(now.getFullYear()), String(now.getFullYear() - 1)];

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart2 className="w-6 h-6" /> Bilan Mensuel</h1>
            <p className="text-muted-foreground text-sm mt-1">Vue agrégée de ta progression</p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>{MONTHS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
              <SelectContent>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>
        ) : !data ? null : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Actions complétées", value: data.totalActions, icon: CheckSquare, color: "text-green-600" },
                { label: "Temps investi", value: `${Math.round(data.totalMinutes / 60 * 10) / 10}h`, icon: Clock, color: "text-blue-600" },
                { label: "Entrées journal", value: data.journals.length, icon: BookOpen, color: "text-purple-600" },
                { label: "Humeur moyenne", value: data.avgMood ? `${data.avgMood}/10` : "—", icon: Smile, color: "text-yellow-600" },
              ].map(({ label, value, icon: Icon, color }) => (
                <Card key={label}><CardContent className="p-4 flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-muted ${color}`}><Icon className="w-4 h-4" /></div>
                  <div><p className="text-xl font-bold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>
                </CardContent></Card>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Radar */}
              {radarData?.length > 0 && (
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Scores par Pilier</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="pillar" tick={{ fontSize: 11 }} />
                        <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Temps par pilier */}
              {barData?.length > 0 && (
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Clock className="w-4 h-4" /> Temps Investi (min)</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={barData}>
                        <XAxis dataKey="name" tick={{ fontSize: 14 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(val, _, props) => [`${val} min`, props.payload.label]} />
                        <Bar dataKey="minutes" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Détail par pilier */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Progression par Pilier</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {data.pillarStats.map(p => (
                  <div key={p.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{PILLAR_ICONS[p.key]}</span>
                        <span className="text-sm font-medium">{p.label}</span>
                        {p.evolution !== null && (
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${p.evolution > 0 ? "bg-green-100 text-green-700" : p.evolution < 0 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>
                            {p.evolution > 0 ? "↑" : p.evolution < 0 ? "↓" : "="}{Math.abs(p.evolution)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {p.journalCount > 0 && <span>📖 {p.journalCount} entrées</span>}
                        {p.actionCount > 0 && <span>✅ {p.actionCount} actions</span>}
                        {p.totalMinutes > 0 && <span>⏱ {p.totalMinutes}min</span>}
                      </div>
                    </div>
                    {p.diagScore && <Progress value={p.diagScore * 10} className="h-1.5" />}
                    {p.blockers.length > 0 && (
                      <div className="text-xs text-red-600 flex items-start gap-1">
                        <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                        <span>{p.blockers[0]}</span>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Entrées journal récentes */}
            {data.journals.length > 0 && (
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><BookOpen className="w-4 h-4" /> Extraits du Journal</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {data.journals.slice(0, 5).map(j => (
                    <div key={j.id} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground">{format(new Date(j.entry_date), "d MMM", { locale: fr })}</span>
                        {j.pillar && <PillarBadge pillar={j.pillar} />}
                        {j.mood_score && <span className="text-xs text-muted-foreground">😊 {j.mood_score}/10</span>}
                      </div>
                      <p className="text-sm text-foreground line-clamp-2">{j.content}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}