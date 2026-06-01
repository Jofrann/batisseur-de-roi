import { cn } from "@/lib/utils";

const PILLAR_CONFIG = {
  spiritual: { label: "Spirituel", color: "bg-purple-100 text-purple-700 border-purple-200" },
  financial: { label: "Financier", color: "bg-green-100 text-green-700 border-green-200" },
  emotional: { label: "Émotionnel", color: "bg-pink-100 text-pink-700 border-pink-200" },
  physical: { label: "Physique", color: "bg-orange-100 text-orange-700 border-orange-200" },
  time_management: { label: "Gestion du Temps", color: "bg-blue-100 text-blue-700 border-blue-200" },
  relational: { label: "Relationnel", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  identity_vocation: { label: "Identité/Vocation", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
};

export const PILLARS = Object.entries(PILLAR_CONFIG).map(([key, val]) => ({ key, ...val }));

export default function PillarBadge({ pillar, className }) {
  const config = PILLAR_CONFIG[pillar] || { label: pillar, color: "bg-gray-100 text-gray-700 border-gray-200" };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", config.color, className)}>
      {config.label}
    </span>
  );
}

export { PILLAR_CONFIG };