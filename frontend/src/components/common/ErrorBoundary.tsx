import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <div className="max-w-md w-full bg-white rounded-xl border border-red-200 p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Đã xảy ra lỗi
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          {error?.message || 'Có lỗi không mong muốn xảy ra. Vui lòng thử lại.'}
        </p>
        <div className="flex flex-col gap-2">
          <Button
            onClick={onReset}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Thử lại
          </Button>
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            className="w-full"
          >
            <Home className="w-4 h-4 mr-2" />
            Về trang chủ
          </Button>
        </div>
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-6 text-left">
            <summary className="text-xs text-gray-500 cursor-pointer mb-2">
              Chi tiết lỗi (Development)
            </summary>
            <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

export default ErrorBoundary;

