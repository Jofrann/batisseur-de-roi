import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const subPages = [
  {
    key: "matrice-flux",
    emoji: "📊",
    title: "Matrice des Flux Budgétaires",
    subtitle: "Trésorerie & Intendance",
    desc: "Classement des revenus, investissements du Royaume, et épargne d'intendance. Tolérance zéro pour les fuites.",
    path: "/plan/financier/matrice",
    color: "border-green-500/30 bg-green-950/20 hover:bg-green-950/40",
  },
  {
    key: "detecteur-fuites",
    emoji: "🚨",
    title: "Détecteur de Fuites Émotionnelles",
    subtitle: "Dépenses impulsives",
    desc: "Isole l'argent dépensé par impulsion suite à une baisse de moral ou une crise de l'âme.",
    path: "/plan/financier/fuites",
    color: "border-red-500/30 bg-red-950/20 hover:bg-red-950/40",
  },
];

export default function PlanFinancier() {
  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-950 text-white p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">💰</span>
            <div>
              <h1 className="text-2xl font-bold text-white">Plan d'Intendance Financière</h1>
              <p className="text-sm text-white/50">Sous l'autorité du Ps. Christian Saboukoulou</p>
            </div>
          </div>
          <p className="text-white/60 text-sm mt-3 max-w-xl">
            Gestion rigoureuse des ressources et éradication de la pauvreté subie. L'argent est un outil de mission, pas une fin.
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