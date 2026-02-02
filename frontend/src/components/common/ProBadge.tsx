import { Crown } from 'lucide-react';
import clsx from 'clsx';

interface ProBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'warning' | 'gradient';
  showIcon?: boolean;
  className?: string;
}

export default function ProBadge({ 
  size = 'sm', 
  variant = 'primary',
  showIcon = true,
  className 
}: ProBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  const variantClasses = {
    primary: 'bg-primary-100 text-primary-700',
    warning: 'bg-yellow-100 text-yellow-700',
    gradient: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-900',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full font-bold',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {showIcon && <Crown className={iconSizes[size]} />}
      PRO
    </span>
  );
}
