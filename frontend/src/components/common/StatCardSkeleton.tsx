import Skeleton from './Skeleton';

export default function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="rectangular" width={16} height={16} />
      </div>
      <Skeleton variant="text" width="60%" height={12} className="mb-1" />
      <Skeleton variant="text" width="40%" height={24} className="mb-1" />
      <Skeleton variant="text" width="80%" height={10} />
    </div>
  );
}

