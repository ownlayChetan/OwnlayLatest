import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';
import clsx from 'clsx';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const styles = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: CheckCircle,
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: XCircle,
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    icon: AlertCircle,
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: Info,
  },
};

export default function Alert({ type, title, children, onClose, className }: AlertProps) {
  const style = styles[type];
  const Icon = style.icon;

  return (
    <div
      className={clsx(
        'p-4 rounded-lg border',
        style.bg,
        style.border,
        className
      )}
    >
      <div className="flex">
        <Icon className={clsx('w-5 h-5 flex-shrink-0', style.text)} />
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={clsx('text-sm font-medium', style.text)}>{title}</h3>
          )}
          <div className={clsx('text-sm', style.text, title && 'mt-1')}>
            {children}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={clsx('p-1 rounded hover:bg-white/50', style.text)}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
