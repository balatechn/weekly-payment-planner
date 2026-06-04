import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Clock, CheckCircle, AlertTriangle, IndianRupee,
  TrendingUp, Plus, ArrowUpRight, ArrowRight, Calendar,
  Activity, Zap
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  draft:        { label: 'Draft',        cls: 'badge-gray' },
  submitted:    { label: 'Submitted',    cls: 'badge-info' },
  under_review: { label: 'Under Review', cls: 'badge-warning' },
  approved:     { label: 'Approved',     cls: 'badge-success' },
  rejected:     { label: 'Rejected',     cls: 'badge-danger' },
  paid:         { label: 'Paid',         cls: 'badge-success' },
};

function KpiCard({ icon: Icon, label, value, sub, gradient, delay = 0 }) {
  return (
    <div
      className="kpi-card animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Gradient orb */}
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 ${gradient}`} />

      <div className="flex items-start justify-between relative">
        <div className="flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2">{label}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{value ?? '—'}</p>
          {sub && <p className="text-xs text-slate-400 mt-1.5">{sub}</p>}
        </div>
        <div className={`w-11 h-11 rounded-2xl ${gradient} flex items-center justify-center shadow-lg shrink-0`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

function SkeletonKpi() {
  return (
    <div className="kpi-card">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3 w-24 rounded" />
          <div className="skeleton h-7 w-16 rounded" />
          <div className="skeleton h-2.5 w-20 rounded" />
        </div>
        <div className="skeleton w-11 h-11 rounded-2xl" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, r] = await Promise.all([
          api.get('/dashboard/summary'),
          api.get('/dashboard/recent-payments?limit=6'),
        ]);
        setSummary(s.data);
        setRecent(r.data);
      } catch {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const fmt = (n) => `₹${parseFloat(n || 0).toLocaleString('en-IN')}`;

  const kpis = summary ? [
    {
      icon: FileText,
      label: 'Total Requests',
      value: summary.totalRequests,
      sub: 'All time',
      gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    },
    {
      icon: IndianRupee,
      label: 'Total Amount',
      value: fmt(summary.totalAmount),
      sub: 'Cumulative value',
      gradient: 'bg-gradient-to-br from-violet-500 to-purple-700',
    },
    {
      icon: Clock,
      label: 'Pending Approval',
      value: summary.pendingApproval,
      sub: 'Awaiting review',
      gradient: 'bg-gradient-to-br from-amber-400 to-orange-500',
    },
    {
      icon: CheckCircle,
      label: 'Approved',
      value: summary.approved,
      sub: 'This period',
      gradient: 'bg-gradient-to-br from-emerald-400 to-green-600',
    },
    {
      icon: AlertTriangle,
      label: 'Overdue',
      value: summary.overduePayments,
      sub: 'Needs attention',
      gradient: 'bg-gradient-to-br from-red-500 to-rose-600',
    },
    {
      icon: TrendingUp,
      label: 'Upcoming (7d)',
      value: summary.upcomingPayments,
      sub: 'Next 7 days',
      gradient: 'bg-gradient-to-br from-cyan-400 to-blue-500',
    },
  ] : [];

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title gradient-text">Dashboard</h1>
          <p className="page-subtitle">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => navigate('/payments/new')}
          className="btn btn-primary shadow-lg shadow-blue-500/25"
        >
          <Plus className="w-4 h-4" />
          New Payment
        </button>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {loading
          ? Array(6).fill(0).map((_, i) => <SkeletonKpi key={i} />)
          : kpis.map((k, i) => <KpiCard key={k.label} {...k} delay={i * 60} />)
        }
      </div>

      {/* Content row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Recent payments table */}
        <div className="xl:col-span-2 card animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="section-title">Recent Payments</h2>
            </div>
            <button
              onClick={() => navigate('/payments')}
              className="flex items-center gap-1 text-[13px] font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="skeleton h-10 w-10 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-3 w-40 rounded" />
                    <div className="skeleton h-2.5 w-24 rounded" />
                  </div>
                  <div className="skeleton h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm">No payment requests yet</p>
              <button onClick={() => navigate('/payments/new')} className="btn btn-primary mt-4 text-xs">
                Create First Payment
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700">
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-400">Vendor</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-400">Entity</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-400">Amount</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-400">Due</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-400">Status</th>
                    <th className="px-6 py-3 w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                  {recent.map((p, i) => {
                    const sc = STATUS_CONFIG[p.status] || STATUS_CONFIG.draft;
                    const isOverdue = new Date(p.dueDate) < new Date() && !['approved','paid'].includes(p.status);
                    return (
                      <tr
                        key={p.id}
                        onClick={() => navigate(`/payments/${p.id}`)}
                        className="hover:bg-blue-50/50 dark:hover:bg-slate-700/40 cursor-pointer transition-colors group"
                        style={{ animationDelay: `${i * 40}ms` }}
                      >
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 flex items-center justify-center shrink-0">
                              <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300">
                                {p.vendorName?.[0]?.toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{p.vendorName}</div>
                              <div className="text-[11px] text-slate-400">{p.natureOfExpense}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-sm text-slate-600 dark:text-slate-300">{p.entity?.name}</td>
                        <td className="px-6 py-3.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {fmt(p.totalAmount)}
                        </td>
                        <td className="px-6 py-3.5">
                          <span className={`text-sm ${isOverdue ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-slate-600 dark:text-slate-300'}`}>
                            {new Date(p.dueDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short' })}
                            {isOverdue && ' ⚠'}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className={`badge ${sc.cls}`}>{sc.label}</span>
                        </td>
                        <td className="px-6 py-3.5">
                          <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions panel */}
        <div className="space-y-4 animate-slide-up" style={{ animationDelay: '280ms' }}>

          {/* Quick actions card */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="section-title">Quick Actions</h2>
            </div>
            <div className="space-y-2">
              {[
                { label: 'New Payment Request', sub: 'Create & submit', icon: Plus, action: () => navigate('/payments/new'), color: 'from-blue-500 to-indigo-600' },
                { label: 'Approval Queue', sub: 'Review pending', icon: CheckCircle, action: () => navigate('/approvals'), color: 'from-emerald-400 to-green-600' },
                { label: 'Generate Report', sub: 'Export data', icon: TrendingUp, action: () => navigate('/reports'), color: 'from-violet-500 to-purple-700' },
                { label: 'Send Email Schedule', sub: 'Weekly dispatch', icon: Calendar, action: () => navigate('/emails'), color: 'from-amber-400 to-orange-500' },
              ].map(({ label, sub, icon: Icon, action, color }) => (
                <button
                  key={label}
                  onClick={action}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-150 group text-left"
                >
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform shrink-0`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">{label}</div>
                    <div className="text-[11px] text-slate-400">{sub}</div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>

          {/* Status summary mini-card */}
          {summary && (
            <div className="card">
              <h2 className="section-title mb-4">Status Summary</h2>
              <div className="space-y-3">
                {[
                  { label: 'Approved',  value: summary.approved,        color: 'bg-emerald-500' },
                  { label: 'Pending',   value: summary.pendingApproval, color: 'bg-amber-400' },
                  { label: 'Rejected',  value: summary.rejected,        color: 'bg-red-500' },
                  { label: 'Overdue',   value: summary.overduePayments, color: 'bg-rose-600' },
                ].map(({ label, value, color }) => {
                  const total = summary.totalRequests || 1;
                  const pct = Math.round((value / total) * 100);
                  return (
                    <div key={label}>
                      <div className="flex justify-between text-[12px] mb-1.5">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">{label}</span>
                        <span className="text-slate-800 dark:text-slate-200 font-semibold">{value}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${color} rounded-full transition-all duration-700`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
