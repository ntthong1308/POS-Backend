# 🎨 Retail POS Frontend

<div align="center">

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**Frontend Application** cho hệ thống quản lý bán hàng POS

[🚀 Bắt đầu](#-bắt-đầu) • [📖 Tài liệu](#-tài-liệu) • [🏗️ Cấu trúc](#-cấu-trúc-dự-án) • [🔧 Cấu hình](#-cấu-hình)

</div>

---

## 📖 Giới thiệu

**Retail POS Frontend** là ứng dụng web được xây dựng với **React 19** và **TypeScript**, cung cấp:

- 🏪 **Giao diện POS** - Bán hàng tại quầy nhanh chóng, dễ sử dụng
- 👨‍💼 **Admin Dashboard** - Quản lý toàn bộ hoạt động cửa hàng
- 📊 **Báo cáo trực quan** - Biểu đồ, thống kê real-time
- 🎨 **UI/UX hiện đại** - Responsive, accessible, user-friendly

---

## ✨ Tính năng

### 🏪 POS Application
- **Bán hàng tại quầy** - Giao diện tối ưu cho thu ngân
- **Chọn bàn** - Quản lý đơn hàng theo bàn
- **Giỏ hàng** - Thêm/sửa/xóa sản phẩm, áp dụng khuyến mãi
- **Thanh toán** - Hỗ trợ nhiều phương thức thanh toán
- **Treo bill** - Lưu hóa đơn tạm thời
- **Tìm kiếm** - Tìm kiếm nhanh theo tên, mã, barcode

### 👨‍💼 Admin Dashboard
- **Dashboard** - Tổng quan doanh thu, biểu đồ, thống kê
- **Quản lý sản phẩm** - CRUD sản phẩm, upload hình ảnh
- **Quản lý khách hàng** - Thông tin, lịch sử mua hàng
- **Quản lý nhân viên** - Phân quyền, quản lý tài khoản
- **Quản lý kho** - Nhập hàng, điều chỉnh tồn kho
- **Báo cáo** - Xem và xuất báo cáo Excel
- **Quản lý khuyến mãi** - Tạo và quản lý chương trình khuyến mãi

### 🎨 UI/UX Features
- ✅ **Responsive Design** - Tối ưu cho mọi kích thước màn hình
- ✅ **Accessible** - Tuân thủ WCAG guidelines với Radix UI
- ✅ **Loading States** - Skeleton loaders, loading spinners
- ✅ **Error Handling** - Toast notifications, error boundaries
- ✅ **Form Validation** - React Hook Form + Zod validation

---

## 🛠 Công nghệ

### Core
- **React 19** - UI library
- **TypeScript 5.9** - Type safety
- **Vite 7** - Build tool & dev server

### UI & Styling
- **Tailwind CSS 4** - Utility-first CSS
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **Recharts** - Chart library

### State Management
- **Zustand** - Global state management
- **React Query (TanStack Query)** - Server state & caching

### Forms & Validation
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **@hookform/resolvers** - Zod integration

### Routing & HTTP
- **React Router 7** - Client-side routing
- **Axios** - HTTP client

### Utilities
- **date-fns** - Date manipulation
- **sonner** - Toast notifications
- **html2canvas & jspdf** - PDF generation

---

## 📁 Cấu trúc dự án

```
retail-pos-app/
├── public/                    # Static assets
│   ├── logo.jpg
│   └── login-bg.jpg
│
├── src/
│   ├── pages/               # Page components
│   │   ├── auth/            # LoginPage
│   │   ├── pos/             # POS pages
│   │   ├── dashboard/       # DashboardPage
│   │   ├── products/        # ProductsPage
│   │   ├── customers/       # CustomersPage
│   │   ├── employees/       # EmployeesPage
│   │   ├── inventory/       # InventoryPage
│   │   ├── invoices/        # InvoicesPage
│   │   ├── promotions/      # PromotionsPage
│   │   └── reports/         # ReportsPage
│   │
│   ├── components/          # Reusable components
│   │   ├── common/          # Common UI (Button, Input, Table)
│   │   ├── features/       # Feature-specific (POS, Products)
│   │   ├── layout/         # Layout components (Header, Sidebar)
│   │   └── ui/             # UI primitives (Dialog, Select)
│   │
│   ├── lib/                # Utilities
│   │   ├── api/           # API clients
│   │   ├── hooks/         # Custom hooks
│   │   ├── types/         # TypeScript types
│   │   ├── utils/         # Utility functions
│   │   └── validation/    # Zod schemas
│   │
│   ├── store/             # Zustand stores
│   │   ├── authStore.ts   # Authentication state
│   │   └── cartStore.ts   # Shopping cart state
│   │
│   └── routes/            # Route configuration
│
├── index.html
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

---

## 🚀 Bắt đầu

### Yêu cầu

- **Node.js 18+**
- **npm** hoặc **yarn**
- **Modern browser** (Chrome, Firefox, Edge, Safari)

### Cài đặt

```bash
# Clone repository
git clone <repository-url> retail-pos-app
cd retail-pos-app

# Cài đặt dependencies
npm install
# hoặc
yarn install
```

### Cấu hình

Tạo file `.env` trong thư mục root:

```env
VITE_API_BASE_URL=http://localhost:8081
```

### Chạy ứng dụng

```bash
# Development
npm run dev
# hoặc
yarn dev
```

Ứng dụng sẽ chạy tại: **http://localhost:5173**

---

## 🔧 Cấu hình

### Environment Variables

File: `.env`

```env
# Backend API base URL
VITE_API_BASE_URL=http://localhost:8081
```

### Vite Configuration

File: `vite.config.ts`

- **Port**: 5173 (có thể thay đổi)
- **Proxy**: `/api` requests được proxy tới backend
- **Aliases**: `@` trỏ tới `src/`

---

## 🏗️ Build Production

### Build

```bash
npm run build
# hoặc
yarn build
```

Output sẽ ở thư mục `dist/`

### Preview

```bash
npm run preview
# hoặc
yarn preview
```

### Deploy

#### Option 1: Static Hosting (Nginx)

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/retail-pos-app/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8081;
    }
}
```

#### Option 2: Vercel/Netlify

1. Kết nối repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Set environment variable: `VITE_API_BASE_URL`
5. Deploy!

---

## 🧩 Architecture

### State Management

#### Zustand Stores
- **`authStore`**: Authentication state, token, user info
- **`cartStore`**: Shopping cart, selected table

#### React Query
- Server state management (products, customers, invoices)
- Automatic caching và refetching
- Optimistic updates

### API Integration

#### API Clients (`src/lib/api/`)
- **`client.ts`**: Axios instances
- **`authAPI.ts`**: Authentication endpoints
- **`posAPI.ts`**: POS endpoints
- **`productAPI.ts`**: Product management
- **`customerAPI.ts`**: Customer management
- **`reportAPI.ts`**: Reports và Excel export

#### Interceptors
- **Request**: Tự động thêm JWT token
- **Response**: Xử lý 401 → redirect to login

---

## 🧪 Testing

### Manual Testing

1. Chạy dev server: `npm run dev`
2. Test các chức năng:
   - Đăng nhập
   - Bán hàng POS
   - Quản lý sản phẩm
   - Xem báo cáo

### Browser DevTools

- **Network tab**: Kiểm tra API calls
- **Console**: Debug logs
- **React DevTools**: Inspect component state

---

## 🐛 Troubleshooting

### Port already in use

```bash
# Thay đổi port trong vite.config.ts
server: {
  port: 3000
}
```

### API connection errors

- Kiểm tra `VITE_API_BASE_URL` trong `.env`
- Đảm bảo backend đang chạy
- Kiểm tra CORS settings trên backend

### Build errors

```bash
# Clear cache và rebuild
rm -rf node_modules dist
npm install
npm run build
```

---

## 📚 Tài liệu

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Query](https://tanstack.com/query/latest)
- [Zustand](https://zustand-demo.pmnd.rs/)

---

## 📄 License

Dự án này được tạo ra cho mục đích học tập và nghiên cứu trong khuôn khổ đồ án thực tập tốt nghiệp.

---

<div align="center">

**⭐ Nếu dự án này hữu ích, hãy cho một star!**

Made with ❤️ by Nguyễn Trung Thông

</div>
