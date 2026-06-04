import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';

export default function Layout() {
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const initTheme = useThemeStore((state) => state.initTheme);

  useEffect(() => {
    fetchUser();
    initTheme();
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
