import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Crown, ChevronDown, User, Shield, ToggleLeft,
  Palette, TrendingUp, Menu, X, Zap
} from "lucide-react";
import { base44 } from "@/api/base44Client";

const PLANS = [
  { key: "spiritual", label: "Spirituel", path: "/plan/spirituel", emoji: "🙏", authority: "Ap. Yvan Castanou" },
  { key: "financial", label: "Financier", path: "/plan/financier", emoji: "💰", authority: "Ps. Christian Saboukoulou" },
  { key: "emotional", label: "Émotionnel", path: "/plan/emotionnel", emoji: "💛", authority: "Ps. Jacques Mbalanda" },
  { key: "time", label: "Gestion du Temps", path: "/plan/temps", emoji: "⏰", authority: "Ps. Samuel Eboumbou" },
  { key: "physical", label: "Santé / Corps", path: "/plan/temple", emoji: "💪", authority: "Ps. Ghislain Biabatantou" },
  { key: "relational", label: "Relationnel", path: "/plan/relationnel", emoji: "🤝", authority: "Cercle d'Honneur" },
];

const PROFILE_MENU = [
  { label: "Mon Identité Royale", path: "/profil/identite", icon: Crown },
  { label: "Coffre Fort Cryptographique", path: "/profil/coffre", icon: Shield },
  { label: "Commutateur d'Honneur", path: "/profil/honneur", icon: ToggleLeft },
  { label: "Mon Studio de Style", path: "/profil/style", icon: Palette },
];

export default function TopNav({ user }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [plansOpen, setPlansOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const plansRef = useRef(null);
  const profileRef = useRef(null);

  const icsScore = user?.ics_score || 0;
  const userLevel = icsScore >= 80 ? "souverain" : icsScore >= 40 ? "intermediaire" : "debutant";

  const levelLabel = {
    debutant: "Débutant",
    intermediaire: "Intermédiaire",
    souverain: "Souverain",
  }[userLevel];

  const levelColor = {
    debutant: "text-blue-400",
    intermediaire: "text-emerald-400",
    souverain: "text-yellow-400",
  }[userLevel];

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e) {
      if (plansRef.current && !plansRef.current.contains(e.target)) setPlansOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isSunday = new Date().getDay() === 0;
  const showRendement = userLevel !== "debutant" || isSunday;

  const navLinkClass = (path) => cn(
    "text-sm font-medium transition-colors px-3 py-2 rounded-lg",
    location.pathname === path
      ? "text-yellow-400 bg-white/10"
      : "text-white/80 hover:text-white hover:bg-white/10"
  );

  return (
    <>
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 border-b",
        userLevel === "souverain"
          ? "bg-black/80 backdrop-blur-xl border-yellow-500/30"
          : "bg-gray-950 border-white/10"
      )}>
        <div className="max-w-7xl mx-auto px-4 flex items-center h-14 gap-2">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mr-4 shrink-0">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              userLevel === "souverain" ? "bg-yellow-500" : "bg-white"
            )}>
              <Crown className="w-4 h-4 text-gray-950" />
            </div>
            <span className={cn(
              "font-bold text-sm hidden sm:block",
              userLevel === "souverain" ? "text-yellow-400" : "text-white"
            )}>
              Bâtisseur de Roi
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1 flex-1">
            {/* Miroir de Soi */}
            <Link to="/" className={navLinkClass("/")}>
              Miroir de Soi
            </Link>

            {/* Les 6 Plans dropdown */}
            <div className="relative" ref={plansRef}>
              <button
                onClick={() => setPlansOpen(!plansOpen)}
                className={cn(
                  "flex items-center gap-1 text-sm font-medium px-3 py-2 rounded-lg transition-colors",
                  location.pathname.startsWith("/plan")
                    ? "text-yellow-400 bg-white/10"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                Les 6 Plans <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", plansOpen && "rotate-180")} />
              </button>
              {plansOpen && (
                <div className="absolute top-full left-0 mt-1 w-72 bg-gray-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                  {PLANS.map((plan) => (
                    <Link
                      key={plan.key}
                      to={plan.path}
                      onClick={() => setPlansOpen(false)}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors group"
                    >
                      <span className="text-xl mt-0.5">{plan.emoji}</span>
                      <div>
                        <p className="text-sm font-medium text-white group-hover:text-yellow-400 transition-colors">{plan.label}</p>
                        <p className="text-xs text-white/40">{plan.authority}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Mon Rendement */}
            {showRendement ? (
              <Link to="/rendement" className={navLinkClass("/rendement")}>
                Mon Rendement
              </Link>
            ) : (
              <button
                className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg text-white/30 cursor-not-allowed"
                title="Disponible le dimanche soir"
              >
                Mon Rendement <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded">🔒</span>
              </button>
            )}
          </div>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-3">
            {/* Level indicator */}
            <div className="hidden sm:flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1">
              <Zap className={cn("w-3 h-3", levelColor)} />
              <span className={cn("text-xs font-medium", levelColor)}>{levelLabel}</span>
              {icsScore > 0 && <span className="text-xs text-white/40">{Math.round(icsScore)}%</span>}
            </div>

            {/* Profile dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <User className="w-4 h-4 text-white" />
              </button>
              {profileOpen && (
                <div className="absolute top-full right-0 mt-1 w-64 bg-gray-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-xs text-white/40">Connecté en tant que</p>
                    <p className="text-sm font-medium text-white truncate">{user?.email || "—"}</p>
                  </div>
                  {PROFILE_MENU.map(({ label, path, icon: Icon }) => (
                    <Link
                      key={path}
                      to={path}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-sm text-white/80 hover:text-white"
                    >
                      <Icon className="w-4 h-4 text-white/40" />
                      {label}
                    </Link>
                  ))}
                  <div className="border-t border-white/10">
                    <button
                      onClick={() => base44.auth.logout()}
                      className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-white/5 transition-colors"
                    >
                      Se déconnecter
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-white/80 hover:text-white"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-gray-950 border-t border-white/10 px-4 py-3 space-y-1">
            <Link to="/" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-white/80 hover:text-white rounded-lg hover:bg-white/5">
              Miroir de Soi
            </Link>
            <div className="px-3 py-1">
              <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Les 6 Plans</p>
              {PLANS.map((plan) => (
                <Link
                  key={plan.key}
                  to={plan.path}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-2 py-2 text-sm text-white/70 hover:text-white rounded-lg hover:bg-white/5"
                >
                  <span>{plan.emoji}</span> {plan.label}
                </Link>
              ))}
            </div>
            {showRendement && (
              <Link to="/rendement" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-white/80 hover:text-white rounded-lg hover:bg-white/5">
                Mon Rendement
              </Link>
            )}
          </div>
        )}
      </nav>
      {/* Spacer for fixed nav */}
      <div className="h-14" />
    </>
  );
}