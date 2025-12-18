/**
 * Skip link component for accessibility
 * Allows keyboard users to skip to main content
 */
export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-orange-500 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
    >
      Bỏ qua đến nội dung chính
    </a>
  );
}


