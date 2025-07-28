import React from 'react';
import { cn } from '@/lib/utils';

interface TopBarProps {
  isActive?: boolean;
  contextName?: string;
  chainCount?: number;
  timeRemaining?: string;
}

const TopBar: React.FC<TopBarProps> = ({ 
  isActive = false, 
  contextName = 'Deep Work',
  chainCount = 12,
  timeRemaining = '45:32'
}) => {
  // 根据参考图，不显示顶部状态栏
  return null;
};

export default TopBar;
