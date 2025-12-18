import Skeleton from './Skeleton';

export default function ChartSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <Skeleton variant="text" width="40%" height={20} className="mb-4" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton variant="text" width={60} height={16} />
            <Skeleton variant="rectangular" width={`${Math.random() * 40 + 30}%`} height={24} />
            <Skeleton variant="text" width={60} height={16} />
          </div>
        ))}
      </div>
    </div>
  );
}

