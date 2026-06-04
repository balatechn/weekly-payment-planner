import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Filter, Eye, Pencil, Trash2,
  X, AlertTriangle, ChevronDown, IndianRupee
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';

const STATUS_CONFIG = {
  draft:        { cls: 'badge-gray',    label: 'Draft' },
  submitted:    { cls: 'badge-info',    label: 'Submitted' },
  under_review: { cls: 'badge-warning', label: 'Under Review' },
  approved:     { cls: 'badge-success', label: 'Approved' },
  rejected:     { cls: 'badge-danger',  label: 'Rejected' },
  paid:         { cls: 'badge-success', label: 'Paid' },
};

// ── Delete Confirmation Modal ──────────────────────────────────────────────
function DeleteModal({ payment, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.delete(`/payments/${payment.id}`);
      toast.success('Payment deleted');
      onDeleted();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 animate-scale-in p-6">
        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Delete Payment?</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              <span className="font-semibold text-slate-700 dark:text-slate-200">{payment.vendorName}</span>
              {' '}— Invoice {payment.invoiceNumber} will be permanently deleted.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={loading} className="btn btn-secondary flex-1">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={loading} className="btn btn-danger flex-1">
            {loading ? 'Deleting…' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function PaymentList() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);

  const [payments, setPayments] = useState([]);
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filters, setFilters] = useState({ entityId: '', status: '', vendorName: '' });

  useEffect(() => {
    fetchPayments();
  }, [filters]);

  useEffect(() => {
    fetchEntities();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
      const res = await api.get(`/payments?${params}`);
      setPayments(res.data.payments);
    } catch {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const fetchEntities = async () => {
    try {
      const res = await api.get('/entities?isActive=true');
      setEntities(res.data);
    } catch {}
  };

  const clearFilters = () => setFilters({ entityId: '', status: '', vendorName: '' });
  const hasFilters = filters.entityId || filters.status || filters.vendorName;

  // Permission helpers — visible on all rows
  const canEdit = (p) =>
    user?.role !== 'department_user' || p.userId === user?.id;

  const canDelete = (p) =>
    user?.role !== 'department_user' || p.userId === user?.id;

  const isOverdue = (p) =>
    new Date(p.dueDate) < new Date() && !['paid', 'rejected'].includes(p.status);

  const fmt = (n) => `₹${parseFloat(n || 0).toLocaleString('en-IN')}`;

  return (
    <>
      <div className="space-y-5 animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="page-title">Payment Requests</h1>
            <p className="page-subtitle">Manage all payment requests</p>
          </div>
          <button
            onClick={() => navigate('/payments/new')}
            className="btn btn-primary shadow-lg shadow-blue-500/25"
          >
            <Plus className="w-4 h-4" /> New Payment
          </button>
        </div>

        {/* Filters card */}
        <div className="card !p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Filters</span>
              {hasFilters && (
                <span className="w-2 h-2 rounded-full bg-blue-500" />
              )}
            </div>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Entity */}
            <div className="relative">
              <select
                value={filters.entityId}
                onChange={e => setFilters(f => ({ ...f, entityId: e.target.value }))}
                className="input pr-8 appearance-none"
              >
                <option value="">All Entities</option>
                {entities.map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Status */}
            <div className="relative">
              <select
                value={filters.status}
                onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
                className="input pr-8 appearance-none"
              >
                <option value="">All Statuses</option>
                {Object.entries(STATUS_CONFIG).map(([val, { label }]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Vendor search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={filters.vendorName}
                onChange={e => setFilters(f => ({ ...f, vendorName: e.target.value }))}
                placeholder="Search vendor…"
                className="input pl-10"
              />
              {filters.vendorName && (
                <button
                  onClick={() => setFilters(f => ({ ...f, vendorName: '' }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table card */}
        <div className="card !p-0 overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="skeleton w-10 h-10 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-3 w-48 rounded" />
                    <div className="skeleton h-2.5 w-32 rounded" />
                  </div>
                  <div className="skeleton h-6 w-20 rounded-full" />
                  <div className="skeleton h-8 w-24 rounded-lg" />
                </div>
              ))}
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
                <IndianRupee className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-4">
                {hasFilters ? 'No payments match your filters' : 'No payment requests yet'}
              </p>
              {!hasFilters && (
                <button onClick={() => navigate('/payments/new')} className="btn btn-primary text-xs">
                  Create First Payment
                </button>
              )}
              {hasFilters && (
                <button onClick={clearFilters} className="btn btn-secondary text-xs">
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                      {['Vendor', 'Entity', 'Invoice', 'Amount', 'Due Date', 'Status', 'Actions'].map(h => (
                        <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                    {payments.map((payment, i) => {
                      const sc = STATUS_CONFIG[payment.status] || STATUS_CONFIG.draft;
                      const overdue = isOverdue(payment);

                      return (
                        <tr
                          key={payment.id}
                          className="hover:bg-blue-50/40 dark:hover:bg-slate-700/40 transition-colors group animate-fade-in"
                          style={{ animationDelay: `${i * 30}ms` }}
                        >
                          {/* Vendor */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 flex items-center justify-center shrink-0">
                                <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300">
                                  {payment.vendorName?.[0]?.toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                  {payment.vendorName}
                                </div>
                                <div className="text-xs text-slate-400">{payment.natureOfExpense}</div>
                              </div>
                            </div>
                          </td>

                          {/* Entity */}
                          <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                            {payment.entity?.name}
                          </td>

                          {/* Invoice */}
                          <td className="px-5 py-4">
                            <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                              {payment.invoiceNumber}
                            </div>
                            <div className="text-xs text-slate-400">
                              {new Date(payment.invoiceDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </div>
                          </td>

                          {/* Amount */}
                          <td className="px-5 py-4 whitespace-nowrap text-sm font-semibold text-slate-800 dark:text-slate-100">
                            {fmt(payment.totalAmount)}
                          </td>

                          {/* Due Date */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${overdue ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-300'}`}>
                              {new Date(payment.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                            {overdue && <div className="text-[10px] text-red-500 font-semibold">⚠ Overdue</div>}
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className={`badge ${sc.cls}`}>{sc.label}</span>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1">
                              {/* View */}
                              <button
                                onClick={() => navigate(`/payments/${payment.id}`)}
                                className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all"
                                title="View details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Edit — draft only */}
                              {canEdit(payment) && (
                                <button
                                  onClick={() => navigate(`/payments/${payment.id}/edit`)}
                                  className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-all"
                                  title="Edit payment"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                              )}

                              {/* Delete — draft only */}
                              {canDelete(payment) && (
                                <button
                                  onClick={() => setDeleteTarget(payment)}
                                  className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
                                  title="Delete payment"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer count */}
              <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-400">
                {payments.length} payment{payments.length !== 1 ? 's' : ''} found
                {hasFilters && ' (filtered)'}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete modal */}
      {deleteTarget && (
        <DeleteModal
          payment={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => { setDeleteTarget(null); fetchPayments(); }}
        />
      )}
    </>
  );
}
