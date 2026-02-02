import { ArrowUp, ArrowDown } from 'lucide-react';
import clsx from 'clsx';

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  icon?: React.ReactNode;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export default function MetricCard({
  title,
  value,
  trend,
  trendLabel,
  icon,
  prefix = '',
  suffix = '',
  className,
}: MetricCardProps) {
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <div className={clsx(
      'card p-6 transition-all duration-300 hover:shadow-lg hover:shadow-teal-100 hover:-translate-y-1 hover:border-teal-200',
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-neutral-900">
            {prefix}
            {typeof value === 'number' ? value.toLocaleString() : value}
            {suffix}
          </p>
          
          {trend !== undefined && (
            <div className="mt-2 flex items-center space-x-1">
              {isPositive ? (
                <ArrowUp className="w-4 h-4 text-emerald-500" />
              ) : (
                <ArrowDown className="w-4 h-4 text-red-500" />
              )}
              <span
                className={clsx(
                  'text-sm font-medium',
                  isPositive ? 'text-emerald-600' : 'text-red-600'
                )}
              >
                {isPositive ? '+' : ''}
                {trend.toFixed(1)}%
              </span>
              {trendLabel && (
                <span className="text-sm text-neutral-500">{trendLabel}</span>
              )}
            </div>
          )}
        </div>
        
        {icon && (
          <div className="p-3 rounded-lg bg-teal-50 text-teal-600 transition-all duration-300 group-hover:bg-teal-100">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
