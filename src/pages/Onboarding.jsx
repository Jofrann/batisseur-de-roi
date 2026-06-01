import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Crown, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const TOTAL_STEPS = 3;

const SOUL_QUESTIONS = [
  {
    id: "q1",
    author: "Ps. Jacques Mbalanda",
    question: "Quel est le scénario précis de votre passé qui se répète dans vos relations actuelles et provoque chez vous un sentiment d'injustice ou d'abandon ?",
    minChars: 150,
    blockWords: ["je ne sais pas", "ça va", "pas grand chose", "rien de spécial"],
    errorMsg: "Un bâtisseur ne triche pas avec sa propre histoire. Soyez précis.",
  },
  {
    id: "q2",
    author: "Ps. Yvan Castanou",
    question: "Quelle pensée mensongère revient le plus souvent dans ta tête pour justifier l'inaction ou la médiocrité dans ta vie ?",
    minChars: 100,
    blockWords: ["je ne sais pas", "ça va"],
    errorMsg: "Cette pensée existe. Ne la fuis pas. Nomme-la précisément.",
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Step 1 data
  const [soulAnswers, setSoulAnswers] = useState({ q1: "", q2: "" });
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Step 2 data (Audit)
  const [audit, setAudit] = useState({
    monthly_income: "",
    total_debt: "",
    current_savings: "",
    weekly_work_hours: "",
    weight_kg: "",
    avg_sleep_hours: "",
  });

  const validateSoul = () => {
    const q = SOUL_QUESTIONS[currentQuestion];
    const answer = soulAnswers[q.id];
    if (answer.length < q.minChars) {
      setErrors({ [q.id]: q.errorMsg });
      return false;
    }
    const hasBlockWord = q.blockWords.some(w => answer.toLowerCase().includes(w));
    if (hasBlockWord) {
      setErrors({ [q.id]: q.errorMsg });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSoulNext = () => {
    if (!validateSoul()) return;
    if (currentQuestion < SOUL_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setStep(2);
      setCurrentQuestion(0);
    }
  };

  const validateAudit = () => {
    const required = ["monthly_income", "total_debt", "current_savings", "weekly_work_hours", "weight_kg", "avg_sleep_hours"];
    const newErrors = {};
    required.forEach(k => {
      if (!audit[k] || isNaN(Number(audit[k]))) newErrors[k] = "Valeur numérique requise";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateAudit()) return;
    setLoading(true);

    // Calculate basic ICS from audit data
    const sleepScore = Math.min(Number(audit.avg_sleep_hours) / 8 * 100, 100);
    const workBalance = Math.max(0, 100 - (Number(audit.weekly_work_hours) - 40) * 2);
    const debtRatio = Number(audit.total_debt) > 0
      ? Math.max(0, 100 - (Number(audit.total_debt) / (Number(audit.monthly_income) * 12)) * 100)
      : 80;
    const ics = Math.round((sleepScore * 0.3 + workBalance * 0.3 + debtRatio * 0.4));
    const level = ics >= 80 ? "SOUVERAIN_CONQUETE" : ics >= 40 ? "INTERMEDIAIRE_STRUCTURE" : "DEBUTANT_RESTAURATION";

    await base44.entities.UserProfile.create({
      user_id: (await base44.auth.me()).id,
      soul_archaeology: soulAnswers.q1 + "\n\n" + soulAnswers.q2,
      monthly_income: Number(audit.monthly_income),
      total_debt: Number(audit.total_debt),
      current_savings: Number(audit.current_savings),
      weekly_work_hours: Number(audit.weekly_work_hours),
      weight_kg: Number(audit.weight_kg),
      avg_sleep_hours: Number(audit.avg_sleep_hours),
      ics_score: ics,
      user_level: level,
      onboarding_completed: true,
      era: "AN_I",
    });

    setLoading(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-14 h-14 rounded-2xl bg-yellow-500 flex items-center justify-center mx-auto mb-4">
          <Crown className="w-7 h-7 text-gray-950" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Bâtisseur de Roi</h1>
        <p className="text-white/40 text-sm">Initialisation de ton Identité Royale</p>
      </div>

      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 rounded-full transition-all",
              i < step ? "w-16 bg-yellow-400" : i === step - 1 ? "w-16 bg-yellow-400" : "w-8 bg-white/10"
            )}
          />
        ))}
      </div>

      <div className="w-full max-w-xl">
        {/* STEP 1 — Archéologie de l'Âme */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="border border-white/10 rounded-2xl p-6 bg-white/5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">⚔️</span>
                <div>
                  <h2 className="font-bold text-lg text-white">L'Archéologie de l'Âme</h2>
                  <p className="text-xs text-white/40">{SOUL_QUESTIONS[currentQuestion].author}</p>
                </div>
              </div>
              <p className="text-white/80 text-sm mb-4 leading-relaxed">
                {SOUL_QUESTIONS[currentQuestion].question}
              </p>
              <Textarea
                value={soulAnswers[SOUL_QUESTIONS[currentQuestion].id]}
                onChange={(e) => {
                  setSoulAnswers(prev => ({ ...prev, [SOUL_QUESTIONS[currentQuestion].id]: e.target.value }));
                  if (errors[SOUL_QUESTIONS[currentQuestion].id]) setErrors({});
                }}
                placeholder="Sois précis. Un bâtisseur ne triche pas avec sa propre histoire..."
                className={cn(
                  "bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[140px] resize-none",
                  errors[SOUL_QUESTIONS[currentQuestion].id] && "border-red-500 animate-pulse"
                )}
              />
              <div className="flex justify-between items-center mt-2">
                <span className={cn(
                  "text-xs",
                  soulAnswers[SOUL_QUESTIONS[currentQuestion].id].length < SOUL_QUESTIONS[currentQuestion].minChars
                    ? "text-white/30"
                    : "text-green-400"
                )}>
                  {soulAnswers[SOUL_QUESTIONS[currentQuestion].id].length} / {SOUL_QUESTIONS[currentQuestion].minChars} caractères min.
                </span>
                {errors[SOUL_QUESTIONS[currentQuestion].id] && (
                  <span className="flex items-center gap-1 text-xs text-red-400">
                    <AlertCircle className="w-3 h-3" />
                    {errors[SOUL_QUESTIONS[currentQuestion].id]}
                  </span>
                )}
              </div>
            </div>
            <Button onClick={handleSoulNext} className="w-full bg-yellow-500 hover:bg-yellow-400 text-gray-950 font-bold h-12">
              Continuer <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {/* STEP 2 — Audit du Temple */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="border border-white/10 rounded-2xl p-6 bg-white/5">
              <div className="flex items-center gap-2 mb-5">
                <span className="text-2xl">🏛️</span>
                <div>
                  <h2 className="font-bold text-lg text-white">Audit du Temple et du Capital</h2>
                  <p className="text-xs text-white/40">Bilan comptable, temporel et biologique réel</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-yellow-400 uppercase tracking-wider mb-3">💰 Finances — Ps. Christian Saboukoulou</p>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { key: "monthly_income", label: "Revenus mensuels fixes (€)", placeholder: "ex: 2500" },
                      { key: "total_debt", label: "Totalité des dettes actives (€)", placeholder: "ex: 15000" },
                      { key: "current_savings", label: "Épargne de sécurité actuelle (€)", placeholder: "ex: 3000" },
                    ].map(({ key, label, placeholder }) => (
                      <div key={key}>
                        <label className="text-xs text-white/50 mb-1 block">{label}</label>
                        <Input
                          type="number"
                          placeholder={placeholder}
                          value={audit[key]}
                          onChange={e => setAudit(prev => ({ ...prev, [key]: e.target.value }))}
                          className={cn(
                            "bg-white/5 border-white/10 text-white placeholder:text-white/20",
                            errors[key] && "border-red-500"
                          )}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-blue-400 uppercase tracking-wider mb-3">⏰ Temps — Ps. Samuel Eboumbou</p>
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">Heures hebdomadaires réelles au travail civil</label>
                    <Input
                      type="number"
                      placeholder="ex: 45"
                      value={audit.weekly_work_hours}
                      onChange={e => setAudit(prev => ({ ...prev, weekly_work_hours: e.target.value }))}
                      className={cn("bg-white/5 border-white/10 text-white placeholder:text-white/20", errors.weekly_work_hours && "border-red-500")}
                    />
                  </div>
                </div>

                <div>
                  <p className="text-xs text-orange-400 uppercase tracking-wider mb-3">💪 Santé — Ps. Ghislain Biabatantou</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: "weight_kg", label: "Poids réel (kg)", placeholder: "ex: 78" },
                      { key: "avg_sleep_hours", label: "Heures de sommeil/nuit", placeholder: "ex: 6.5" },
                    ].map(({ key, label, placeholder }) => (
                      <div key={key}>
                        <label className="text-xs text-white/50 mb-1 block">{label}</label>
                        <Input
                          type="number"
                          placeholder={placeholder}
                          value={audit[key]}
                          onChange={e => setAudit(prev => ({ ...prev, [key]: e.target.value }))}
                          className={cn("bg-white/5 border-white/10 text-white placeholder:text-white/20", errors[key] && "border-red-500")}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="border-white/10 text-white/60 hover:text-white hover:bg-white/5">
                Retour
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-gray-950 font-bold h-12"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Calcul de ton ICS...</>
                ) : (
                  <>Activer mon Cockpit Royal <Crown className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}