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