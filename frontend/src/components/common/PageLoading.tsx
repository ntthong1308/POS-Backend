import LoadingSpinner from './LoadingSpinner';

interface PageLoadingProps {
  message?: string;
}

export default function PageLoading({ message = 'Đang tải...' }: PageLoadingProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner size="lg" text={message} />
    </div>
  );
}

