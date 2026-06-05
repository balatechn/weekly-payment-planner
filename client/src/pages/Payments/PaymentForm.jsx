import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Save, Send, Upload, X, FileText,
  Building2, User, Hash, Calendar, IndianRupee,
  CreditCard, MessageSquare, Paperclip, ChevronDown
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PAYMENT_TERMS = ['Advance', 'Part Payment', 'Final Invoice', 'Retention', 'Urgent'];

const EMPTY_FORM = {
  entityId: '',
  vendorName: '',
  natureOfExpense: '',
  invoiceNumber: '',
  invoiceDate: '',
  invoiceAmount: '',
  gstAmount: '',
  dueDate: '',
  paymentTerms: '',
  remarks: '',
};

function FieldWrapper({ label, required, icon: Icon, error, children }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
        {required && <span className="text-red-400 normal-case tracking-normal text-sm leading-none">*</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function PaymentForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const fileRef = useRef(null);

  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEdit);
  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState({});

  // Derived total
  const total = (parseFloat(form.invoiceAmount) || 0) + (parseFloat(form.gstAmount) || 0);

  useEffect(() => {
    fetchEntities();
    if (isEdit) fetchPayment();
  }, [id]);

  const fetchEntities = async () => {
    try {
      const res = await api.get('/entities?isActive=true');
      setEntities(res.data);
    } catch {
      toast.error('Failed to load entities');
    }
  };

  const fetchPayment = async () => {
    try {
      const res = await api.get(`/payments/${id}`);
      const p = res.data;
      setForm({
        entityId:       p.entityId       || '',
        vendorName:     p.vendorName      || '',
        natureOfExpense:p.natureOfExpense || '',
        invoiceNumber:  p.invoiceNumber   || '',
        invoiceDate:    p.invoiceDate     || '',
        invoiceAmount:  p.invoiceAmount   || '',
        gstAmount:      p.gstAmount       || '',
        dueDate:        p.dueDate         || '',
        paymentTerms:   p.paymentTerms    || '',
        remarks:        p.remarks         || '',
      });
    } catch {
      toast.error('Failed to load payment');
      navigate('/payments');
    } finally {
      setPageLoading(false);
    }
  };

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.entityId)        e.entityId        = 'Please select an entity';
    if (!form.vendorName.trim()) e.vendorName     = 'Vendor name is required';
    if (!form.natureOfExpense.trim()) e.natureOfExpense = 'Nature of expense is required';
    if (!form.invoiceNumber.trim()) e.invoiceNumber = 'Invoice number is required';
    if (!form.invoiceDate)     e.invoiceDate     = 'Invoice date is required';
    if (!form.invoiceAmount || isNaN(parseFloat(form.invoiceAmount))) e.invoiceAmount = 'Valid amount required';
    if (!form.dueDate)         e.dueDate         = 'Due date is required';
    if (!form.paymentTerms)    e.paymentTerms    = 'Please select payment terms';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // File handling
  const handleFile = (f) => {
    if (!f) return;
    const allowed = /\.(pdf|jpg|jpeg|png|xls|xlsx)$/i;
    if (!allowed.test(f.name)) {
      toast.error('Only PDF, JPG, PNG, XLS files allowed');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB');
      return;
    }
    setFile(f);
  };

  const fileToBase64 = (f) =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(f);
    });

  const handleSubmit = async (asDraft = false) => {
    if (!validate()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const payload = { ...form };

      if (file) {
        payload.attachmentBase64 = await fileToBase64(file);
        payload.attachmentName   = file.name;
      }

      if (isEdit) {
        await api.put(`/payments/${id}`, payload);
        toast.success('Payment updated successfully');
        navigate(`/payments/${id}`);
      } else {
        const res = await api.post('/payments', payload);
        if (!asDraft) {
          await api.post(`/payments/${res.data.id}/submit`);
          toast.success('Payment submitted for approval');
        } else {
          toast.success('Payment saved as draft');
        }
        navigate('/payments');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save payment');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="space-y-4 animate-pulse max-w-4xl mx-auto">
        <div className="skeleton h-10 w-64 rounded-xl" />
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">

      {/* Page header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/payments')}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </button>
        <div>
          <h1 className="page-title">{isEdit ? 'Edit Payment Request' : 'New Payment Request'}</h1>
          <p className="page-subtitle">Fill in the details below and submit for approval</p>
        </div>
      </div>

      {/* Main form card */}
      <div className="card space-y-6">

        {/* ── Section: Basic Details ── */}
        <div>
          <h2 className="section-title mb-4 pb-3 border-b border-slate-100 dark:border-slate-700">
            Payment Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Entity */}
            <FieldWrapper label="Entity" required icon={Building2} error={errors.entityId}>
              <div className="relative">
                <select
                  value={form.entityId}
                  onChange={e => set('entityId', e.target.value)}
                  className={`input pr-10 appearance-none ${errors.entityId ? 'border-red-400 focus:ring-red-400' : ''}`}
                >
                  <option value="">Select entity…</option>
                  {entities.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </FieldWrapper>

            {/* Vendor */}
            <FieldWrapper label="Vendor / Payee Name" required icon={User} error={errors.vendorName}>
              <input
                type="text"
                value={form.vendorName}
                onChange={e => set('vendorName', e.target.value)}
                placeholder="e.g. ABC Contractors Pvt Ltd"
                className={`input ${errors.vendorName ? 'border-red-400 focus:ring-red-400' : ''}`}
              />
            </FieldWrapper>

            {/* Nature of Expense */}
            <FieldWrapper label="Nature of Expense" required icon={FileText} error={errors.natureOfExpense}>
              <input
                type="text"
                value={form.natureOfExpense}
                onChange={e => set('natureOfExpense', e.target.value)}
                placeholder="e.g. Civil Work – Tower B"
                className={`input ${errors.natureOfExpense ? 'border-red-400 focus:ring-red-400' : ''}`}
              />
            </FieldWrapper>

            {/* Invoice Number */}
            <FieldWrapper label="Invoice Number" required icon={Hash} error={errors.invoiceNumber}>
              <input
                type="text"
                value={form.invoiceNumber}
                onChange={e => set('invoiceNumber', e.target.value)}
                placeholder="e.g. INV-2024-001"
                className={`input ${errors.invoiceNumber ? 'border-red-400 focus:ring-red-400' : ''}`}
              />
            </FieldWrapper>

            {/* Invoice Date */}
            <FieldWrapper label="Invoice Date" required icon={Calendar} error={errors.invoiceDate}>
              <input
                type="date"
                value={form.invoiceDate}
                onChange={e => set('invoiceDate', e.target.value)}
                className={`input ${errors.invoiceDate ? 'border-red-400 focus:ring-red-400' : ''}`}
              />
            </FieldWrapper>

            {/* Due Date */}
            <FieldWrapper label="Due Date" required icon={Calendar} error={errors.dueDate}>
              <input
                type="date"
                value={form.dueDate}
                onChange={e => set('dueDate', e.target.value)}
                className={`input ${errors.dueDate ? 'border-red-400 focus:ring-red-400' : ''}`}
              />
            </FieldWrapper>

          </div>
        </div>

        {/* ── Section: Amount ── */}
        <div>
          <h2 className="section-title mb-4 pb-3 border-b border-slate-100 dark:border-slate-700">
            Amount Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Invoice Amount */}
            <FieldWrapper label="Invoice Amount (₹)" required icon={IndianRupee} error={errors.invoiceAmount}>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.invoiceAmount}
                onChange={e => set('invoiceAmount', e.target.value)}
                placeholder="0.00"
                className={`input ${errors.invoiceAmount ? 'border-red-400 focus:ring-red-400' : ''}`}
              />
            </FieldWrapper>

            {/* GST Amount */}
            <FieldWrapper label="GST Amount (₹)" icon={IndianRupee}>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.gstAmount}
                onChange={e => set('gstAmount', e.target.value)}
                placeholder="0.00"
                className="input"
              />
            </FieldWrapper>

            {/* Total (read-only) */}
            <FieldWrapper label="Total Amount (Auto)">
              <div className="input bg-slate-50 dark:bg-slate-900 cursor-not-allowed flex items-center gap-2">
                <span className="text-slate-400">₹</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 text-base">
                  {total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </FieldWrapper>

          </div>
        </div>

        {/* ── Section: Terms & Attachment ── */}
        <div>
          <h2 className="section-title mb-4 pb-3 border-b border-slate-100 dark:border-slate-700">
            Terms & Attachment
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Payment Terms */}
            <FieldWrapper label="Payment Terms" required icon={CreditCard} error={errors.paymentTerms}>
              <div className="relative">
                <select
                  value={form.paymentTerms}
                  onChange={e => set('paymentTerms', e.target.value)}
                  className={`input pr-10 appearance-none ${errors.paymentTerms ? 'border-red-400 focus:ring-red-400' : ''}`}
                >
                  <option value="">Select payment terms…</option>
                  {PAYMENT_TERMS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </FieldWrapper>

            {/* Attachment */}
            <FieldWrapper label="Attachment" icon={Paperclip}>
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                onClick={() => !file && fileRef.current?.click()}
                className={`
                  relative border-2 border-dashed rounded-xl px-4 py-3 cursor-pointer transition-all duration-200
                  ${dragOver
                    ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }
                `}
              >
                {file ? (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{file.name}</p>
                      <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setFile(null); }}
                      className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Upload className="w-5 h-5 text-slate-400 shrink-0" />
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-medium text-blue-600 dark:text-blue-400">Click to upload</span>
                        {' '}or drag & drop
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">PDF, JPG, PNG, XLS up to 5MB</p>
                    </div>
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.xls,.xlsx"
                  className="hidden"
                  onChange={e => handleFile(e.target.files[0])}
                />
              </div>
            </FieldWrapper>

          </div>
        </div>

        {/* ── Remarks ── */}
        <FieldWrapper label="Remarks" icon={MessageSquare}>
          <textarea
            value={form.remarks}
            onChange={e => set('remarks', e.target.value)}
            rows={3}
            placeholder="Additional notes or comments…"
            className="input resize-none"
          />
        </FieldWrapper>

        {/* ── Action Buttons ── */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
          <button
            type="button"
            onClick={() => navigate('/payments')}
            disabled={loading}
            className="btn btn-secondary"
          >
            Cancel
          </button>

          {!isEdit && (
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="btn btn-secondary"
            >
              <Save className="w-4 h-4" />
              Save as Draft
            </button>
          )}

          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={loading}
            className="btn btn-primary shadow-lg shadow-blue-500/25"
          >
            {loading ? (
              <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg> Processing…</>
            ) : (
              <><Send className="w-4 h-4" />
              {isEdit ? 'Update Payment' : 'Submit for Approval'}</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
