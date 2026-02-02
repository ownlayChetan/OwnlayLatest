import { Clock } from 'lucide-react';
import clsx from 'clsx';

interface SoonBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export default function SoonBadge({ 
  size = 'sm', 
  showIcon = true,
  className 
}: SoonBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full font-semibold',
        'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-600 border border-slate-300',
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Clock className={iconSizes[size]} />}
      SOON
    </span>
  );
}
