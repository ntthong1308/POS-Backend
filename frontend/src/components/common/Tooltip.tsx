import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TooltipProps {
  children: ReactNode;
  content: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export default function Tooltip({ children, content, side = 'right', className }: TooltipProps) {
  const sideClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative group inline-block">
      {children}
      <div
        className={cn(
          "absolute z-50 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded-md",
          "opacity-0 invisible group-hover:opacity-100 group-hover:visible",
          "transition-opacity duration-200 pointer-events-none whitespace-nowrap",
          sideClasses[side],
          className
        )}
      >
        {content}
        <div
          className={cn(
            "absolute w-2 h-2 bg-gray-900 rotate-45",
            side === 'top' && 'top-full left-1/2 -translate-x-1/2 -translate-y-1/2',
            side === 'bottom' && 'bottom-full left-1/2 -translate-x-1/2 translate-y-1/2',
            side === 'left' && 'left-full top-1/2 -translate-y-1/2 -translate-x-1/2',
            side === 'right' && 'right-full top-1/2 -translate-y-1/2 translate-x-1/2',
          )}
        />
      </div>
    </div>
  );
}

