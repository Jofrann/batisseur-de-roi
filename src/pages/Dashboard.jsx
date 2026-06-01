import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Crown, ArrowRight, Zap, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const PLANS = [
  { key: "spiritual", emoji: "🙏", label: "Plan Spirituel", path: "/plan/spirituel", color: "border-purple-500/30 bg-purple-950/10 hover:bg-purple-950/20" },
  { key: "financial", emoji: "💰", label: "Plan Financier", path: "/plan/financier", color: "border-green-500/30 bg-green-950/10 hover:bg-green-950/20" },
  { key: "emotional", emoji: "💛", label: "Plan Émotionnel", path: "/plan/emotionnel", color: "border-pink-500/30 bg-pink-950/10 hover:bg-pink-950/20" },
  { key: "time", emoji: "⏰", label: "Plan du Temps", path: "/plan/temps", color: "border-blue-500/30 bg-blue-950/10 hover:bg-blue-950/20" },
  { key: "physical", emoji: "💪", label: "Temple Biologique", path: "/plan/temple", color: "border-orange-500/30 bg-orange-950/10 hover:bg-orange-950/20" },
  { key: "relational", emoji: "🤝", label: "Plan Relationnel", path: "/plan/relationnel", color: "border-yellow-500/30 bg-yellow-950/10 hover:bg-yellow-950/20" },
];

const LEVEL_LABEL = {
  DEBUTANT_RESTAURATION: { label: "Débutant — Restauration", color: "text-blue-400" },
  INTERMEDIAIRE_STRUCTURE: { label: "Intermédiaire — Structure", color: "text-emerald-400" },
  SOUVERAIN_CONQUETE: { label: "Souverain — Conquête", color: "text-yellow-400" },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.UserProfile.list("-created_date", 1)
      .then(profiles => {
        const p = profiles[0];
        if (!p || !p.onboarding_completed) {
          navigate("/onboarding");
        } else {
          setProfile(p);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const ics = profile?.ics_score || 0;
  const levelInfo = LEVEL_LABEL[profile?.user_level] || LEVEL_LABEL.DEBUTANT_RESTAURATION;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-yellow-500/30 border-t-yellow-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-950 text-white">
        <div className="max-w-4xl mx-auto p-6 space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">Miroir de Soi</h1>
              <p className="text-sm text-white/40 mt-0.5">Vue polytope de ta transformation</p>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5">
              <Zap className={cn("w-3.5 h-3.5", levelInfo.color)} />
              <span className={cn("text-sm font-medium", levelInfo.color)}>{levelInfo.label}</span>
            </div>
          </div>

          {/* ICS Score */}
          <Card className="border border-yellow-500/20 bg-yellow-500/5">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium text-white/70">Indice de Cohérence Souveraine (ICS)</span>
                </div>
                <span className="text-3xl font-bold text-yellow-400">{Math.round(ics)}%</span>
              </div>
              <Progress value={ics} className="h-2 bg-white/10" />
              <p className="text-xs text-white/30 mt-2">
                Ère : {profile?.era?.replace("_", " ") || "An I"} · Thème : {profile?.dynasty_theme || "NOIR_ABSOLU_OR_SACRE"}
              </p>
            </CardContent>
          </Card>

          {/* Les 6 Plans */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-white/40" />
              <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Tes 6 Plans de Transformation</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PLANS.map(plan => (
                <Link key={plan.key} to={plan.path}>
                  <Card className={cn("border transition-all cursor-pointer", plan.color)}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{plan.emoji}</span>
                        <p className="text-sm font-medium text-white leading-tight">{plan.label}</p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-white/20 shrink-0" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <Card className="border border-white/10 bg-white/5">
            <CardContent className="p-5">
              <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Actions Rapides</p>
              <div className="flex flex-wrap gap-2">
                <Link to="/plan/spirituel/journal-ecoute">
                  <Button variant="outline" size="sm" className="border-white/10 text-white/70 hover:text-white hover:bg-white/10">
                    📖 Journal du matin
                  </Button>
                </Link>
                <Link to="/plan/emotionnel/trigger">
                  <Button variant="outline" size="sm" className="border-white/10 text-white/70 hover:text-white hover:bg-white/10">
                    🆘 Trigger Tracker
                  </Button>
                </Link>
                <Link to="/plan/temps/planificateur">
                  <Button variant="outline" size="sm" className="border-white/10 text-white/70 hover:text-white hover:bg-white/10">
                    🗓️ Planificateur
                  </Button>
                </Link>
                <Link to="/rendement">
                  <Button variant="outline" size="sm" className="border-white/10 text-white/70 hover:text-white hover:bg-white/10">
                    📊 Mon Rendement
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}