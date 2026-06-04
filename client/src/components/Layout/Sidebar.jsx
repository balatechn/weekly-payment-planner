import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  CheckSquare, 
  FileBarChart, 
  Mail, 
  Users, 
  Building2, 
  Settings,
  ClipboardList
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

export default function Sidebar() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  const isActive = (path) => location.pathname.startsWith(path);

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: Home, roles: ['admin', 'finance', 'department_user'] },
    { name: 'Payments', path: '/payments', icon: FileText, roles: ['admin', 'finance', 'department_user'] },
    { name: 'Approvals', path: '/approvals', icon: CheckSquare, roles: ['admin', 'finance'] },
    { name: 'Reports', path: '/reports', icon: FileBarChart, roles: ['admin', 'finance'] },
    { name: 'Email History', path: '/emails', icon: Mail, roles: ['admin', 'finance'] },
  ];

  const adminNavigation = [
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Entities', path: '/admin/entities', icon: Building2 },
    { name: 'Email Recipients', path: '/admin/email-recipients', icon: Mail },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: ClipboardList },
  ];

  const canAccess = (roles) => {
    if (!roles) return true;
    return roles.includes(user?.role);
  };

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-primary-800 dark:text-primary-400">
          Payment Planner
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Weekly Payment Management</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          if (!canAccess(item.roles)) return null;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-primary-800 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}

        {user?.role === 'admin' && (
          <>
            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Administration
              </p>
            </div>
            {adminNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary-800 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary-800 flex items-center justify-center text-white font-semibold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
