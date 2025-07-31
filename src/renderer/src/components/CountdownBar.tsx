import React, { useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import { Clock, X } from 'lucide-react';
import { useThemeVariables } from '../hooks/useTheme';
import { userActivityStateAtom, userActivityInfoAtom } from '../store/atoms';
import type { ScheduleState } from '../features/ctdp/atoms';
import CancelScheduleModal from './CancelScheduleModal';

interface CountdownBarProps {
  onComplete: () => void;
  onCancel: () => void;
}

const CountdownBar: React.FC<CountdownBarProps> = ({ onComplete, onCancel }) => {
  const themeVars = useThemeVariables();
  const userActivityState = useAtomValue(userActivityStateAtom);
  const userActivityInfo = useAtomValue(userActivityInfoAtom);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // 从全局状态获取预约信息
  const scheduleState = userActivityState === 'SCHEDULED' 
    ? userActivityInfo.status as ScheduleState 
    : null;

  if (!scheduleState?.isActive) return null;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = ((scheduleState.totalTime - scheduleState.remainingTime) / scheduleState.totalTime) * 100;

  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    onCancel();
    setShowCancelModal(false);
  };

  const handleCancelModalClose = () => {
    setShowCancelModal(false);
  };

  return (
    <div 
      className="w-full h-12 flex items-center px-4 border-b relative overflow-hidden"
      style={{
        backgroundColor: themeVars.backgroundSecondary,
        borderColor: themeVars.borderPrimary
      }}
    >
      {/* 进度条背景 */}
      <div 
        className="absolute inset-0 transition-all duration-1000 ease-linear"
        style={{
          background: `linear-gradient(90deg, #3B82F6 ${progressPercentage}%, transparent ${progressPercentage}%)`,
          opacity: 0.1
        }}
      />

      {/* 左侧图标和倒计时 */}
      <div className="flex items-center gap-3 flex-1">
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#3B82F6' }}
        >
          <Clock size={16} color="white" />
        </div>
        <div>
          <div 
            className="text-sm font-medium"
            style={{ color: themeVars.textPrimary }}
          >
            {formatTime(scheduleState.remainingTime)} 后进入 '{scheduleState.contextName}'
          </div>
          <div 
            className="text-xs"
            style={{ color: themeVars.textSecondary }}
          >
            任务: {scheduleState.taskTitle}
          </div>
        </div>
      </div>

      {/* 右侧取消按钮 */}
      <button
        onClick={handleCancelClick}
        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-opacity-80 transition-colors"
        style={{ backgroundColor: `${themeVars.textSecondary}20` }}
        title="取消预约"
      >
        <X size={16} style={{ color: themeVars.textSecondary }} />
      </button>

      {/* 取消确认Modal */}
      <CancelScheduleModal
        isOpen={showCancelModal}
        contextName={scheduleState.contextName}
        onConfirm={handleConfirmCancel}
        onCancel={handleCancelModalClose}
      />
    </div>
  );
};

export default CountdownBar;
