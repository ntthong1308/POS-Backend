import { Outlet } from 'react-router-dom';
import POSSidebar from './POSSidebar';
import POSHeader from './POSHeader';

export default function POSLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <POSSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <POSHeader />
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

