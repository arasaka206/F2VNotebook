import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import Dashboard from './pages/Dashboard';
import LivestockPage from './pages/LivestocksPage';
import PublicDashboard from './pages/PublicDashboard';
import QuizPage from './pages/QuizPage';
import NotebookPage from './pages/NotebookPage';
import ProfilePage from './pages/ProfilePage';
import ChatPage from './pages/ChatPage';

function App() {
  const { t } = useTranslation();
  const [activePage, setActivePage] = useState('dashboard');

  const PAGE_TITLES: Record<string, string> = {
    dashboard: t('app.dashboard'),
    notebook: t('app.notebook'),
    livestock: t('app.livestock'),
    'disease-map': t('app.diseaseMap'),
    'vet-connect': t('app.vetConnect'),
    quizzes: t('app.quizzes'),
    'public-dashboard': t('app.publicDashboard'),
    chat: 'AI Chat',
    inventory: t('app.inventory'),
    reports: t('app.reports'),
    profile: 'Farmer Profile',
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'notebook':
        return <NotebookPage />;
      case 'livestock':
        return <LivestockPage />;
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

  return (
    <div className="flex h-screen overflow-hidden bg-farm-bg">
      <Sidebar activeItem={activePage} onNavigate={setActivePage} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar title={PAGE_TITLES[activePage] ?? 'Farm2Vets'} />
        <main className="flex flex-1 overflow-hidden">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;