import { useEffect, useState } from 'react';
import {
  Mail, Plus, Trash2, ToggleLeft, ToggleRight,
  X, Search, AlertTriangle, Send, CheckCircle2, UserPlus
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

// ── Add Recipient Modal ────────────────────────────────────────────────────
function AddModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ email: '', name: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/emails/recipients', form);
      toast.success(`${form.email} added as recipient`);
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add recipient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 animate-scale-in">

        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Add Email Recipient</h2>
              <p className="text-xs text-slate-400">Will receive the weekly payment schedule</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
              Email Address <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="finance@company.com"
                className="input pl-10"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
              Display Name <span className="text-slate-300">(optional)</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Finance Team"
              className="input"
            />
          </div>

          {/* Mailgun sandbox warning */}
          <div className="flex gap-2.5 p-3.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-400">
              <strong>Mailgun Sandbox:</strong> Emails can only be sent to addresses authorized in your Mailgun dashboard. Add the recipient there too.
            </p>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary flex-1">
              <Plus className="w-4 h-4" />
              {loading ? 'Adding…' : 'Add Recipient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete Confirm ─────────────────────────────────────────────────────────
function DeleteModal({ recipient, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.delete(`/emails/recipients/${recipient.id}`);
      toast.success('Recipient removed');
      onDeleted();
    } catch {
      toast.error('Failed to remove recipient');
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
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Remove Recipient?</h2>
            <p className="text-sm text-slate-500 mt-1">
              <span className="font-semibold text-slate-700 dark:text-slate-200">{recipient.email}</span> will no longer receive weekly emails.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
          <button onClick={handleDelete} disabled={loading} className="btn btn-danger flex-1">
            {loading ? 'Removing…' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Test Email Modal ───────────────────────────────────────────────────────
function TestEmailModal({ onClose }) {
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleTest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/emails/send-weekly');
      setSent(true);
      toast.success('Weekly email dispatched!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Email send failed — check SMTP settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 animate-scale-in p-6">
        {sent ? (
          <div className="text-center py-4">
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-3" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-1">Email Sent!</h2>
            <p className="text-sm text-slate-400 mb-5">Check your inbox in a few moments.</p>
            <button onClick={onClose} className="btn btn-primary w-full">Done</button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center">
                <Send className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Send Weekly Email Now</h2>
                <p className="text-xs text-slate-400">Sends to all active recipients</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
              This will immediately send the weekly pending payment schedule to all active recipients.
            </p>
            <div className="flex gap-3">
              <button onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
              <button onClick={handleTest} disabled={loading} className="btn btn-success flex-1">
                {loading ? 'Sending…' : 'Send Now'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function EmailRecipients() {
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showTestModal, setShowTestModal] = useState(false);
  const [toggling, setToggling] = useState(null);

  useEffect(() => { fetchRecipients(); }, []);

  const fetchRecipients = async () => {
    try {
      const res = await api.get('/emails/recipients');
      setRecipients(res.data);
    } catch {
      toast.error('Failed to load recipients');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (r) => {
    setToggling(r.id);
    try {
      const res = await api.patch(`/emails/recipients/${r.id}/toggle-status`);
      setRecipients(prev => prev.map(x => x.id === r.id ? res.data : x));
      toast.success(`${r.email} ${res.data.isActive ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error('Failed to toggle');
    } finally {
      setToggling(null);
    }
  };

  const filtered = recipients.filter(r =>
    r.email.toLowerCase().includes(search.toLowerCase()) ||
    (r.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const active = recipients.filter(r => r.isActive).length;

  return (
    <>
      <div className="space-y-6 animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="page-title">Email Recipients</h1>
            <p className="page-subtitle">Manage who receives the weekly pending payment schedule</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowTestModal(true)} className="btn btn-success shadow-sm shadow-emerald-500/20">
              <Send className="w-4 h-4" /> Send Weekly Email
            </button>
            <button onClick={() => setShowAdd(true)} className="btn btn-primary shadow-lg shadow-blue-500/25">
              <Plus className="w-4 h-4" /> Add Recipient
            </button>
          </div>
        </div>

        {/* SMTP status + summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card !p-4 flex items-center gap-3 border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-900/10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">SMTP</p>
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Mailgun Connected</p>
              <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70">smtp.mailgun.org : 587</p>
            </div>
          </div>
          {[
            { label: 'Total Recipients', value: recipients.length, color: 'text-blue-700 dark:text-blue-300' },
            { label: 'Active',           value: active,            color: 'text-emerald-700 dark:text-emerald-300' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card !p-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Mailgun sandbox notice */}
        <div className="flex gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-700 dark:text-amber-400">
            <strong>Mailgun Sandbox Mode:</strong> You are on a sandbox domain. Emails can only be delivered to addresses you authorize in your{' '}
            <strong>Mailgun dashboard → Sending → Authorized Recipients</strong>.
            Upgrade to a custom Mailgun domain to send to any address.
          </div>
        </div>

        {/* Recipients table */}
        <div className="card !p-0 overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search recipients…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-slate-700 dark:text-slate-300 placeholder-slate-400 outline-none"
            />
            {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-slate-400" /></button>}
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="skeleton w-10 h-10 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-3 w-48 rounded" />
                    <div className="skeleton h-2.5 w-32 rounded" />
                  </div>
                  <div className="skeleton h-6 w-16 rounded-full" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-slate-500 text-sm font-medium">
                {search ? 'No recipients match your search' : 'No recipients added yet'}
              </p>
              {!search && (
                <button onClick={() => setShowAdd(true)} className="btn btn-primary mt-4 text-xs">
                  Add First Recipient
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-400">Recipient</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-400">Email</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-400">Status</th>
                    <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-widest text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                  {filtered.map((r, i) => (
                    <tr
                      key={r.id}
                      className="hover:bg-blue-50/40 dark:hover:bg-slate-700/40 transition-colors animate-fade-in"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 flex items-center justify-center shrink-0">
                            <span className="text-[12px] font-bold text-blue-700 dark:text-blue-300">
                              {(r.name || r.email)[0].toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                            {r.name || <span className="italic text-slate-400 font-normal">No name</span>}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">{r.email}</td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleToggle(r)}
                          disabled={toggling === r.id}
                          className="flex items-center gap-2 group/toggle"
                        >
                          {r.isActive
                            ? <ToggleRight className="w-6 h-6 text-emerald-500 group-hover/toggle:text-emerald-600 transition-colors" />
                            : <ToggleLeft  className="w-6 h-6 text-slate-300 dark:text-slate-600 group-hover/toggle:text-slate-400 transition-colors" />
                          }
                          <span className={`text-xs font-semibold ${r.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                            {toggling === r.id ? '…' : r.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end">
                          <button
                            onClick={() => setDeleteTarget(r)}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
                            title="Remove recipient"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-400">
                {active} of {recipients.length} recipients active · Weekly email sends to active recipients only
              </div>
            </div>
          )}
        </div>
      </div>

      {showAdd    && <AddModal    onClose={() => setShowAdd(false)}         onSaved={() => { setShowAdd(false);    fetchRecipients(); }} />}
      {deleteTarget && <DeleteModal recipient={deleteTarget} onClose={() => setDeleteTarget(null)} onDeleted={() => { setDeleteTarget(null); fetchRecipients(); }} />}
      {showTestModal && <TestEmailModal onClose={() => setShowTestModal(false)} />}
    </>
  );
}
