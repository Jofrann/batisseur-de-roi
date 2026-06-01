import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const ETAPES = [
  { key: "declencheur", label: "🔴 Qu'est-ce qui s'est passé ?", placeholder: "Décris objectivement la situation déclencheuse..." },
  { key: "reaction", label: "⚡ Comment as-tu réagi ?", placeholder: "Ta réaction émotionnelle et/ou comportementale immédiate..." },
  { key: "blessure", label: "🌑 Quelle blessure cela a-t-il réveillé ?", placeholder: "Rejet ? Abandon ? Trahison ? Humiliation ? Injustice ?" },
  { key: "verite", label: "📖 Quelle est la vérité de Dieu sur cette situation ?", placeholder: "Un verset, une promesse, une vérité scripturaire..." },
  { key: "decision", label: "⚔️ Quelle décision souveraine tu prends maintenant ?", placeholder: "Action concrète pour reprendre le contrôle..." },
];

export default function TriggerTracker() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => {
    const data = await base44.entities.DailyJournalEntry.filter({ pillar: "emotional" }, "-entry_date", 30);
    setHistory(data.filter(d => d.blockers?.startsWith("TRIGGER:")));
  };

  const handleNext = () => {
    if (step < ETAPES.length - 1) setStep(step + 1);
    else handleSave();
  };

  const handleSave = async () => {
    setSaving(true);
    const content = ETAPES.map(e => `${e.label}\n${answers[e.key] || "(non renseigné)"}`).join("\n\n");
    await base44.entities.DailyJournalEntry.create({
      entry_date: new Date().toISOString().slice(0, 10),
      pillar: "emotional",
      content: answers.declencheur || "Trigger enregistré",
      blockers: `TRIGGER:${answers.blessure || "non identifié"}`,
      gratitude: answers.decision || "",
    });
    setDone(true);
    setSaving(false);
    loadHistory();
  };

  const reset = () => { setStep(0); setAnswers({}); setDone(false); };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-950 text-white p-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/plan/emotionnel">
            <Button variant="ghost" size="sm" className="text-white/40 hover:text-white gap-1">
              <ArrowLeft className="w-4 h-4" /> Retour
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Trigger Tracker</h1>
            <p className="text-white/50 text-sm">Module d'urgence émotionnelle — Recentrage psychologique</p>
          </div>
        </div>

        {done ? (
          <Card className="border-green-500/30 bg-green-950/20">
            <CardContent className="p-8 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto" />
              <h2 className="text-xl font-bold text-white">Recentrage accompli</h2>
              <p className="text-white/60 text-sm">Tu as traversé la réaction avec discernement. La souveraineté se construit dans ces moments.</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={reset} className="bg-rose-600 hover:bg-rose-500">Nouveau trigger</Button>
                <Button variant="outline" onClick={() => setShowHistory(!showHistory)} className="border-white/10 text-white/60">
                  Historique
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Progress */}
            <div className="flex gap-1 mb-6">
              {ETAPES.map((_, i) => (
                <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i <= step ? "bg-rose-400" : "bg-white/10"}`} />
              ))}
            </div>

            <Card className="border-rose-500/30 bg-rose-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-rose-300">{ETAPES[step].label}</CardTitle>
                <p className="text-xs text-white/30">Étape {step + 1} sur {ETAPES.length}</p>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={answers[ETAPES[step].key] || ""}
                  onChange={e => setAnswers({ ...answers, [ETAPES[step].key]: e.target.value })}
                  placeholder={ETAPES[step].placeholder}
                  rows={5}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                />
              </CardContent>
            </Card>

            <div className="flex gap-3">
              {step > 0 && (
                <Button variant="ghost" onClick={() => setStep(step - 1)} className="text-white/40">
                  ← Précédent
                </Button>
              )}
              <Button
                onClick={handleNext}
                disabled={saving || !answers[ETAPES[step].key]?.trim()}
                className="flex-1 bg-rose-600 hover:bg-rose-500"
              >
                {saving ? "Enregistrement..." : step === ETAPES.length - 1 ? "Sceller le recentrage ✓" : "Étape suivante →"}
              </Button>
            </div>
          </div>
        )}

        {showHistory && history.length > 0 && (
          <div className="mt-6 space-y-2">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Historique</p>
            {history.map(h => (
              <div key={h.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex justify-between items-start">
                  <p className="text-sm text-white line-clamp-1">{h.content}</p>
                  <span className="text-xs text-white/30 ml-2 shrink-0">{h.entry_date}</span>
                </div>
                <p className="text-xs text-rose-400/70 mt-1">{(h.blockers || "").replace("TRIGGER:", "Blessure : ")}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}