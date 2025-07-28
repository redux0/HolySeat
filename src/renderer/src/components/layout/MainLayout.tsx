import React from 'react';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { cn } from '../../lib/utils';
import { useThemeVariables, useThemeTransition } from '../../hooks/useTheme';
import { PageId } from '../../App';

interface MainLayoutProps {
  children: React.ReactNode;
  currentPage: PageId;
  onPageChange: (pageId: PageId) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, currentPage, onPageChange }) => {
  const themeVars = useThemeVariables();
  const transition = useThemeTransition();

  return (
    <div 
      className={cn("flex h-screen overflow-hidden m-0 p-0")}
      style={{
        backgroundColor: themeVars.backgroundPrimary,
        color: themeVars.textPrimary,
        transition: transition.colorTransition,
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
    >
      <Sidebar currentPage={currentPage} onPageChange={onPageChange} />
      <div className="flex flex-col flex-1 h-full">
        <main 
          className="flex-1 overflow-y-auto min-h-0"
          style={{
            backgroundColor: themeVars.backgroundPrimary,
            padding: '32px'
          }}
        >
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
