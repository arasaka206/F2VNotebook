import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import DashboardTour, { type DashboardTourStep } from './components/dashboard/DashboardTour';
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
import InventoryPage from './pages/InventoryPage';
import AnalyticsPage from './pages/AnalyticsPage';

const APP_TOUR_STORAGE_KEY = 'f2v.guidedTourStatus.v2';

type AppTourStatus = 'unseen' | 'skipped' | 'completed';

const readAppTourStatus = (): AppTourStatus => {
  if (typeof window === 'undefined') {
    return 'unseen';
  }

  const storedStatus = window.localStorage.getItem(APP_TOUR_STORAGE_KEY);
  if (storedStatus === 'skipped' || storedStatus === 'completed') {
    return storedStatus;
  }

  return 'unseen';
};

function AppContent() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState('landing');
  const [tourStatus, setTourStatus] = useState<AppTourStatus>(() => readAppTourStatus());
  const [isTourOpen, setIsTourOpen] = useState(false);
  const sidebarNavigationRef = useRef<HTMLElement | null>(null);
  const diseaseMapNavRef = useRef<HTMLButtonElement | null>(null);
  const dashboardOverviewRef = useRef<HTMLDivElement | null>(null);
  const dashboardQuickActionsRef = useRef<HTMLDivElement | null>(null);
  const dashboardSensorsRef = useRef<HTMLDivElement | null>(null);
  const dashboardAlertsRef = useRef<HTMLDivElement | null>(null);
  const dashboardNotificationsRef = useRef<HTMLDivElement | null>(null);
  const dashboardActivityRef = useRef<HTMLDivElement | null>(null);
  const diseaseMapIntroRef = useRef<HTMLDivElement | null>(null);
  const diseaseMapSpreadRef = useRef<HTMLDivElement | null>(null);
  const diseaseMapFarmRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (tourStatus === 'unseen' && activePage === 'dashboard') {
      setIsTourOpen(true);
    }
  }, [activePage, tourStatus]);

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

  const openTour = () => {
    setIsTourOpen(true);
  };

  const closeTour = (status: Exclude<AppTourStatus, 'unseen'>) => {
    setIsTourOpen(false);
    setTourStatus(status);
    window.localStorage.setItem(APP_TOUR_STORAGE_KEY, status);
  };

  const tourLabel = tourStatus === 'unseen' ? t('dashboard.tour.start') : t('dashboard.tour.replay');

  const appTourSteps: DashboardTourStep[] = [
    {
      id: 'navigation',
      page: 'dashboard',
      title: t('dashboard.tour.steps.navigation.title'),
      description: t('dashboard.tour.steps.navigation.description'),
      targetRef: sidebarNavigationRef,
    },
    {
      id: 'overview',
      page: 'dashboard',
      title: t('dashboard.tour.steps.overview.title'),
      description: t('dashboard.tour.steps.overview.description'),
      targetRef: dashboardOverviewRef,
    },
    {
      id: 'quick-actions',
      page: 'dashboard',
      title: t('dashboard.tour.steps.quickActions.title'),
      description: t('dashboard.tour.steps.quickActions.description'),
      targetRef: dashboardQuickActionsRef,
    },
    {
      id: 'sensors',
      page: 'dashboard',
      title: t('dashboard.tour.steps.sensors.title'),
      description: t('dashboard.tour.steps.sensors.description'),
      targetRef: dashboardSensorsRef,
    },
    {
      id: 'alerts',
      page: 'dashboard',
      title: t('dashboard.tour.steps.alerts.title'),
      description: t('dashboard.tour.steps.alerts.description'),
      targetRef: dashboardAlertsRef,
    },
    {
      id: 'notifications',
      page: 'dashboard',
      title: t('dashboard.tour.steps.notifications.title'),
      description: t('dashboard.tour.steps.notifications.description'),
      targetRef: dashboardNotificationsRef,
    },
    {
      id: 'activity',
      page: 'dashboard',
      title: t('dashboard.tour.steps.activity.title'),
      description: t('dashboard.tour.steps.activity.description'),
      targetRef: dashboardActivityRef,
    },
    {
      id: 'disease-map-navigation',
      page: 'dashboard',
      title: t('dashboard.tour.steps.diseaseMapNavigation.title'),
      description: t('dashboard.tour.steps.diseaseMapNavigation.description'),
      targetRef: diseaseMapNavRef,
    },
    {
      id: 'disease-map-intro',
      page: 'disease-map',
      title: t('dashboard.tour.steps.diseaseMapIntro.title'),
      description: t('dashboard.tour.steps.diseaseMapIntro.description'),
      targetRef: diseaseMapIntroRef,
    },
    {
      id: 'disease-map-spread',
      page: 'disease-map',
      title: t('dashboard.tour.steps.diseaseMapSpread.title'),
      description: t('dashboard.tour.steps.diseaseMapSpread.description'),
      targetRef: diseaseMapSpreadRef,
    },
    {
      id: 'disease-map-farm',
      page: 'disease-map',
      title: t('dashboard.tour.steps.diseaseMapFarm.title'),
      description: t('dashboard.tour.steps.diseaseMapFarm.description'),
      targetRef: diseaseMapFarmRef,
    },
  ];

  const renderPage = () => {
    switch (activePage) {
      case 'landing':
        return <LandingPage onNavigate={setActivePage} />;
      case 'dashboard':
        return (
          <Dashboard
            onOpenTour={openTour}
            tourLabel={tourLabel}
            overviewRef={dashboardOverviewRef}
            quickActionsRef={dashboardQuickActionsRef}
            sensorsRef={dashboardSensorsRef}
            alertsRef={dashboardAlertsRef}
            notificationsRef={dashboardNotificationsRef}
            activityRef={dashboardActivityRef}
          />
        );
      case 'notebook':
        return <NotebookPage />;
      case 'livestock':
        return <LivestockPage />;
      case 'disease-map':
        return (
          <HeatDiseaseMapPage
            onOpenTour={openTour}
            tourLabel={tourLabel}
            introRef={diseaseMapIntroRef}
            diseaseSpreadRef={diseaseMapSpreadRef}
            farmMapRef={diseaseMapFarmRef}
          />
        );
      case 'vet-connect':
        return <VetConnectPage />;
      case 'quizzes':
        return <QuizPage />;
      case 'public-dashboard':
        return <PublicDashboard />;
      case 'chat':
        return <ChatPage />;
      case 'inventory':
        return <InventoryPage />;
      case 'reports':
        return <AnalyticsPage />;
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
      <Sidebar
        activeItem={activePage}
        onNavigate={setActivePage}
        navigationRef={sidebarNavigationRef}
        itemRefs={{ 'disease-map': diseaseMapNavRef }}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar title={PAGE_TITLES[activePage] ?? 'Farm2Vets'} onNavigate={setActivePage} />
        <main className="flex flex-1 overflow-hidden">
          {renderPage()}
        </main>
      </div>

      <DashboardTour
        isOpen={isTourOpen}
        activePage={activePage}
        steps={appTourSteps}
        onNavigatePage={setActivePage}
        onFinish={() => closeTour('completed')}
        onSkip={() => closeTour('skipped')}
      />
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
