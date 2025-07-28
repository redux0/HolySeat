import React from 'react';
import { cn } from '@/lib/utils';

const Footer: React.FC = () => {
  return (
    <footer className={cn(
      "h-8 flex items-center justify-center",
      "text-xs text-muted-foreground",
      "bg-card border-t border-border"
    )}>
      <span>Press ⌘+K for commands...</span>
    </footer>
  );
};

export default Footer;
