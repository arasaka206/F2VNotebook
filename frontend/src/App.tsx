import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import LivestockPage from './pages/LivestocksPage';
import PublicDashboard from './pages/PublicDashboard';
import QuizPage from './pages/QuizPage';
import NotebookPage from './pages/NotebookPage';
import ProfilePage from './pages/ProfilePage';
import ChatPage from './pages/ChatPage';
import HeatDiseaseMapPage from './pages/HeatDiseaseMapPage';
import VetConnectPage from './pages/VetConnectPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

function AppContent() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState('landing');

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-farm-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-accent mx-auto mb-4"></div>
          <p className="text-farm-text/60">{t('auth.loading')}</p>
        </div>
      </div>
    );
  }

  // If user is not logged in, show landing, login, or signup pages
  if (!user) {
    if (activePage === 'login') {
      return <LoginPage onNavigate={setActivePage} onLoginSuccess={() => setActivePage('dashboard')} />;
    }
    if (activePage === 'signup') {
      return <SignupPage onNavigate={setActivePage} onSignupSuccess={() => setActivePage('dashboard')} />;
    }
    return <LandingPage onNavigate={setActivePage} />;
  }

  const PAGE_TITLES: Record<string, string> = {
    landing: t('app.home'),
    dashboard: t('app.dashboard'),
    notebook: t('app.notebook'),
    livestock: t('app.livestock'),
    'disease-map': t('app.diseaseMap'),
    'vet-connect': t('app.vetConnect'),
    quizzes: t('app.quizzes'),
    'public-dashboard': t('app.publicDashboard'),
    chat: t('app.chat'),
    inventory: t('app.inventory'),
    reports: t('app.reports'),
    profile: t('app.farmerProfile'),
  };

  const renderPage = () => {
    switch (activePage) {
      case 'landing':
        return <LandingPage onNavigate={setActivePage} />;
      case 'dashboard':
        return <Dashboard />;
      case 'notebook':
        return <NotebookPage />;
      case 'livestock':
        return <LivestockPage />;
      case 'disease-map':
        return <HeatDiseaseMapPage />;
      case 'vet-connect':
        return <VetConnectPage />;
      case 'quizzes':
        return <QuizPage />;
      case 'public-dashboard':
        return <PublicDashboard />;
      case 'chat':
        return <ChatPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return (
          <div className="flex flex-1 items-center justify-center p-6">
            <div className="text-center">
              <div className="text-6xl mb-4">🚧</div>
              <h2 className="text-xl font-bold text-white mb-2">{PAGE_TITLES[activePage]}</h2>
              <p className="text-gray-400 text-sm">{t('app.comingSoon')}</p>
            </div>
          </div>
        );
    }
  };

  if (activePage === 'landing') {
    return <LandingPage onNavigate={setActivePage} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-farm-bg">
      <Sidebar activeItem={activePage} onNavigate={setActivePage} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar title={PAGE_TITLES[activePage] ?? 'Farm2Vets'} onNavigate={setActivePage} />
        <main className="flex flex-1 overflow-hidden">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
