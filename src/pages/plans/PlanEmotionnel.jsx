import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const subPages = [
  {
    key: "cartographie-blessures",
    emoji: "🗺️",
    title: "Cartographie des 5 Blessures",
    subtitle: "Rejet · Abandon · Humiliation · Trahison · Injustice",
    desc: "Suivi clinique de l'évolution des schémas de blessures profondes pour une guérison active de l'âme.",
    path: "/plan/emotionnel/blessures",
    color: "border-pink-500/30 bg-pink-950/20 hover:bg-pink-950/40",
  },
  {
    key: "trigger-tracker",
    emoji: "🆘",
    title: "Trigger Tracker",
    subtitle: "Module d'urgence émotionnelle",
    desc: "Analyse à chaud d'une réaction disproportionnée et application de la méthode de recentrage psychologique et spirituel.",
    path: "/plan/emotionnel/trigger",
    color: "border-rose-500/30 bg-rose-950/20 hover:bg-rose-950/40",
  },
];

export default function PlanEmotionnel() {
  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-950 text-white p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">💛</span>
            <div>
              <h1 className="text-2xl font-bold text-white">Plan de Restauration Émotionnelle</h1>
              <p className="text-sm text-white/50">Sous l'autorité du Ps. Jacques Mbalanda</p>
            </div>
          </div>
          <p className="text-white/60 text-sm mt-3 max-w-xl">
            Guérison active de l'âme pour stabiliser la trajectoire de vie. Une âme non guérie sabote tout plan de conquête.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {subPages.map((sp) => (
            <Link key={sp.key} to={sp.path}>
              <Card className={`border transition-all cursor-pointer ${sp.color}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">{sp.emoji}</span>
                    <ArrowRight className="w-4 h-4 text-white/30 mt-1" />
                  </div>
                  <h3 className="font-bold text-white mb-1">{sp.title}</h3>
                  <p className="text-xs text-white/40 mb-2">{sp.subtitle}</p>
                  <p className="text-sm text-white/60">{sp.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}