import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Edit, Download, Trash2, CheckCircle2,
  X, Calendar, Hash, CreditCard, FileText, Banknote
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
  paid:         { cls: 'badge-success', label: 'Paid ✓' },
};

const PAYMENT_MODES = ['NEFT', 'RTGS', 'IMPS', 'UPI', 'Cheque', 'Cash', 'Other'];

function Field({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{value || '—'}</p>
    </div>
  );
}

// Modal: Mark as Paid
function MarkPaidModal({ payment, onClose, onSuccess }) {
  const [form, setForm] = useState({
    paidDate: new Date().toISOString().split('T')[0],
    utrReference: '',
    paymentMode: 'NEFT',
    paidRemarks: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/payments/${payment.id}/mark-paid`, form);
      toast.success('Payment marked as paid!');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 animate-scale-in">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Mark as Paid</h2>
              <p className="text-xs text-slate-400">{payment.vendorName} · ₹{parseFloat(payment.totalAmount).toLocaleString('en-IN')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Payment Date */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
              <Calendar className="w-3.5 h-3.5" /> Payment Date <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              required
              value={form.paidDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={e => setForm(f => ({ ...f, paidDate: e.target.value }))}
              className="input"
            />
          </div>

          {/* Payment Mode */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
              <CreditCard className="w-3.5 h-3.5" /> Payment Mode
            </label>
            <select
              value={form.paymentMode}
              onChange={e => setForm(f => ({ ...f, paymentMode: e.target.value }))}
              className="input"
            >
              {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {/* UTR / Transaction Reference */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
              <Hash className="w-3.5 h-3.5" /> UTR / Transaction Reference
            </label>
            <input
              type="text"
              value={form.utrReference}
              onChange={e => setForm(f => ({ ...f, utrReference: e.target.value }))}
              placeholder="e.g. NEFT2024060412345"
              className="input"
            />
          </div>

          {/* Remarks */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
              <FileText className="w-3.5 h-3.5" /> Remarks (optional)
            </label>
            <textarea
              value={form.paidRemarks}
              onChange={e => setForm(f => ({ ...f, paidRemarks: e.target.value }))}
              rows={2}
              placeholder="Any notes about this payment…"
              className="input resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-success flex-1"
            >
              {loading ? 'Saving…' : '✓ Confirm Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PaymentDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const user = useAuthStore(s => s.user);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaidModal, setShowPaidModal] = useState(false);

  useEffect(() => { fetchPayment(); }, [id]);

  const fetchPayment = async () => {
    try {
      const res = await api.get(`/payments/${id}`);
      setPayment(res.data);
    } catch {
      toast.error('Failed to load payment details');
      navigate('/payments');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this payment request?')) return;
    try {
      await api.delete(`/payments/${id}`);
      toast.success('Payment deleted');
      navigate('/payments');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="skeleton h-10 w-64 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 skeleton h-80 rounded-2xl" />
          <div className="skeleton h-48 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!payment) return null;

  const sc = STATUS_CONFIG[payment.status] || STATUS_CONFIG.draft;
  const canEdit = (user?.role !== 'department_user') ||
                  (payment.userId === user?.id && payment.status === 'draft');
  const canDelete = (user?.role !== 'department_user') ||
                    (payment.userId === user?.id && payment.status === 'draft');
  const canMarkPaid = ['admin', 'finance'].includes(user?.role) && payment.status === 'approved';

  // Parse payment confirmation info if status is paid
  let paidInfo = null;
  if (payment.status === 'paid' && payment.rejectionReason) {
    try { paidInfo = JSON.parse(payment.rejectionReason); } catch {}
  }

  const fmt = n => `₹${parseFloat(n || 0).toLocaleString('en-IN')}`;

  return (
    <>
      <div className="space-y-6 animate-fade-in">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/payments')}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </button>
            <div>
              <h1 className="page-title">Payment Details</h1>
              <p className="page-subtitle">{payment.invoiceNumber} · {payment.vendorName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* ── Mark as Paid ── */}
            {canMarkPaid && (
              <button
                onClick={() => setShowPaidModal(true)}
                className="btn btn-success shadow-lg shadow-emerald-500/25"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark as Paid
              </button>
            )}
            {canEdit && payment.status === 'draft' && (
              <button
                onClick={() => navigate(`/payments/${id}/edit`)}
                className="btn btn-secondary"
              >
                <Edit className="w-4 h-4" /> Edit
              </button>
            )}
            {canDelete && payment.status === 'draft' && (
              <button onClick={handleDelete} className="btn btn-danger">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: main info */}
          <div className="lg:col-span-2 space-y-5">

            {/* Payment information card */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="section-title">Payment Information</h2>
                <span className={`badge ${sc.cls}`}>{sc.label}</span>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <Field label="Entity"          value={payment.entity?.name} />
                <Field label="Vendor / Payee"  value={payment.vendorName} />
                <Field label="Nature of Expense" value={payment.natureOfExpense} />
                <Field label="Payment Terms"   value={payment.paymentTerms} />
                <Field label="Invoice Number"  value={payment.invoiceNumber} />
                <Field label="Invoice Date"    value={new Date(payment.invoiceDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })} />
                <Field label="Due Date"        value={new Date(payment.dueDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })} />
                <Field label="Created By"      value={payment.user?.name} />
              </div>

              {payment.remarks && (
                <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-700">
                  <Field label="Remarks" value={payment.remarks} />
                </div>
              )}

              {payment.status === 'rejected' && payment.rejectionReason && (
                <div className="mt-5 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-xs font-semibold uppercase tracking-widest text-red-600 dark:text-red-400 mb-1">Rejection Reason</p>
                  <p className="text-sm text-red-800 dark:text-red-300">{payment.rejectionReason}</p>
                </div>
              )}
            </div>

            {/* Payment confirmation info (when paid) */}
            {paidInfo && (
              <div className="card border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-900/10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center">
                    <Banknote className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="section-title text-emerald-800 dark:text-emerald-300">Payment Confirmation</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Paid On"        value={paidInfo.paidDate ? new Date(paidInfo.paidDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—'} />
                  <Field label="Payment Mode"   value={paidInfo.paymentMode} />
                  <Field label="UTR Reference"  value={paidInfo.utrReference || 'Not provided'} />
                  <Field label="Marked By"      value={paidInfo.markedBy} />
                  {paidInfo.paidRemarks && (
                    <div className="col-span-2">
                      <Field label="Remarks" value={paidInfo.paidRemarks} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Approval history */}
            {payment.approvals?.length > 0 && (
              <div className="card">
                <h2 className="section-title mb-4">Approval History</h2>
                <div className="space-y-3">
                  {payment.approvals.map(approval => (
                    <div key={approval.id} className="flex items-start justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{approval.approver?.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {approval.stage?.toUpperCase()} · {approval.status?.toUpperCase()}
                        </p>
                        {approval.comments && (
                          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5">{approval.comments}</p>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 whitespace-nowrap ml-4">
                        {new Date(approval.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: amount + attachment */}
          <div className="space-y-5">

            {/* Amount summary */}
            <div className="card">
              <h2 className="section-title mb-5">Amount Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Invoice Amount</span>
                  <span className="font-medium text-slate-800 dark:text-slate-100">{fmt(payment.invoiceAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">GST Amount</span>
                  <span className="font-medium text-slate-800 dark:text-slate-100">{fmt(payment.gstAmount)}</span>
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">Total Amount</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{fmt(payment.totalAmount)}</span>
                </div>
              </div>

              {/* Inline paid action CTA */}
              {canMarkPaid && (
                <button
                  onClick={() => setShowPaidModal(true)}
                  className="btn btn-success w-full mt-5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark as Paid
                </button>
              )}

              {payment.status === 'paid' && (
                <div className="mt-4 flex items-center gap-2 px-3 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Payment Completed</span>
                </div>
              )}
            </div>

            {/* Attachment */}
            {payment.attachment && (
              <div className="card">
                <h2 className="section-title mb-4">Attachment</h2>
                <a
                  href={`/uploads/${payment.attachment}`}
                  download
                  className="btn btn-secondary w-full"
                >
                  <Download className="w-4 h-4" /> Download File
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mark as Paid Modal */}
      {showPaidModal && (
        <MarkPaidModal
          payment={payment}
          onClose={() => setShowPaidModal(false)}
          onSuccess={() => { setShowPaidModal(false); fetchPayment(); }}
        />
      )}
    </>
  );
}
