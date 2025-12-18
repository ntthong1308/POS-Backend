import { cn } from '@/lib/utils';

interface ButtonLoadingProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function ButtonLoading({ 
  className,
  size = 'sm' 
}: ButtonLoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-5 h-5 border-2',
    lg: 'w-6 h-6 border-3',
  };

  return (
    <div
      className={cn(
        "border-white border-t-transparent rounded-full animate-spin",
        sizeClasses[size],
        className
      )}
    />
  );
}

