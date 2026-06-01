import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';

import Dashboard from '@/pages/Dashboard';
import Goals from '@/pages/Goals';
import DailyJournal from '@/pages/DailyJournal';
import DailyActions from '@/pages/DailyActions';
import MonthlyDiagnostic from '@/pages/MonthlyDiagnostic';
import MonthlySummary from '@/pages/MonthlySummary';
import CalendarView from '@/pages/CalendarView';
import Onboarding from '@/pages/Onboarding';
import PlanSpirituel from '@/pages/plans/PlanSpirituel';
import PlanFinancier from '@/pages/plans/PlanFinancier';
import PlanEmotionnel from '@/pages/plans/PlanEmotionnel';
import PlanTemps from '@/pages/plans/PlanTemps';
import PlanTemple from '@/pages/plans/PlanTemple';
import PlanRelationnel from '@/pages/plans/PlanRelationnel';
import IdentiteRoyale from '@/pages/profil/IdentiteRoyale';
import BriseForteresse from '@/pages/plans/spirituel/BriseForteresse';
import JournalEcoute from '@/pages/plans/spirituel/JournalEcoute';
import MatriceFlux from '@/pages/plans/financier/MatriceFlux';
import DetecteurFuites from '@/pages/plans/financier/DetecteurFuites';
import CartographieBlessures from '@/pages/plans/emotionnel/CartographieBlessures';
import TriggerTracker from '@/pages/plans/emotionnel/TriggerTracker';
import Planificateur from '@/pages/plans/temps/Planificateur';
import Ecartometre from '@/pages/plans/temps/Ecartometre';
import CadranVitalite from '@/pages/plans/temple/CadranVitalite';
import AntidoteParesse from '@/pages/plans/temple/AntidoteParesse';
import CercleHonneur from '@/pages/plans/relationnel/CercleHonneur';
import Engagements from '@/pages/plans/relationnel/Engagements';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/onboarding" element={<Onboarding />} />
      {/* Plans de Transformation */}
      <Route path="/plan/spirituel" element={<PlanSpirituel />} />
      <Route path="/plan/financier" element={<PlanFinancier />} />
      <Route path="/plan/emotionnel" element={<PlanEmotionnel />} />
      <Route path="/plan/temps" element={<PlanTemps />} />
      <Route path="/plan/temple" element={<PlanTemple />} />
      <Route path="/plan/relationnel" element={<PlanRelationnel />} />
      {/* Sous-pages Plan Spirituel */}
      <Route path="/plan/spirituel/brise-forteresse" element={<BriseForteresse />} />
      <Route path="/plan/spirituel/journal-ecoute" element={<JournalEcoute />} />
      {/* Sous-pages Plan Financier */}
      <Route path="/plan/financier/matrice" element={<MatriceFlux />} />
      <Route path="/plan/financier/fuites" element={<DetecteurFuites />} />
      {/* Sous-pages Plan Émotionnel */}
      <Route path="/plan/emotionnel/blessures" element={<CartographieBlessures />} />
      <Route path="/plan/emotionnel/trigger" element={<TriggerTracker />} />
      {/* Sous-pages Plan Temps */}
      <Route path="/plan/temps/planificateur" element={<Planificateur />} />
      <Route path="/plan/temps/ecartometre" element={<Ecartometre />} />
      {/* Sous-pages Plan Temple */}
      <Route path="/plan/temple/vitalite" element={<CadranVitalite />} />
      <Route path="/plan/temple/antidote" element={<AntidoteParesse />} />
      {/* Sous-pages Plan Relationnel */}
      <Route path="/plan/relationnel/cercle" element={<CercleHonneur />} />
      <Route path="/plan/relationnel/engagements" element={<Engagements />} />
      {/* Profil */}
      <Route path="/profil/identite" element={<IdentiteRoyale />} />
      {/* Legacy routes */}
      <Route path="/goals" element={<Goals />} />
      <Route path="/journal" element={<DailyJournal />} />
      <Route path="/actions" element={<DailyActions />} />
      <Route path="/diagnostic" element={<MonthlyDiagnostic />} />
      <Route path="/bilan" element={<MonthlySummary />} />
      <Route path="/calendrier" element={<CalendarView />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App