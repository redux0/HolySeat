import React, { useState } from 'react';
import { useAtomValue } from 'jotai';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './components/Dashboard';
import StartPage from './components/StartPage';
import RSIPTreePage from './components/RSIPTreePage';
import FocusPageDemo from './components/FocusPageDemo';
import FocusPage from './components/FocusPage';
import { activeSessionAtom } from './features/ctdp/atoms';
import { ThemedToaster } from './components/ui/toast';

export type PageId = 'start' | 'dashboard' | 'chains' | 'rsip-tree' | 'focus-demo';

function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('start');
  const activeSession = useAtomValue(activeSessionAtom);

  // 如果有活跃会话，显示专注页面
  if (activeSession) {
    return (
      <>
        <FocusPage onExit={() => {
          // 专注页面退出后回到开始页面
          setCurrentPage('start');
        }} />
        <ThemedToaster />
      </>
    );
  }

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
      case 'focus-demo':
        return <FocusPageDemo />;
      default:
        return <StartPage />;
    }
  };

  return (
    <>
      <MainLayout currentPage={currentPage} onPageChange={setCurrentPage}>
        {renderCurrentPage()}
      </MainLayout>
      <ThemedToaster />
    </>
  );
}

export default App;
