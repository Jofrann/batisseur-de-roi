import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Zap, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const LEVEL_INFO = {
  DEBUTANT_RESTAURATION: { label: "Débutant — Restauration", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
  INTERMEDIAIRE_STRUCTURE: { label: "Intermédiaire — Structure", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" },
  SOUVERAIN_CONQUETE: { label: "Souverain — Conquête", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
};

export default function IdentiteRoyale() {
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.UserProfile.list("-created_date", 1),
    ]).then(([u, profiles]) => {
      setUser(u);
      setProfile(profiles[0] || null);
    }).finally(() => setLoading(false));
  }, []);

  const levelInfo = LEVEL_INFO[profile?.user_level] || LEVEL_INFO.DEBUTANT_RESTAURATION;
  const ics = profile?.ics_score || 0;

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-950 text-white p-6 max-w-2xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <Crown className="w-6 h-6 text-yellow-400" />
          <h1 className="text-xl font-bold">Mon Identité Royale</h1>
        </div>

        {loading ? (
          <p className="text-white/40 text-sm">Chargement...</p>
        ) : (
          <div className="space-y-4">
            {/* ICS Card */}
            <Card className="border border-yellow-500/30 bg-yellow-500/5">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium text-white/80">Indice de Cohérence Souveraine (ICS)</span>
                  </div>
                  <span className="text-2xl font-bold text-yellow-400">{Math.round(ics)}%</span>
                </div>
                <Progress value={ics} className="h-2 bg-white/10" />
              </CardContent>
            </Card>

            {/* Level */}
            <Card className={`border ${levelInfo.bg}`}>
              <CardContent className="p-5">
                <p className="text-xs text-white/40 mb-1">Niveau de Gouvernance</p>
                <p className={`text-lg font-bold ${levelInfo.color}`}>{levelInfo.label}</p>
                <p className="text-xs text-white/40 mt-1">Ère : {profile?.era?.replace("_", " ") || "An I"} du Plan 3 Ans</p>
              </CardContent>
            </Card>

            {/* Identity */}
            <Card className="border border-white/10 bg-white/5">
              <CardContent className="p-5">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Profil Civil</p>
                <p className="text-sm text-white/80"><span className="text-white/40">Email : </span>{user?.email || "—"}</p>
                <p className="text-sm text-white/80 mt-1"><span className="text-white/40">Nom : </span>{user?.full_name || "—"}</p>
              </CardContent>
            </Card>

            {/* Audit Summary */}
            {profile && (
              <Card className="border border-white/10 bg-white/5">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-white/40" />
                    <p className="text-xs text-white/40 uppercase tracking-wider">Bilan du Temple (Audit Initial)</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Revenus mensuels", value: profile.monthly_income ? `${profile.monthly_income} €` : "—" },
                      { label: "Dettes actives", value: profile.total_debt ? `${profile.total_debt} €` : "—" },
                      { label: "Épargne", value: profile.current_savings ? `${profile.current_savings} €` : "—" },
                      { label: "H. travail / sem.", value: profile.weekly_work_hours ? `${profile.weekly_work_hours} h` : "—" },
                      { label: "Poids", value: profile.weight_kg ? `${profile.weight_kg} kg` : "—" },
                      { label: "Sommeil / nuit", value: profile.avg_sleep_hours ? `${profile.avg_sleep_hours} h` : "—" },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-white/5 rounded-lg p-3">
                        <p className="text-xs text-white/40">{label}</p>
                        <p className="text-sm font-medium text-white mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}