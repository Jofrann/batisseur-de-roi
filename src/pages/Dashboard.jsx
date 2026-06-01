import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PILLARS } from "@/components/shared/PillarBadge";
import {
  BookOpen, CheckSquare, Stethoscope, BarChart2,
  TrendingUp, AlertTriangle, Target, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const PILLAR_ICONS = {
  spiritual: "🙏",
  financial: "💰",
  emotional: "💛",
  physical: "💪",
  time_management: "⏰",
  relational: "🤝",
  identity_vocation: "🌟",
};

export default function Dashboard() {
  const [diagnostic, setDiagnostic] = useState(null);
  const [actions, setActions] = useState([]);
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.PillarDiagnosticEntry.list("-diagnosis_date", 1),
      base44.entities.DailyActionLogEntry.list("-action_date", 10),
      base44.entities.DailyJournalEntry.list("-entry_date", 5),
    ]).then(([diagnostics, acts, jours]) => {
      setDiagnostic(diagnostics[0] || null);
      setActions(acts);
      setJournals(jours);
    }).finally(() => setLoading(false));
  }, []);

  const pillarScores = diagnostic ? PILLARS.map(p => ({
    ...p,
    score: diagnostic[`${p.key}_score`] || 0
  })).filter(p => p.score > 0).sort((a, b) => a.score - b.score) : [];

  const weakPillars = pillarScores.filter(p => p.score < 6);
  const completedActions = actions.filter(a => a.status === "completed").length;

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tableau de Bord</h1>
          <p className="text-muted-foreground text-sm mt-1">Vue d'ensemble de ta transformation</p>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Actions ce mois", value: completedActions, icon: CheckSquare, color: "text-green-600" },
            { label: "Entrées journal", value: journals.length, icon: BookOpen, color: "text-blue-600" },
            { label: "Piliers en alerte", value: weakPillars.length, icon: AlertTriangle, color: "text-red-500" },
            { label: "Score moyen", value: pillarScores.length ? Math.round(pillarScores.reduce((s, p) => s + p.score, 0) / pillarScores.length * 10) / 10 : "—", icon: TrendingUp, color: "text-purple-600" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("p-2 rounded-lg bg-muted", color)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Scores par pilier */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4" /> Scores des Piliers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <p className="text-sm text-muted-foreground">Chargement...</p>
              ) : pillarScores.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-3">Aucun diagnostic disponible</p>
                  <Link to="/diagnostic">
                    <Button size="sm" variant="outline">Faire mon diagnostic</Button>
                  </Link>
                </div>
              ) : (
                pillarScores.map(p => (
                  <div key={p.key} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1.5">{PILLAR_ICONS[p.key]} {p.label}</span>
                      <span className={`font-semibold ${p.score < 5 ? "text-red-500" : p.score < 7 ? "text-yellow-600" : "text-green-600"}`}>{p.score}/10</span>
                    </div>
                    <Progress value={p.score * 10} className="h-1.5" />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Raccourcis */}
          <div className="space-y-3">
            {[
              { label: "Écrire dans mon journal", desc: "Partager mes réflexions du jour", path: "/journal", icon: BookOpen, color: "bg-blue-50 border-blue-200" },
              { label: "Enregistrer une action", desc: "Documenter mes progrès du jour", path: "/actions", icon: CheckSquare, color: "bg-green-50 border-green-200" },
              { label: "Diagnostic mensuel", desc: "Évaluer mes piliers et obtenir des conseils IA", path: "/diagnostic", icon: Stethoscope, color: "bg-purple-50 border-purple-200" },
              { label: "Bilan du mois", desc: "Voir ma progression globale", path: "/bilan", icon: BarChart2, color: "bg-orange-50 border-orange-200" },
            ].map(({ label, desc, path, icon: Icon, color }) => (
              <Link key={path} to={path}>
                <Card className={`border ${color} hover:shadow-sm transition-shadow cursor-pointer`}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Alertes blocages */}
        {weakPillars.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-700">Piliers en difficulté</p>
                  <p className="text-sm text-red-600 mt-1">
                    {weakPillars.map(p => p.label).join(", ")} — Score inférieur à 6/10.
                    {" "}<Link to="/diagnostic" className="underline font-medium">Lancer un diagnostic</Link>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}