import { useEffect, useState } from 'react';
import {
  Mail, Send, Eye, X, CheckCircle2, AlertCircle,
  Calendar, Users, IndianRupee, FileText, Clock
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

// ── Send Weekly Confirm Modal ──────────────────────────────────────────────
function SendConfirmModal({ onClose, onSent }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSend = async () => {
    setLoading(true);
    try {
      const res = await api.post('/emails/send-weekly');
      setResult({ success: true, ...res.data });
      toast.success(res.data.message || 'Weekly email sent!');
      onSent();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to send email';
      setResult({ success: false, message: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={!loading ? onClose : undefined} />
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 animate-scale-in p-6">

        {result ? (
          <div className="text-center py-2">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${result.success ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-red-50 dark:bg-red-900/30'}`}>
              {result.success
                ? <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                : <AlertCircle  className="w-7 h-7 text-red-500" />
              }
            </div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
              {result.success ? 'Email Dispatched!' : 'Send Failed'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{result.message}</p>
            {result.success && result.paymentCount > 0 && (
              <p className="text-xs text-slate-400">
                {result.paymentCount} payment{result.paymentCount > 1 ? 's' : ''} · ₹{parseFloat(result.totalAmount || 0).toLocaleString('en-IN')}
              </p>
            )}
            <button onClick={onClose} className="btn btn-primary w-full mt-5">Done</button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Send className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Send Weekly Email</h2>
                <p className="text-xs text-slate-400">All pending payments to active recipients</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
              This will immediately send the current pending payment schedule (Submitted + Under Review + Approved) to all active email recipients.
            </p>
            <div className="flex gap-3">
              <button onClick={onClose} disabled={loading} className="btn btn-secondary flex-1">Cancel</button>
              <button onClick={handleSend} disabled={loading} className="btn btn-primary flex-1">
                {loading
                  ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Sending…</>
                  : <><Send className="w-4 h-4" /> Send Now</>
                }
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Email Preview Modal ────────────────────────────────────────────────────
function PreviewModal({ email, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 animate-scale-in flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{email.subject}</h2>
              <p className="text-xs text-slate-400">To: {email.recipients}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-3 gap-4 px-5 py-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 shrink-0">
          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Sent At</p>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5">
              {new Date(email.sentAt).toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Payments</p>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5">{email.paymentCount || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Total</p>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5">
              {email.totalAmount ? `₹${parseFloat(email.totalAmount).toLocaleString('en-IN')}` : '—'}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          <div
            className="bg-white rounded-xl border border-slate-200 p-4 text-sm"
            dangerouslySetInnerHTML={{ __html: email.body }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function EmailHistory() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSendModal, setShowSendModal] = useState(false);
  const [previewEmail, setPreviewEmail] = useState(null);

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/emails/history');
      setEmails(res.data.emails || []);
    } catch {
      toast.error('Failed to load email history');
    } finally {
      setLoading(false);
    }
  };

  const viewEmail = async (id) => {
    try {
      const res = await api.get(`/emails/history/${id}`);
      setPreviewEmail(res.data);
    } catch {
      toast.error('Failed to load email');
    }
  };

  const sent    = emails.filter(e => e.status === 'sent').length;
  const failed  = emails.filter(e => e.status === 'failed').length;

  return (
    <>
      <div className="space-y-6 animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="page-title">Email Schedule</h1>
            <p className="page-subtitle">Send weekly pending payment emails and view history</p>
          </div>
          <button
            onClick={() => setShowSendModal(true)}
            className="btn btn-primary shadow-lg shadow-blue-500/25"
          >
            <Send className="w-4 h-4" /> Send Weekly Email
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Sent',  value: emails.length, icon: Mail,         grad: 'from-blue-500 to-indigo-600' },
            { label: 'Successful',  value: sent,          icon: CheckCircle2, grad: 'from-emerald-400 to-green-600' },
            { label: 'Failed',      value: failed,        icon: AlertCircle,  grad: 'from-red-400 to-rose-600' },
            { label: 'Auto-Schedule', value: 'Fri 4 PM',  icon: Clock,        grad: 'from-violet-500 to-purple-700' },
          ].map(({ label, value, icon: Icon, grad }) => (
            <div key={label} className="kpi-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p>
                </div>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-sm`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="card !p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
            <Mail className="w-4 h-4 text-slate-400" />
            <h2 className="section-title">Email History</h2>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="skeleton w-9 h-9 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-3 w-64 rounded" />
                    <div className="skeleton h-2.5 w-40 rounded" />
                  </div>
                  <div className="skeleton h-6 w-16 rounded-full" />
                </div>
              ))}
            </div>
          ) : emails.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-4">No emails sent yet</p>
              <button onClick={() => setShowSendModal(true)} className="btn btn-primary text-xs">
                Send First Weekly Email
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                    {['Subject', 'Recipients', 'Payments', 'Total Amount', 'Sent At', 'Status', ''].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                  {emails.map((email, i) => (
                    <tr
                      key={email.id}
                      className="hover:bg-blue-50/40 dark:hover:bg-slate-700/40 transition-colors animate-fade-in"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${email.status === 'sent' ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-red-50 dark:bg-red-900/30'}`}>
                            {email.status === 'sent'
                              ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              : <AlertCircle  className="w-4 h-4 text-red-500" />
                            }
                          </div>
                          <span className="text-sm font-medium text-slate-800 dark:text-slate-100 max-w-xs truncate">
                            {email.subject}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400 max-w-[180px] truncate">
                        {email.recipients || '—'}
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                        {email.paymentCount || 0}
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {email.totalAmount ? `₹${parseFloat(email.totalAmount).toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {new Date(email.sentAt).toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`badge ${email.status === 'sent' ? 'badge-success' : 'badge-danger'}`}>
                          {email.status === 'sent' ? 'Sent' : 'Failed'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => viewEmail(email.id)}
                          className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> Preview
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showSendModal && (
        <SendConfirmModal
          onClose={() => setShowSendModal(false)}
          onSent={() => { fetchHistory(); }}
        />
      )}

      {previewEmail && (
        <PreviewModal email={previewEmail} onClose={() => setPreviewEmail(null)} />
      )}
    </>
  );
}
