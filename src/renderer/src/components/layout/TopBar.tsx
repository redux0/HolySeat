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
  if (!isActive) {
    return null;
  }

  return (
    <header className={cn(
      "h-10 bg-card border-b border-border",
      "flex items-center justify-center",
      "text-sm font-medium text-foreground"
    )}>
      <span>
        Status: Sacred Context '{contextName}' | #{chainCount} | 剩下 {timeRemaining}
      </span>
    </header>
  );
};

export default TopBar;
