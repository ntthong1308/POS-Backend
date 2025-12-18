import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterChipProps {
  label: string;
  onRemove: () => void;
  className?: string;
}

export default function FilterChip({ label, onRemove, className }: FilterChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
        "bg-orange-100 text-orange-800 border border-orange-300",
        "hover:bg-orange-200 transition-colors",
        className
      )}
    >
      {label}
      <button
        onClick={onRemove}
        className="hover:bg-orange-300 rounded-full p-0.5 transition-colors"
        title="Xóa bộ lọc"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </span>
  );
}

