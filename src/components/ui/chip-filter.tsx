'use client';

import { X } from 'lucide-react';
import { Badge } from './badge';
import { cn } from '@/lib/utils';

interface ChipFilterProps {
  label: string;
  value?: string | number;
  active?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

const variantStyles = {
  default: 'bg-secondary hover:bg-secondary/80',
  success: 'bg-green-100 text-green-700 hover:bg-green-100/80',
  warning: 'bg-orange-100 text-orange-700 hover:bg-orange-100/80',
  danger: 'bg-red-100 text-red-700 hover:bg-red-100/80',
};

export function ChipFilter({
  label,
  value,
  active = false,
  onRemove,
  onClick,
  variant = 'default',
  className,
}: ChipFilterProps) {
  const handleClick = () => {
    if (onClick) onClick();
  };

  return (
    <Badge
      variant={active ? 'default' : 'outline'}
      className={cn(
        'px-3 py-1.5 text-sm font-medium rounded-full transition-all cursor-pointer',
        active ? 'ring-2 ring-primary ring-offset-1' : variantStyles[variant],
        className
      )}
      onClick={handleClick}
    >
      <span>{label}</span>
      {value !== undefined && (
        <span className="ml-1.5 opacity-70">{value}</span>
      )}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1.5 hover:opacity-70 transition-opacity"
          aria-label="Remover filtro"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </Badge>
  );
}

interface ChipFilterGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function ChipFilterGroup({ children, className }: ChipFilterGroupProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {children}
    </div>
  );
}
