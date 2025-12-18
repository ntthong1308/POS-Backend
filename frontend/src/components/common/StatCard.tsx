import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
}

export default function StatCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconBgColor = 'bg-blue-100',
  iconColor = 'text-blue-600',
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
          {change && (
            <p className={cn(
              "text-sm font-medium flex items-center gap-1",
              changeType === 'positive' && "text-green-600",
              changeType === 'negative' && "text-red-600",
              changeType === 'neutral' && "text-gray-600"
            )}>
              {changeType === 'positive' && '↑'}
              {changeType === 'negative' && '↓'}
              {change}
            </p>
          )}
        </div>
        <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", iconBgColor)}>
          <Icon className={cn("w-6 h-6", iconColor)} />
        </div>
      </div>
    </div>
  );
}