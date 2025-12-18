import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/lib/api/auth';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

// Danh sách ảnh background cho slideshow
const backgroundImages = [
  '/login-bg.jpg',    // Ảnh 1
  '/login-bg-2.jpg',  // Ảnh 2
  '/login-bg-3.jpg',  // Ảnh 3
];

const logo = '/logo.jpg';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  // Slideshow tự động chuyển ảnh mỗi 5 giây
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000); // 5 giây

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Background Image Slideshow */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-orange-600 to-orange-800">
        {/* Slideshow Images */}
        {backgroundImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlideIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={image}
              alt={`Background ${index + 1}`}
              className="w-full h-full object-cover"
              loading="eager"
              onError={(e) => {
                console.error(`Failed to load image: ${image}`);
                // Ẩn ảnh lỗi nhưng vẫn giữ layout
                (e.target as HTMLImageElement).style.opacity = '0';
              }}
              onLoad={(e) => {
                // Đảm bảo ảnh hiển thị khi load thành công
                (e.target as HTMLImageElement).style.opacity = '1';
              }}
            />
          </div>
        ))}
        
        {/* Overlay with text */}
        <div className="absolute inset-0 bg-black/40 flex flex-col justify-between p-12 z-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-white flex items-center justify-center">
              <img
                src={logo}
                alt="All-Time Logo"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <span className="text-white text-2xl font-bold">ALL-TIME</span>
          </div>

          {/* Bottom text */}
          <div className="text-white">
            <p className="text-2xl font-medium leading-relaxed">
              All time mở cửa – mọi cảm hứng bắt đầu từ đây.
            </p>
            {/* Pagination dots */}
            <div className="flex gap-2 mt-6">
              {backgroundImages.map((_, index) => (
                <div
                  key={index}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentSlideIndex
                      ? 'w-2.5 h-2.5 bg-white'
                      : 'w-2 h-2 bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 lg:w-1/2 flex flex-col bg-white">
        {/* Login Form Container */}
        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-md">
            {/* Welcome Heading */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Chào mừng trở lại!
              </h1>
              <p className="text-gray-600">Đăng nhập vào tài khoản của bạn</p>
            </div>

            {/* Form */}
            <form 
              className="space-y-6"
              onSubmit={async (e) => {
                e.preventDefault();
                setError('');
                setLoading(true);
                
                try {
                  const response = await authAPI.login({
                    username,
                    password,
                  });
                  
                  login(response);
                  navigate('/dashboard');
                } catch (err: any) {
                  setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
                } finally {
                  setLoading(false);
                }
              }}
            >
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              {/* Username Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên đăng nhập
                </label>
                <Input
                  type="text"
                  placeholder="Nhập tên đăng nhập"
                  className="w-full"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu"
                    className="w-full pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">Ghi nhớ đăng nhập</span>
                </label>
                <a 
                  href="#" 
                  className="text-sm text-orange-500 hover:text-orange-600 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.info('Tính năng quên mật khẩu chưa được triển khai');
                  }}
                >
                  Quên mật khẩu?
                </a>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 transition-colors"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang đăng nhập...
                  </>
                ) : (
                  'Đăng nhập'
                )}
              </Button>
            </form>

            {/* Separator */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Hoặc đăng nhập bằng</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full border-gray-300 hover:bg-gray-50 transition-colors"
                size="lg"
                type="button"
                onClick={() => {
                  toast.info('Đăng nhập bằng Google chưa được triển khai');
                }}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Tiếp tục với Google
              </Button>

              <Button
                variant="outline"
                className="w-full border-gray-300 hover:bg-gray-50 transition-colors"
                size="lg"
                type="button"
                onClick={() => {
                  toast.info('Đăng nhập bằng Facebook chưa được triển khai');
                }}
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Tiếp tục với Facebook
              </Button>
            </div>

            {/* Register Link */}
            <div className="mt-8 text-center text-sm text-gray-600">
              Chưa có tài khoản?{' '}
              <a 
                href="#" 
                className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  toast.info('Tính năng đăng ký chưa được triển khai');
                }}
              >
                Đăng ký ngay
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

