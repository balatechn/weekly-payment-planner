import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CreditCard, CheckSquare, BarChart3,
  Mail, Users, Building2, ClipboardList, LogOut,
  ChevronLeft, ChevronRight, Zap, UserCircle
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const NAV = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard',      roles: ['admin','finance','department_user'] },
  { to: '/payments',   icon: CreditCard,       label: 'Payments',       roles: ['admin','finance','department_user'] },
  { to: '/approvals',  icon: CheckSquare,      label: 'Approvals',      roles: ['admin','finance'] },
  { to: '/reports',    icon: BarChart3,        label: 'Reports',        roles: ['admin','finance'] },
  { to: '/emails',     icon: Mail,             label: 'Email Schedule', roles: ['admin','finance'] },
];

const ADMIN_NAV = [
  { to: '/admin/users',             icon: Users,        label: 'Users' },
  { to: '/admin/entities',          icon: Building2,    label: 'Entities' },
  { to: '/admin/email-recipients',  icon: Mail,         label: 'Email Recipients' },
  { to: '/admin/audit-logs',        icon: ClipboardList,label: 'Audit Logs' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const navigate = useNavigate();

  const w = collapsed ? 'w-[72px]' : 'w-64';

  const NavItem = ({ to, icon: Icon, label }) => (
    <NavLink
      to={to}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        `relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
         ${collapsed ? 'justify-center' : ''}
         ${isActive
           ? 'bg-white/15 text-white shadow-md'
           : 'text-blue-200/70 hover:bg-white/10 hover:text-white'}`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-white rounded-r-full" />
          )}
          <Icon className={`w-[18px] h-[18px] shrink-0 transition-colors ${isActive ? 'text-white' : 'text-blue-300/70 group-hover:text-white'}`} />
          {!collapsed && (
            <span className="text-[13px] font-medium">{label}</span>
          )}
          {collapsed && (
            <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-2xl border border-slate-700 transition-all duration-150 scale-95 group-hover:scale-100">
              {label}
            </span>
          )}
        </>
      )}
    </NavLink>
  );

  return (
    <aside
      className={`relative flex flex-col shrink-0 ${w} transition-all duration-300 ease-in-out`}
      style={{ background: 'linear-gradient(180deg, #0F172A 0%, #1a2f6e 55%, #2055c7 100%)' }}
    >
      {/* Brand */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed ? 'justify-center px-3' : ''}`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-lg shrink-0">
          <Zap className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-white font-bold text-[13px] leading-tight tracking-wide">Weekly Payment</div>
            <div className="text-blue-300/70 text-[11px]">Planner Pro</div>
          </div>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV.filter(item => item.roles.includes(user?.role)).map(item => (
          <NavItem key={item.to} {...item} />
        ))}

        {user?.role === 'admin' && (
          <>
            <div className={`${collapsed ? 'mx-2 my-3 border-t border-white/10' : 'px-3 pt-5 pb-2'}`}>
              {!collapsed && (
                <span className="text-[10px] font-semibold uppercase tracking-widest text-blue-200/40">
                  Administration
                </span>
              )}
            </div>
            {ADMIN_NAV.map(item => (
              <NavItem key={item.to} {...item} />
            ))}
          </>
        )}
      </nav>

      {/* User + logout */}
      <div className="border-t border-white/10 p-2 space-y-0.5">
        <NavLink
          to="/profile"
          title={collapsed ? 'My Profile' : undefined}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-blue-200/70 hover:bg-white/10 hover:text-white transition-all duration-200 group ${collapsed ? 'justify-center' : ''}`}
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-white/90 truncate">{user?.name}</div>
              <div className="text-[10px] text-blue-300/60 capitalize">{user?.role?.replace('_', ' ')}</div>
            </div>
          )}
          {collapsed && (
            <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-2xl border border-slate-700 transition-all">
              My Profile
            </span>
          )}
        </NavLink>

        <button
          onClick={() => { logout(); navigate('/login'); }}
          title={collapsed ? 'Sign Out' : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-blue-200/60 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 group ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span className="text-[13px] font-medium">Sign Out</span>}
          {collapsed && (
            <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-2xl border border-slate-700 transition-all">
              Sign Out
            </span>
          )}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="absolute -right-3.5 top-7 w-7 h-7 bg-blue-600 hover:bg-blue-500 border-2 border-white/20 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 z-10 hover:scale-110"
      >
        {collapsed
          ? <ChevronRight className="w-3.5 h-3.5" />
          : <ChevronLeft className="w-3.5 h-3.5" />
        }
      </button>
    </aside>
  );
}
