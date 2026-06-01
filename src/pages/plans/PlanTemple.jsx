import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const subPages = [
  {
    key: "vitalite",
    emoji: "📈",
    title: "Cadran de Vitalité Métabolique",
    subtitle: "Sommeil · Hydratation · Nutrition",
    desc: "Graphique compilant tes données biométriques : sommeil profond, hydratation et nutrition de vie.",
    path: "/plan/temple/vitalite",
    color: "border-orange-500/30 bg-orange-950/20 hover:bg-orange-950/40",
  },
  {
    key: "antidote",
    emoji: "🔥",
    title: "Antidote de la Paresse",
    subtitle: "Validation des Routines",
    desc: "Téléverse la preuve factuelle de ta session de discipline physique. Tolérance zéro pour l'auto-sabotage.",
    path: "/plan/temple/antidote",
    color: "border-red-500/30 bg-red-950/20 hover:bg-red-950/40",
  },
];

export default function PlanTemple() {
  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-950 text-white p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">💪</span>
            <div>
              <h1 className="text-2xl font-bold text-white">Plan du Temple Biologique</h1>
              <p className="text-sm text-white/50">Sous l'autorité du Ps. Ghislain Biabatantou</p>
            </div>
          </div>
          <p className="text-white/60 text-sm mt-3 max-w-xl">
            Optimisation de la force physique et de la productivité organique. Ton corps est l'instrument de ta mission.
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