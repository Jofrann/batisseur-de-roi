import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, TrendingUp, TrendingDown, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

const CATEGORIES = [
  { value: "revenu_fixe", label: "💼 Revenu fixe", type: "in" },
  { value: "revenu_variable", label: "📈 Revenu variable", type: "in" },
  { value: "investissement_royaume", label: "⛪ Investissement du Royaume (dîme/offrande)", type: "out" },
  { value: "epargne", label: "🏦 Épargne d'intendance", type: "out" },
  { value: "logement", label: "🏠 Logement", type: "out" },
  { value: "alimentation", label: "🍽️ Alimentation", type: "out" },
  { value: "transport", label: "🚗 Transport", type: "out" },
  { value: "sante", label: "💊 Santé / Temple", type: "out" },
  { value: "formation", label: "📚 Formation / Croissance", type: "out" },
  { value: "famille", label: "👨‍👩‍👧 Famille & Honneur", type: "out" },
  { value: "autre", label: "🔄 Autre", type: "out" },
];

export default function MatriceFlux() {
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: "", amount: "", category: "", type: "out" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadEntries(); }, []);

  const loadEntries = async () => {
    const data = await base44.entities.DailyActionLogEntry.filter({ pillar: "financial" }, "-action_date", 100);
    setEntries(data);
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.DailyActionLogEntry.create({
      action_date: new Date().toISOString().slice(0, 10),
      pillar: "financial",
      title: form.label,
      description: form.category,
      time_spent_minutes: Math.round(parseFloat(form.amount) * 100),
      status: "completed",
      notes: form.type,
    });
    setForm({ label: "", amount: "", category: "", type: "out" });
    setShowForm(false);
    await loadEntries();
    setSaving(false);
  };

  const getAmount = (e) => (e.time_spent_minutes || 0) / 100;
  const isIncome = (e) => e.notes === "in";

  const totalIn = entries.filter(isIncome).reduce((s, e) => s + getAmount(e), 0);
  const totalOut = entries.filter(e => !isIncome(e)).reduce((s, e) => s + getAmount(e), 0);
  const balance = totalIn - totalOut;

  const handleDelete = async (id) => {
    await base44.entities.DailyActionLogEntry.delete(id);
    setEntries(entries.filter(e => e.id !== id));
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-950 text-white p-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/plan/financier">
            <Button variant="ghost" size="sm" className="text-white/40 hover:text-white gap-1">
              <ArrowLeft className="w-4 h-4" /> Retour
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Matrice des Flux Budgétaires</h1>
            <p className="text-white/50 text-sm">Trésorerie & Intendance Souveraine</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} size="sm" className="bg-green-600 hover:bg-green-500 gap-1">
            <Plus className="w-4 h-4" /> Ajouter
          </Button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="border-green-500/30 bg-green-950/20">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-4 h-4 text-green-400 mx-auto mb-1" />
              <p className="text-xs text-white/40">Entrées</p>
              <p className="text-xl font-bold text-green-400">{totalIn.toFixed(2)} €</p>
            </CardContent>
          </Card>
          <Card className="border-red-500/30 bg-red-950/20">
            <CardContent className="p-4 text-center">
              <TrendingDown className="w-4 h-4 text-red-400 mx-auto mb-1" />
              <p className="text-xs text-white/40">Sorties</p>
              <p className="text-xl font-bold text-red-400">{totalOut.toFixed(2)} €</p>
            </CardContent>
          </Card>
          <Card className={`border-${balance >= 0 ? "yellow" : "red"}-500/30 bg-${balance >= 0 ? "yellow" : "red"}-950/20`}>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-white/40">Balance</p>
              <p className={`text-xl font-bold ${balance >= 0 ? "text-yellow-400" : "text-red-400"}`}>
                {balance >= 0 ? "+" : ""}{balance.toFixed(2)} €
              </p>
            </CardContent>
          </Card>
        </div>

        {showForm && (
          <Card className="border-green-500/30 bg-green-950/20 mb-4">
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-white/50 mb-1 block">Type</Label>
                  <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in">💰 Entrée</SelectItem>
                      <SelectItem value="out">💸 Sortie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-white/50 mb-1 block">Montant (€)</Label>
                  <Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                    placeholder="0.00" className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                </div>
              </div>
              <div>
                <Label className="text-xs text-white/50 mb-1 block">Libellé</Label>
                <Input value={form.label} onChange={e => setForm({ ...form, label: e.target.value })}
                  placeholder="Ex: Salaire, Dîme, Loyer..." className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
              </div>
              <div>
                <Label className="text-xs text-white/50 mb-1 block">Catégorie</Label>
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Choisir une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.filter(c => form.type === "in" ? c.type === "in" : c.type === "out").map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setShowForm(false)} className="text-white/40">Annuler</Button>
                <Button onClick={handleSave} disabled={saving || !form.label || !form.amount} className="bg-green-600 hover:bg-green-500">
                  {saving ? "..." : "Enregistrer"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          {entries.length === 0 ? (
            <Card className="border-dashed border-white/10">
              <CardContent className="p-8 text-center text-white/40 text-sm">
                Aucun flux enregistré. Commence à tracer ton intendance.
              </CardContent>
            </Card>
          ) : (
            entries.map(e => (
              <div key={e.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                isIncome(e) ? "border-green-500/20 bg-green-950/10" : "border-white/5 bg-white/5"
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-lg">{isIncome(e) ? "💰" : "💸"}</span>
                  <div>
                    <p className="text-sm font-medium text-white">{e.title}</p>
                    <p className="text-xs text-white/40">{CATEGORIES.find(c => c.value === e.description)?.label || e.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-bold ${isIncome(e) ? "text-green-400" : "text-white/60"}`}>
                    {isIncome(e) ? "+" : "-"}{getAmount(e).toFixed(2)} €
                  </span>
                  <button onClick={() => handleDelete(e.id)} className="text-white/20 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}