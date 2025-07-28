import React, { useState } from 'react';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './components/Dashboard';
import StartPage from './components/StartPage';
import RSIPTreePage from './components/RSIPTreePage';

export type PageId = 'start' | 'dashboard' | 'chains' | 'rsip-tree';

function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('start');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'start':
        return <StartPage />;
      case 'dashboard':
        return <Dashboard />;
      case 'chains':
        return <Dashboard />; // 暂时使用Dashboard
      case 'rsip-tree':
        return <RSIPTreePage />;
      default:
        return <StartPage />;
    }
  };

  return (
    <MainLayout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderCurrentPage()}
    </MainLayout>
  );
}

export default App;
