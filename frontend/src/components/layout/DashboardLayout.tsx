import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import SkipLink from '@/components/common/SkipLink';

export default function DashboardLayout() {
  return (
    <>
      <SkipLink />
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main id="main-content" className="flex-1 overflow-y-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}