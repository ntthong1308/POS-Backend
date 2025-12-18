import LoadingSpinner from './LoadingSpinner';

interface SectionLoadingProps {
  message?: string;
  className?: string;
}

export default function SectionLoading({ 
  message = 'Đang tải...',
  className 
}: SectionLoadingProps) {
  return (
    <div className={`flex items-center justify-center py-12 ${className || ''}`}>
      <LoadingSpinner size="md" text={message} />
    </div>
  );
}

