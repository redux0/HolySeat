import React from 'react';
import { useAtomValue } from 'jotai';
import Sidebar from './Sidebar';
import Footer from './Footer';
import CountdownBar from '../CountdownBar';
import { cn } from '../../lib/utils';
import { useThemeVariables, useThemeTransition } from '../../hooks/useTheme';
import { scheduleStateAtom } from '../../features/ctdp/atoms';
import { useCTDPActions } from '../../features/ctdp/hooks';
import { PageId } from '../../App';

interface MainLayoutProps {
  children: React.ReactNode;
  currentPage: PageId;
  onPageChange: (pageId: PageId) => void;
  onStartFocus?: (contextId: string, taskTitle: string) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  currentPage, 
  onPageChange, 
  onStartFocus 
}) => {
  const themeVars = useThemeVariables();
  const transition = useThemeTransition();
  const scheduleState = useAtomValue(scheduleStateAtom);
  const { cancelSchedule } = useCTDPActions();

  const handleCountdownComplete = () => {
    if (scheduleState && onStartFocus) {
      onStartFocus(scheduleState.contextId, scheduleState.taskTitle);
    }
  };

  const handleCountdownCancel = async () => {
    try {
      await cancelSchedule();
    } catch (error) {
      console.error('取消预约失败:', error);
    }
  };

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
        {/* 预约倒计时条 */}
        {scheduleState?.isActive && (
          <CountdownBar 
            onComplete={handleCountdownComplete}
            onCancel={handleCountdownCancel}
          />
        )}
        
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
