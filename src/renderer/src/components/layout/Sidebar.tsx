import React, { useState } from 'react';
import { Home, Settings, TreeDeciduous, BookUser, Calendar, BarChart3, Focus } from 'lucide-react';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { cn } from '../../lib/utils';
import { useThemeVariables, useThemeTransition } from '../../hooks/useTheme';
import { PageId } from '../../App';

interface SidebarProps {
  currentPage: PageId;
  onPageChange: (pageId: PageId) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const themeVars = useThemeVariables();
  const transition = useThemeTransition();

  const mainNavItems = [
    { icon: Home, text: '开始', id: 'start' },
    { icon: BarChart3, text: '仪表盘', id: 'dashboard' },
    { icon: BookUser, text: '链管理', id: 'chains' },
    { icon: TreeDeciduous, text: 'RSIP 定式树', id: 'rsip-tree' },
    { icon: Focus, text: '专注页面演示', id: 'focus-demo' },
  ];

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "h-full flex-shrink-0 transition-all duration-300 ease-in-out",
          isCollapsed ? 'w-16' : 'w-72'
        )}
        style={{
          backgroundColor: themeVars.backgroundSecondary,
          borderRight: `1px solid ${themeVars.borderPrimary}`,
          transition: `width ${transition.duration} ${transition.easing}, background-color ${transition.duration} ${transition.easing}`
        }}
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
      >
        {/* Logo区域 */}
        <div 
          className="flex items-center px-4 py-6 border-b"
          style={{ 
            borderColor: themeVars.borderPrimary,
            minHeight: '80px'
          }}
        >
          <div 
            className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ 
              backgroundColor: themeVars.accentPrimary,
              color: '#ffffff'
            }}
          >
            <span className="text-lg font-bold">H</span>
          </div>
          {!isCollapsed && (
            <span 
              className="ml-3 text-lg font-bold whitespace-nowrap"
              style={{ 
                color: themeVars.textPrimary,
                fontFamily: 'Inter, system-ui, sans-serif'
              }}
            >
              HolySeat
            </span>
          )}
        </div>

        <nav 
          className="flex flex-col justify-between"
          style={{ 
            padding: `${themeVars.spacingMd} 0`,
            height: 'calc(100% - 80px)' 
          }}
        >
          <div 
            className="space-y-1"
            style={{ padding: `0 ${themeVars.spacingMd}` }}
          >
            {mainNavItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              const NavButton = (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => onPageChange(item.id as PageId)}
                  className={cn(
                    "w-full h-10 transition-all duration-200",
                    isCollapsed ? "justify-center px-0" : "justify-start px-3",
                    "rounded-lg"
                  )}
                  style={{
                    backgroundColor: isActive ? themeVars.backgroundInteractive : 'transparent',
                    color: isActive ? themeVars.textPrimary : themeVars.textSecondary,
                    transition: transition.colorTransition,
                    fontSize: '14px',
                    fontWeight: '500',
                    borderRadius: '8px'
                  }}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="ml-3 whitespace-nowrap">{item.text}</span>
                  )}
                </Button>
              );

              if (isCollapsed) {
                return (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>
                      {NavButton}
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.text}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return NavButton;
            })}
          </div>
          
          {/* 设置按钮区域 */}
          <div 
            className="border-t"
            style={{ 
              padding: `${themeVars.spacingMd}`,
              borderColor: themeVars.borderPrimary 
            }}
          >
            {(() => {
              const SettingsButton = (
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full h-10 transition-all duration-200",
                    isCollapsed ? "justify-center px-0" : "justify-start px-3",
                    "rounded-lg"
                  )}
                  style={{
                    color: themeVars.textSecondary,
                    transition: transition.colorTransition,
                    fontSize: '14px',
                    fontWeight: '500',
                    borderRadius: '8px'
                  }}
                >
                  <Settings size={18} className="flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="ml-3 whitespace-nowrap">设置</span>
                  )}
                </Button>
              );

              if (isCollapsed) {
                return (
                  <Tooltip key="settings">
                    <TooltipTrigger asChild>
                      {SettingsButton}
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>设置</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return SettingsButton;
            })()}
          </div>
        </nav>
      </aside>
    </TooltipProvider>
  );
};

export default Sidebar;
