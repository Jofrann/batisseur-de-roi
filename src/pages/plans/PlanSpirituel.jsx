import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowRight, Flame, BookHeart } from "lucide-react";

const subPages = [
  {
    key: "brise-forteresse",
    emoji: "⚔️",
    title: "Le Brise-Forteresse",
    subtitle: "Renouvellement des Pensées",
    desc: "Confronte tes pensées dominantes de peur et reçois le décret scripturaire d'autorité pour renouveler ton intelligence.",
    path: "/plan/spirituel/brise-forteresse",
    icon: Flame,
    color: "border-purple-500/30 bg-purple-950/20 hover:bg-purple-950/40",
    badge: "bg-purple-500/20 text-purple-300",
  },
  {
    key: "journal-ecoute",
    emoji: "📖",
    title: "Journal d'Écoute et d'Intimité",
    subtitle: "Bloc Sacré du matin",
    desc: "Capture les directions reçues durant ton temps d'intimité et suis leur manifestation concrète dans le temps.",
    path: "/plan/spirituel/journal-ecoute",
    icon: BookHeart,
    color: "border-indigo-500/30 bg-indigo-950/20 hover:bg-indigo-950/40",
    badge: "bg-indigo-500/20 text-indigo-300",
  },
];

export default function PlanSpirituel() {
  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-950 text-white p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">🙏</span>
            <div>
              <h1 className="text-2xl font-bold text-white">Plan Spirituel</h1>
              <p className="text-sm text-white/50">Sous l'autorité de l'Apôtre Yvan Castanou</p>
            </div>
          </div>
          <p className="text-white/60 text-sm mt-3 max-w-xl">
            Destruction des forteresses mentales et établissement de l'identité en Christ. Ce plan constitue le fondement souverain de ta transformation.
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