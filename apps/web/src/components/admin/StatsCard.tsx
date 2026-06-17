import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title:    string;
  value:    string;
  change?:  number;
  period?:  string;
  className?: string;
}

export default function StatsCard({ title, value, change, period = 'vs yesterday', className }: StatsCardProps) {
  const positive = change !== undefined && change >= 0;

  return (
    <div className={cn('bg-white rounded-xl border border-gray-100 p-5', className)}>
      <p className="font-satoshi text-gray-500 text-xs uppercase tracking-wider mb-2">{title}</p>
      <p className="font-satoshi text-gray-900 font-bold text-2xl mb-2">{value}</p>
      {change !== undefined && (
        <div className={cn('flex items-center gap-1 text-xs font-satoshi', positive ? 'text-green-600' : 'text-red-500')}>
          {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>{Math.abs(change).toFixed(1)}% {period}</span>
        </div>
      )}
    </div>
  );
}
