import Skeleton from './Skeleton';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}

/**
 * Table skeleton loader component
 * Used for loading states in tables
 */
export default function TableSkeleton({ 
  rows = 5, 
  columns = 5,
  showHeader = true 
}: TableSkeletonProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full">
        {showHeader && (
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-6 py-3 text-left">
                  <Skeleton variant="text" className="h-4 w-24" />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-6 py-4">
                  <Skeleton variant="text" className="h-4 w-full" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


