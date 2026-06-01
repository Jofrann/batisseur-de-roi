import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AppLayout from "@/components/layout/AppLayout";
import { PILLARS } from "@/components/shared/PillarBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Stethoscope, Sparkles, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const PILLAR_ICONS = {
  spiritual: "🙏", financial: "💰", emotional: "💛", physical: "💪",
  time_management: "⏰", relational: "🤝", identity_vocation: "🌟",
};

export default function MonthlyDiagnostic() {
  const [history, setHistory] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const today = new Date();
  const [scores, setScores] = useState(
    Object.fromEntries(PILLARS.map(p => [`${p.key}_score`, 5]))
  );
  const [blockingNotes, setBlockingNotes] = useState("");
  const [summaryNotes, setSummaryNotes] = useState("");

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => {
    setLoadingHistory(true);
    const data = await base44.entities.PillarDiagnosticEntry.list("-diagnosis_date", 10);
    setHistory(data);
    setLoadingHistory(false);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    const pillarDetails = PILLARS.map(p => ({
      pillar: p.label,
      score: scores[`${p.key}_score`],
    }));

    const weakPillars = pillarDetails.filter(p => p.score < 6);

    const prompt = `Tu es un coach de vie expert en développement personnel et transformation humaine. 
Voici le diagnostic mensuel d'un homme en phase de transformation profonde (Plan 3 ans - Bâtisseur de Roi).

Scores d'auto-évaluation (1-10) :
${pillarDetails.map(p => `- ${p.pillar} : ${p.score}/10`).join("\n")}

Points de blocage identifiés par le coaché :
"${blockingNotes || "Aucun point spécifique mentionné"}"

Notes générales :
"${summaryNotes || "Aucune note"}"

Piliers en difficulté (score < 6) : ${weakPillars.map(p => p.pillar).join(", ") || "Aucun"}

Sur la base de ce diagnostic, génère :
1. Une analyse concise des blocages principaux
2. 5 à 7 actions correctives concrètes et personnalisées pour réaligner les objectifs
3. Les 3 piliers prioritaires pour le mois à venir
4. Un message motivationnel court et percutant

Sois direct, concret et actionnable. Chaque action doit être réalisable en 1 mois.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          analysis: { type: "string", description: "Analyse concise des blocages" },
          corrective_actions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                pillar: { type: "string" },
                action: { type: "string" },
                frequency: { type: "string" },
                impact: { type: "string", enum: ["faible", "moyen", "élevé"] },
              }
            }
          },
          priority_pillars: { type: "array", items: { type: "string" } },
          motivation_message: { type: "string" },
        }
      }
    });

    const entry = await base44.entities.PillarDiagnosticEntry.create({
      diagnosis_date: today.toISOString().split("T")[0],
      month: today.getMonth() + 1,
      year: today.getFullYear(),
      ...scores,
      blocking_notes: blockingNotes,
      summary_notes: summaryNotes,
      priority_areas: result.priority_pillars || [],
      corrective_actions: JSON.stringify(result),
    });

    setHistory([entry, ...history]);
    setShowForm(false);
    setExpandedId(entry.id);
    setGenerating(false);
  };

  const parseActions = (entry) => {
    if (!entry.corrective_actions) return null;
    try { return JSON.parse(entry.corrective_actions); } catch { return null; }
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Stethoscope className="w-6 h-6" /> Diagnostic Mensuel</h1>
            <p className="text-muted-foreground text-sm mt-1">Évalue tes blocages et obtiens des actions correctives IA</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Sparkles className="w-4 h-4" /> Nouveau diagnostic
          </Button>
        </div>

        {/* Formulaire */}
        {showForm && (
          <Card className="border-2 border-purple-200 bg-purple-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Évaluation — {format(today, "MMMM yyyy", { locale: fr })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {PILLARS.map(p => (
                <div key={p.key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="flex items-center gap-1.5">
                      {PILLAR_ICONS[p.key]} {p.label}
                    </Label>
                    <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                      scores[`${p.key}_score`] < 5 ? "bg-red-100 text-red-700"
                        : scores[`${p.key}_score`] < 7 ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}>{scores[`${p.key}_score`]}/10</span>
                  </div>
                  <Slider
                    min={1} max={10} step={1}
                    value={[scores[`${p.key}_score`]]}
                    onValueChange={([v]) => setScores({ ...scores, [`${p.key}_score`]: v })}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Bloqué</span><span>Excellent</span>
                  </div>
                </div>
              ))}

              <div className="space-y-1.5">
                <Label>Points de blocage spécifiques</Label>
                <Textarea
                  placeholder="Décris tes difficultés, frustrations, obstacles rencontrés ce mois..."
                  rows={3}
                  value={blockingNotes}
                  onChange={e => setBlockingNotes(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Notes générales du mois</Label>
                <Textarea
                  placeholder="Bilan général, victoires, apprentissages..."
                  rows={2}
                  value={summaryNotes}
                  onChange={e => setSummaryNotes(e.target.value)}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
                <Button onClick={handleGenerate} disabled={generating} className="gap-2 bg-purple-600 hover:bg-purple-700">
                  {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyse en cours...</> : <><Sparkles className="w-4 h-4" /> Générer les actions correctives</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Historique */}
        {loadingHistory ? (
          <p className="text-sm text-muted-foreground">Chargement...</p>
        ) : history.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">Aucun diagnostic. Lance ton premier diagnostic !</CardContent></Card>
        ) : (
          <div className="space-y-4">
            {history.map(entry => {
              const parsed = parseActions(entry);
              const isExpanded = expandedId === entry.id;
              const pillarScores = PILLARS.map(p => ({ ...p, score: entry[`${p.key}_score`] || 0 })).filter(p => p.score > 0);
              const avgScore = pillarScores.length ? Math.round(pillarScores.reduce((s, p) => s + p.score, 0) / pillarScores.length * 10) / 10 : 0;

              return (
                <Card key={entry.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <button className="w-full p-4 text-left flex items-center justify-between hover:bg-muted/30 transition-colors" onClick={() => setExpandedId(isExpanded ? null : entry.id)}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white ${avgScore >= 7 ? "bg-green-500" : avgScore >= 5 ? "bg-yellow-500" : "bg-red-500"}`}>
                          {avgScore}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{format(new Date(entry.diagnosis_date), "MMMM yyyy", { locale: fr })}</p>
                          <p className="text-xs text-muted-foreground">{pillarScores.filter(p => p.score < 6).length} piliers en alerte</p>
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-4 border-t border-border">
                        {/* Scores */}
                        <div className="grid grid-cols-2 gap-2 pt-3">
                          {pillarScores.map(p => (
                            <div key={p.key} className="flex items-center gap-2">
                              <span className="text-xs w-4">{PILLAR_ICONS[p.key]}</span>
                              <div className="flex-1">
                                <div className="flex justify-between text-xs mb-0.5">
                                  <span className="text-muted-foreground">{p.label}</span>
                                  <span className={p.score < 5 ? "text-red-600 font-semibold" : p.score < 7 ? "text-yellow-600 font-semibold" : "text-green-600 font-semibold"}>{p.score}/10</span>
                                </div>
                                <Progress value={p.score * 10} className="h-1" />
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Blocages */}
                        {entry.blocking_notes && (
                          <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                            <p className="text-xs font-semibold text-red-700 mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Points de blocage</p>
                            <p className="text-xs text-red-600">{entry.blocking_notes}</p>
                          </div>
                        )}

                        {/* Actions IA */}
                        {parsed && (
                          <div className="space-y-3">
                            {parsed.analysis && (
                              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <p className="text-xs font-semibold text-blue-700 mb-1">📊 Analyse IA</p>
                                <p className="text-xs text-blue-700">{parsed.analysis}</p>
                              </div>
                            )}

                            {parsed.corrective_actions?.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold mb-2 flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-600" /> Actions correctives</p>
                                <div className="space-y-2">
                                  {parsed.corrective_actions.map((action, i) => (
                                    <div key={i} className="p-2.5 bg-muted rounded-lg border flex items-start gap-2">
                                      <span className="text-xs text-muted-foreground shrink-0 mt-0.5">#{i + 1}</span>
                                      <div>
                                        <p className="text-xs font-medium">{action.action}</p>
                                        <div className="flex gap-2 mt-1">
                                          {action.pillar && <span className="text-xs text-muted-foreground">{action.pillar}</span>}
                                          {action.frequency && <span className="text-xs text-muted-foreground">• {action.frequency}</span>}
                                          {action.impact && <span className={`text-xs px-1.5 rounded-full ${action.impact === "élevé" ? "bg-green-100 text-green-700" : action.impact === "moyen" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>{action.impact}</span>}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {parsed.motivation_message && (
                              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-center">
                                <p className="text-sm font-medium text-purple-800 italic">"{parsed.motivation_message}"</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}