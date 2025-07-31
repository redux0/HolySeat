import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { Clock, X } from 'lucide-react';
import { useThemeVariables } from '../hooks/useTheme';
import { userActivityStateAtom, userActivityInfoAtom } from '../store/atoms';
import type { ScheduleState } from '../features/ctdp/atoms';

interface CountdownBarProps {
  onComplete: () => void;
  onCancel: () => void;
}

const CountdownBar: React.FC<CountdownBarProps> = ({ onComplete, onCancel }) => {
  const themeVars = useThemeVariables();
  const userActivityState = useAtomValue(userActivityStateAtom);
  const userActivityInfo = useAtomValue(userActivityInfoAtom);

  // 从全局状态获取预约信息
  const scheduleState = userActivityState === 'SCHEDULED' 
    ? userActivityInfo.status as ScheduleState 
    : null;

  // 提前返回，避免 hooks 在条件渲染后被调用
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const progressPercentage = useMemo(() => {
    if (!scheduleState?.isActive) return 0;
    return ((scheduleState.totalTime - scheduleState.remainingTime) / scheduleState.totalTime) * 100;
  }, [scheduleState?.totalTime, scheduleState?.remainingTime, scheduleState?.isActive]);

  const handleCancelClick = useCallback(() => {
    console.log('取消预约倒计时');
    onCancel();
  }, [onCancel]);

  // 将条件渲染移到最后，确保所有 hooks 都已调用
  if (!scheduleState?.isActive) {
    return null;
  }

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
        className="absolute inset-0 transition-all duration-1000 ease-linear pointer-events-none"
        style={{
          background: `linear-gradient(90deg, #3B82F6 ${progressPercentage}%, transparent ${progressPercentage}%)`,
          opacity: 0.1,
          zIndex: 1
        }}
      />

      {/* 左侧图标和倒计时 */}
      <div className="flex items-center gap-3 flex-1 relative z-10">
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
        className="relative w-12 h-10 rounded-full flex items-center justify-center transition-all duration-200 z-20"
        style={{ 
          backgroundColor: `${themeVars.textSecondary}15`,
          border: `1px solid ${themeVars.textSecondary}30`,
          cursor: 'pointer',
          flexShrink: 0
        }}
        title="取消预约"
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#EF444420';
          e.currentTarget.style.borderColor = '#EF444450';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = `${themeVars.textSecondary}15`;
          e.currentTarget.style.borderColor = `${themeVars.textSecondary}30`;
        }}
      >
        <X size={18} style={{ color: themeVars.textSecondary }} />
      </button>
    </div>
  );
};

export default React.memo(CountdownBar);
