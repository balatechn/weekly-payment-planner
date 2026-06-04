import { Moon, Sun, Bell, Search, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';

const TITLES = {
  '/dashboard':               ['Home', 'Dashboard'],
  '/payments':                ['Home', 'Payment Requests'],
  '/payments/new':            ['Payments', 'New Payment'],
  '/approvals':               ['Home', 'Approval Queue'],
  '/reports':                 ['Home', 'Reports & Analytics'],
  '/emails':                  ['Home', 'Email Schedule'],
  '/admin/users':             ['Admin', 'User Management'],
  '/admin/entities':          ['Admin', 'Entity Management'],
  '/admin/email-recipients':  ['Admin', 'Email Recipients'],
  '/admin/audit-logs':        ['Admin', 'Audit Logs'],
  '/profile':                 ['Home', 'My Profile'],
};

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore(s => s.user);
  const { darkMode, toggleDarkMode } = useThemeStore();

  const segments = TITLES[location.pathname] || ['Home', 'Page'];
  const [crumb, title] = segments;

  return (
    <header className="flex items-center gap-4 px-6 py-3.5 bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800 sticky top-0 z-20">

      {/* Breadcrumb + title */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-0.5">
          <span>{crumb}</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-600 dark:text-slate-300 font-medium">{title}</span>
        </div>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-white leading-tight truncate">{title}</h1>
      </div>

      {/* Search */}
      <div className="hidden lg:flex items-center gap-2 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl w-52 border border-transparent focus-within:border-blue-400 focus-within:bg-white dark:focus-within:bg-slate-700 transition-all">
        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search…"
          className="bg-transparent text-[13px] text-slate-700 dark:text-slate-300 placeholder-slate-400 outline-none flex-1 min-w-0"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">

        {/* Notifications */}
        <button className="relative p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
          <Bell className="w-4.5 h-4.5 text-slate-500 dark:text-slate-400" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={darkMode ? 'Light mode' : 'Dark mode'}
        >
          {darkMode
            ? <Sun className="w-4.5 h-4.5 text-amber-400" />
            : <Moon className="w-4.5 h-4.5 text-slate-500" />
          }
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* User chip */}
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2.5 pl-1 pr-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 leading-tight">{user?.name?.split(' ')[0]}</div>
            <div className="text-[10px] text-slate-400 capitalize leading-tight">{user?.role?.replace('_', ' ')}</div>
          </div>
        </button>
      </div>
    </header>
  );
}
