import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Heart, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";

const BLESSURES = [
  {
    key: "rejet",
    label: "Rejet",
    emoji: "💔",
    desc: "Sentiment de ne pas être accepté, aimé ou voulu pour ce qu'on est.",
    signes: ["Peur d'être abandonné", "Cherche constamment l'approbation", "Se retire avant d'être rejeté"],
    guerison: "Ancre ton identité dans l'acceptation divine inconditionnelle (Ép 1:6).",
    color: "border-pink-500/30 bg-pink-950/20",
  },
  {
    key: "abandon",
    label: "Abandon",
    emoji: "🌑",
    desc: "Peur profonde d'être laissé seul, livré à soi-même.",
    signes: ["Dépendance affective", "Sabotage des relations stables", "Anxiété de séparation"],
    guerison: "S'appuyer sur la promesse : « Je ne te délaisserai point » (Héb 13:5).",
    color: "border-indigo-500/30 bg-indigo-950/20",
  },
  {
    key: "humiliation",
    label: "Humiliation",
    emoji: "😔",
    desc: "Honte profonde liée à des situations dégradantes vécues ou perçues.",
    signes: ["Arrogance défensive", "Perfectionnisme excessif", "Incapacité à recevoir des critiques"],
    guerison: "L'Éternel relève celui qui est humilié — reconstruire la dignité en Christ (Ps 113:7-8).",
    color: "border-orange-500/30 bg-orange-950/20",
  },
  {
    key: "trahison",
    label: "Trahison",
    emoji: "🗡️",
    desc: "Rupture de confiance par quelqu'un sur qui l'on comptait.",
    signes: ["Méfiance systématique", "Difficulté à déléguer", "Contrôle excessif"],
    guerison: "Le pardon libère le prisonnier... et le prisonnier c'est toi (Matt 6:14-15).",
    color: "border-red-500/30 bg-red-950/20",
  },
  {
    key: "injustice",
    label: "Injustice",
    emoji: "⚖️",
    desc: "Sentiment d'avoir été traité de manière inégale, sans équité.",
    signes: ["Rigidité morale", "Perfectionnisme", "Colère froide", "Difficulté à accepter l'imperfection"],
    guerison: "Dieu est le Juge juste — remettre la vengeance et attendre Sa justice (Rom 12:19).",
    color: "border-yellow-500/30 bg-yellow-950/20",
  },
];

export default function CartographieBlessures() {
  const [expanded, setExpanded] = useState(null);
  const [journalEntry, setJournalEntry] = useState({});
  const [savedKeys, setSavedKeys] = useState([]);
  const [saving, setSaving] = useState(null);

  const handleSave = async (blessureKey, content) => {
    if (!content.trim()) return;
    setSaving(blessureKey);
    await base44.entities.DailyJournalEntry.create({
      entry_date: new Date().toISOString().slice(0, 10),
      pillar: "emotional",
      content: content,
      blockers: `BLESSURE:${blessureKey}`,
    });
    setSavedKeys([...savedKeys, blessureKey]);
    setJournalEntry({ ...journalEntry, [blessureKey]: "" });
    setSaving(null);
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-950 text-white p-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/plan/emotionnel">
            <Button variant="ghost" size="sm" className="text-white/40 hover:text-white gap-1">
              <ArrowLeft className="w-4 h-4" /> Retour
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center">
            <Heart className="w-6 h-6 text-pink-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Cartographie des 5 Blessures</h1>
            <p className="text-white/50 text-sm">Suivi clinique de l'évolution de l'âme</p>
          </div>
        </div>

        <p className="text-white/40 text-sm mb-6">
          Chaque blessure non guérie génère un masque défensif qui sabote ta trajectoire. 
          Identifie, reconnais, et applique le protocole de guérison active.
        </p>

        <div className="space-y-3">
          {BLESSURES.map(b => (
            <Card key={b.key} className={`border ${b.color}`}>
              <button
                className="w-full text-left"
                onClick={() => setExpanded(expanded === b.key ? null : b.key)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{b.emoji}</span>
                    <div>
                      <p className="font-bold text-white">{b.label}</p>
                      <p className="text-xs text-white/50">{b.desc}</p>
                    </div>
                  </div>
                  {expanded === b.key ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
                </CardContent>
              </button>

              {expanded === b.key && (
                <CardContent className="px-4 pb-4 pt-0 space-y-4 border-t border-white/10">
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Signes révélateurs</p>
                    <ul className="space-y-1">
                      {b.signes.map((s, i) => (
                        <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                          <span className="text-pink-400 shrink-0">•</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-xs text-yellow-400 font-medium mb-1">🔑 Protocole de guérison</p>
                    <p className="text-sm text-white/70 italic">{b.guerison}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-white/50 mb-1 block">Ton journal de progression</Label>
                    <Textarea
                      value={journalEntry[b.key] || ""}
                      onChange={e => setJournalEntry({ ...journalEntry, [b.key]: e.target.value })}
                      placeholder="Comment cette blessure se manifeste-t-elle dans ta vie ? Qu'as-tu fait cette semaine pour guérir ?"
                      rows={3}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                    />
                    <Button
                      onClick={() => handleSave(b.key, journalEntry[b.key] || "")}
                      disabled={saving === b.key || !journalEntry[b.key]?.trim()}
                      size="sm" className="mt-2 bg-pink-600 hover:bg-pink-500"
                    >
                      {savedKeys.includes(b.key) ? "✓ Enregistré" : saving === b.key ? "..." : "Sceller cette progression"}
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}