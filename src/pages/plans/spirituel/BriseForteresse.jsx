import { useState } from "react";
import { base44 } from "@/api/base44Client";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Flame, Sword, Shield, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const FORTRESSES = [
  { key: "fear", label: "Peur du jugement", decree: "« Car Dieu ne nous a pas donné un esprit de peur, mais de force, d'amour et de sagesse. » — 2 Tim 1:7" },
  { key: "unworthiness", label: "Je ne mérite pas le succès", decree: "« Je puis tout par Christ qui me fortifie. » — Phil 4:13" },
  { key: "rejection", label: "Je suis rejeté / abandonné", decree: "« Lui-même a dit : Je ne te délaisserai point, et je ne t'abandonnerai point. » — Héb 13:5" },
  { key: "guilt", label: "Je suis esclave de mon passé", decree: "« Il n'y a donc maintenant aucune condamnation pour ceux qui sont en Jésus-Christ. » — Rom 8:1" },
  { key: "poverty", label: "Je suis destiné à être pauvre", decree: "« Mon Dieu pourvoira à tous vos besoins selon sa richesse, avec gloire, en Jésus-Christ. » — Phil 4:19" },
];

export default function BriseForteresse() {
  const [selectedFortress, setSelectedFortress] = useState(null);
  const [customThought, setCustomThought] = useState("");
  const [phase, setPhase] = useState("select"); // select | analyze | decree
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    const thought = selectedFortress
      ? FORTRESSES.find(f => f.key === selectedFortress)?.label
      : customThought;
    if (!thought) return;
    setLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Tu es un conseiller spirituel expert en renouvellement de l'intelligence (Rom 12:2). L'utilisateur déclare lutter contre cette pensée dominante : "${thought}". 
      1. Identifie la forteresse mentale sous-jacente en 1-2 phrases. 
      2. Donne l'origine probable (blessure d'âme ou mensonge fondateur) en 1 phrase. 
      3. Formule un décret d'autorité scripturaire personnalisé (commence par "Je décrète..." basé sur la Parole de Dieu).
      4. Donne 3 actions concrètes de renouvellement cette semaine.
      Réponds en JSON : { "forteresse": "", "origine": "", "decree": "", "actions": [] }`,
      response_json_schema: {
        type: "object",
        properties: {
          forteresse: { type: "string" },
          origine: { type: "string" },
          decree: { type: "string" },
          actions: { type: "array", items: { type: "string" } },
        },
      },
    });
    setAnalysis(res);
    setPhase("decree");
    setLoading(false);
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-950 text-white p-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/plan/spirituel">
            <Button variant="ghost" size="sm" className="text-white/40 hover:text-white gap-1">
              <ArrowLeft className="w-4 h-4" /> Retour
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Sword className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Le Brise-Forteresse</h1>
            <p className="text-white/50 text-sm">Renouvellement des pensées dominantes</p>
          </div>
        </div>

        {phase === "select" && (
          <div className="space-y-4">
            <p className="text-white/60 text-sm">Quelle pensée dominante te limite aujourd'hui ?</p>
            <div className="space-y-2">
              {FORTRESSES.map(f => (
                <button
                  key={f.key}
                  onClick={() => setSelectedFortress(f.key)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedFortress === f.key
                      ? "border-purple-500 bg-purple-500/20"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="text-sm">« {f.label} »</span>
                    {selectedFortress === f.key && <CheckCircle2 className="w-4 h-4 text-purple-400 ml-auto" />}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4">
              <p className="text-xs text-white/40 mb-2">Ou décris ta propre forteresse :</p>
              <Textarea
                value={customThought}
                onChange={e => { setCustomThought(e.target.value); setSelectedFortress(null); }}
                placeholder="Exprime la pensée qui te retient..."
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                rows={3}
              />
            </div>

            <Button
              onClick={() => setPhase("analyze")}
              disabled={!selectedFortress && !customThought.trim()}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white"
            >
              Analyser cette forteresse
            </Button>
          </div>
        )}

        {phase === "analyze" && (
          <div className="space-y-4">
            <Card className="border-purple-500/30 bg-purple-950/20">
              <CardContent className="p-5">
                <p className="text-white/70 text-sm mb-1">Forteresse identifiée :</p>
                <p className="font-semibold text-white">
                  « {selectedFortress ? FORTRESSES.find(f => f.key === selectedFortress)?.label : customThought} »
                </p>
                {selectedFortress && (
                  <div className="mt-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <p className="text-xs text-purple-300 font-medium mb-1">Décret scripturaire :</p>
                    <p className="text-sm text-white/80 italic">{FORTRESSES.find(f => f.key === selectedFortress)?.decree}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            <Button onClick={handleAnalyze} disabled={loading} className="w-full bg-purple-600 hover:bg-purple-500">
              {loading ? "Analyse en cours..." : "Obtenir un décret d'autorité personnalisé ✨"}
            </Button>
            <Button variant="ghost" onClick={() => setPhase("select")} className="w-full text-white/40">
              ← Modifier ma pensée
            </Button>
          </div>
        )}

        {phase === "decree" && analysis && (
          <div className="space-y-4">
            <Card className="border-purple-500/30 bg-purple-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-purple-300 flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Forteresse identifiée
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-white/40 mb-1">Nature de la forteresse :</p>
                  <p className="text-sm text-white">{analysis.forteresse}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40 mb-1">Origine probable :</p>
                  <p className="text-sm text-white/70 italic">{analysis.origine}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-500/30 bg-yellow-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-yellow-300 flex items-center gap-2">
                  <Flame className="w-4 h-4" /> Ton Décret d'Autorité
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white font-medium leading-relaxed">{analysis.decree}</p>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-white/60">Actions de renouvellement cette semaine</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {(analysis.actions || []).map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                      <span className="text-purple-400 shrink-0">→</span> {a}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Button onClick={() => { setPhase("select"); setSelectedFortress(null); setCustomThought(""); setAnalysis(null); }}
              variant="outline" className="w-full border-white/10 text-white/60 hover:text-white">
              Traiter une autre forteresse
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}