import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import Footer from './Footer';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className={cn("flex h-screen bg-background text-foreground overflow-hidden m-0 p-0")}>
      <Sidebar />
      <div className="flex flex-col flex-1 h-full">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6 min-h-0">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
