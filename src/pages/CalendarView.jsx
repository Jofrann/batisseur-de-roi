import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AppLayout from "@/components/layout/AppLayout";
import PillarBadge, { PILLARS } from "@/components/shared/PillarBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, getDay, addMonths, subMonths } from "date-fns";
import { fr } from "date-fns/locale";

const PILLAR_ICONS = {
  spiritual: "🙏", financial: "💰", emotional: "💛", physical: "💪",
  time_management: "⏰", relational: "🤝", identity_vocation: "🌟",
};

const DOT_COLORS = {
  spiritual: "bg-purple-500", financial: "bg-green-500", emotional: "bg-pink-500",
  physical: "bg-orange-500", time_management: "bg-blue-500", relational: "bg-yellow-500",
  identity_vocation: "bg-indigo-500",
};

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [journals, setJournals] = useState([]);
  const [actions, setActions] = useState([]);
  const [diagnostics, setDiagnostics] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, [currentDate]);

  const loadData = async () => {
    setLoading(true);
    const [j, a, d] = await Promise.all([
      base44.entities.DailyJournalEntry.list("-entry_date", 100),
      base44.entities.DailyActionLogEntry.list("-action_date", 100),
      base44.entities.PillarDiagnosticEntry.list("-diagnosis_date", 12),
    ]);
    setJournals(j);
    setActions(a);
    setDiagnostics(d);
    setLoading(false);
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Remplir les jours vides au début
  const startDayOfWeek = (getDay(monthStart) + 6) % 7; // Lundi = 0
  const emptyDays = Array.from({ length: startDayOfWeek });

  const getDayData = (day) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const dayJournals = journals.filter(j => j.entry_date === dateStr);
    const dayActions = actions.filter(a => a.action_date === dateStr && a.status === "completed");
    const dayDiag = diagnostics.find(d => d.diagnosis_date === dateStr);
    return { journals: dayJournals, actions: dayActions, diagnostic: dayDiag };
  };

  const selectedDayData = selectedDay ? getDayData(selectedDay) : null;

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><CalendarDays className="w-6 h-6" /> Calendrier</h1>
          <p className="text-muted-foreground text-sm mt-1">Vue chronologique de tes activités</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Calendrier */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base capitalize">
                    {format(currentDate, "MMMM yyyy", { locale: fr })}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Jours de la semaine */}
                <div className="grid grid-cols-7 mb-2">
                  {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(d => (
                    <div key={d} className="text-center text-xs text-muted-foreground font-medium py-1">{d}</div>
                  ))}
                </div>

                {/* Grille */}
                <div className="grid grid-cols-7 gap-1">
                  {emptyDays.map((_, i) => <div key={`empty-${i}`} />)}
                  {days.map(day => {
                    const { journals: dJ, actions: dA, diagnostic: dDiag } = getDayData(day);
                    const hasActivity = dJ.length > 0 || dA.length > 0 || dDiag;
                    const isSelected = selectedDay && isSameDay(day, selectedDay);
                    const isToday = isSameDay(day, new Date());
                    const pillars = [...new Set([...dJ.map(j => j.pillar), ...dA.map(a => a.pillar)].filter(Boolean))];

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => setSelectedDay(isSelected ? null : day)}
                        className={`
                          relative p-1.5 rounded-lg text-sm flex flex-col items-center min-h-[52px] transition-all
                          ${isSelected ? "bg-primary text-primary-foreground" : isToday ? "bg-primary/10 text-primary font-bold" : "hover:bg-muted"}
                          ${!isSameMonth(day, currentDate) ? "opacity-30" : ""}
                        `}
                      >
                        <span className="text-xs font-medium leading-none">{format(day, "d")}</span>
                        {pillars.length > 0 && (
                          <div className="flex flex-wrap gap-0.5 mt-1 justify-center">
                            {pillars.slice(0, 3).map(p => (
                              <span key={p} className={`w-1.5 h-1.5 rounded-full ${DOT_COLORS[p] || "bg-gray-400"}`} />
                            ))}
                          </div>
                        )}
                        {dDiag && <span className="text-[9px] mt-0.5">🩺</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Légende */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {PILLARS.map(p => (
                    <span key={p.key} className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span className={`w-2 h-2 rounded-full ${DOT_COLORS[p.key]}`} />
                      {p.label}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Détail du jour sélectionné */}
          <div>
            {selectedDay && selectedDayData ? (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm capitalize">
                    {format(selectedDay, "EEEE d MMMM", { locale: fr })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedDayData.journals.length === 0 && selectedDayData.actions.length === 0 && !selectedDayData.diagnostic ? (
                    <p className="text-xs text-muted-foreground">Aucune activité ce jour.</p>
                  ) : (
                    <>
                      {selectedDayData.diagnostic && (
                        <div className="p-2 bg-purple-50 rounded border border-purple-100">
                          <p className="text-xs font-semibold text-purple-700">🩺 Diagnostic mensuel</p>
                        </div>
                      )}

                      {selectedDayData.journals.map(j => (
                        <div key={j.id} className="p-2.5 bg-muted rounded-lg">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-xs">📖</span>
                            {j.pillar && <PillarBadge pillar={j.pillar} />}
                            {j.mood_score && <span className="text-xs text-muted-foreground">{j.mood_score}/10</span>}
                          </div>
                          <p className="text-xs text-foreground line-clamp-3">{j.content}</p>
                        </div>
                      ))}

                      {selectedDayData.actions.map(a => (
                        <div key={a.id} className="p-2.5 bg-green-50 rounded-lg border border-green-100">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-xs">✅</span>
                            {a.pillar && <PillarBadge pillar={a.pillar} />}
                          </div>
                          <p className="text-xs font-medium">{a.title}</p>
                          {a.time_spent_minutes && <p className="text-xs text-muted-foreground mt-0.5">⏱ {a.time_spent_minutes} min</p>}
                        </div>
                      ))}
                    </>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed">
                <CardContent className="p-6 text-center text-muted-foreground text-sm">
                  Sélectionne un jour pour voir le détail de tes activités
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}