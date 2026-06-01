import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const subPages = [
  {
    key: "planificateur",
    emoji: "🗓️",
    title: "Planificateur Horodaté Directif",
    subtitle: "Blocs Sacré · Temple · Conquête · Honneur",
    desc: "Interface de Time-Blocking qui verrouille l'agenda sur les 4 blocs majeurs de la journée souveraine.",
    path: "/plan/temps/planificateur",
    color: "border-blue-500/30 bg-blue-950/20 hover:bg-blue-950/40",
  },
  {
    key: "ecartometre",
    emoji: "📐",
    title: "Écartomètre de Focus",
    subtitle: "Planifié vs Réel",
    desc: "Analyse comparative entre le temps planifié et le temps réel déclaré. Mesure l'écart de discipline.",
    path: "/plan/temps/ecartometre",
    color: "border-cyan-500/30 bg-cyan-950/20 hover:bg-cyan-950/40",
  },
];

export default function PlanTemps() {
  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-950 text-white p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">⏰</span>
            <div>
              <h1 className="text-2xl font-bold text-white">Plan de Souveraineté du Temps</h1>
              <p className="text-sm text-white/50">Sous l'autorité du Ps. Samuel Eboumbou</p>
            </div>
          </div>
          <p className="text-white/60 text-sm mt-3 max-w-xl">
            Ordonnancement du temps en capital de mission. Chaque heure est une décision de souveraineté ou d'abandon.
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