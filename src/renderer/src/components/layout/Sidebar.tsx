import React, { useState } from 'react';
import { Home, Settings, TreeDeciduous, BookUser, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const mainNavItems = [
    { icon: Home, text: 'Dashboard', id: 'dashboard' },
    { icon: BookUser, text: 'Contexts', id: 'contexts' },
    { icon: TreeDeciduous, text: 'RSIP Tree', id: 'rsip-tree' },
    { icon: Calendar, text: 'Planner', id: 'planner' },
  ];

  const settingsNavItem = { icon: Settings, text: 'Settings', id: 'settings' };

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "h-full transition-all duration-300 ease-in-out bg-card border-r border-border flex-shrink-0",
          isCollapsed ? 'w-16' : 'w-56'
        )}
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
      >
        <nav className="flex flex-col h-full py-4">
          <div className="flex-1 space-y-1 px-2">
            {mainNavItems.map((item, index) => {
              const Icon = item.icon;
              const NavButton = (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full h-10",
                    isCollapsed ? "justify-center px-0" : "justify-start px-3",
                    "text-muted-foreground hover:text-foreground hover:bg-accent",
                    "transition-colors duration-200"
                  )}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="ml-3 whitespace-nowrap text-sm">{item.text}</span>
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
          
          <div className="px-2">
            {(() => {
              const SettingsButton = (
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full h-10",
                    isCollapsed ? "justify-center px-0" : "justify-start px-3",
                    "text-muted-foreground hover:text-foreground hover:bg-accent",
                    "transition-colors duration-200"
                  )}
                >
                  <settingsNavItem.icon size={20} className="flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="ml-3 whitespace-nowrap text-sm">{settingsNavItem.text}</span>
                  )}
                </Button>
              );

              if (isCollapsed) {
                return (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {SettingsButton}
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{settingsNavItem.text}</p>
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
