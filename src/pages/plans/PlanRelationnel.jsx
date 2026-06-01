import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const subPages = [
  {
    key: "cercle",
    emoji: "🌐",
    title: "Cercle Concentrique d'Honneur",
    subtitle: "Autorités · Conjoint · Enfants · Équipes",
    desc: "Cartographie relationnelle gérant tes interactions avec chaque cercle de responsabilité.",
    path: "/plan/relationnel/cercle",
    color: "border-yellow-500/30 bg-yellow-950/20 hover:bg-yellow-950/40",
  },
  {
    key: "engagements",
    emoji: "📋",
    title: "Registre des Engagements de Présence",
    subtitle: "Présence qualitative & Actions d'honneur",
    desc: "Tracking du temps qualitatif et des actions concrètes d'honneur accomplies sans défaillance.",
    path: "/plan/relationnel/engagements",
    color: "border-amber-500/30 bg-amber-950/20 hover:bg-amber-950/40",
  },
];

export default function PlanRelationnel() {
  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-950 text-white p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">🤝</span>
            <div>
              <h1 className="text-2xl font-bold text-white">Plan Relationnel d'Honneur</h1>
              <p className="text-sm text-white/50">Cercle d'Honneur — Responsabilité Souveraine</p>
            </div>
          </div>
          <p className="text-white/60 text-sm mt-3 max-w-xl">
            Assumer ses devoirs et protéger ses cercles de responsabilité. L'honneur n'est pas optionnel, c'est une obligation royale.
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