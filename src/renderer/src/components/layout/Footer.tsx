import React from 'react';
import { cn } from '@/lib/utils';
import { useThemeVariables, useThemeTransition } from '../../hooks/useTheme';

const Footer: React.FC = () => {
  const themeVars = useThemeVariables();
  const transition = useThemeTransition();

  return (
    <footer 
      className={cn("h-12 flex items-center justify-end px-6")}
      style={{
        backgroundColor: themeVars.backgroundPrimary,
        color: themeVars.textSecondary,
        transition: transition.colorTransition
      }}
    >
      {/* 右下角状态指示器 */}
      <div className="flex items-center gap-2">
        <div 
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: themeVars.colorSuccess }}
        ></div>
        <span 
          className="text-xs"
          style={{ 
            color: themeVars.textSecondary,
            fontSize: '11px'
          }}
        >
          在线
        </span>
      </div>
    </footer>
  );
};

export default Footer;
