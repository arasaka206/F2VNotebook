import { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import Dashboard from './pages/Dashboard';

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  notebook: 'AI Herd Notebook',
  livestock: 'Livestock Profiles',
  'disease-map': 'Disease Risk Map',
  'vet-connect': 'Veterinary Connect',
  inventory: 'Inventory & Supplies',
  reports: 'Reports & Analytics',
};

function App() {
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      default:
        return (
          <div className="flex flex-1 items-center justify-center p-6">
            <div className="text-center">
              <div className="text-6xl mb-4">🚧</div>
              <h2 className="text-xl font-bold text-white mb-2">{PAGE_TITLES[activePage]}</h2>
              <p className="text-gray-400 text-sm">This section is coming soon.</p>
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
