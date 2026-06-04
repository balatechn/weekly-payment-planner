import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Send, Paperclip, ArrowLeft, CheckCircle, SkipForward } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const STEPS = [
  {
    field: 'entityId',
    type: 'select',
    question: "Which entity is this payment for?",
  },
  {
    field: 'vendorName',
    type: 'text',
    question: "Who is the vendor or payee name?",
    placeholder: 'e.g. ABC Contractors Pvt Ltd',
  },
  {
    field: 'natureOfExpense',
    type: 'text',
    question: "What is the nature of this expense?",
    placeholder: 'e.g. Civil Work – Tower B',
  },
  {
    field: 'invoiceNumber',
    type: 'text',
    question: "What is the invoice number?",
    placeholder: 'e.g. INV-245',
  },
  {
    field: 'invoiceDate',
    type: 'date',
    question: "What is the invoice date?",
  },
  {
    field: 'invoiceAmount',
    type: 'number',
    question: "What is the invoice amount (₹)?",
    placeholder: 'e.g. 50000',
  },
  {
    field: 'gstAmount',
    type: 'number',
    question: "What is the GST amount? (type 0 if none)",
    placeholder: 'e.g. 9000',
    optional: true,
  },
  {
    field: 'dueDate',
    type: 'date',
    question: "When is the payment due?",
  },
  {
    field: 'paymentTerms',
    type: 'select',
    question: "What are the payment terms?",
    options: ['Advance', 'Part Payment', 'Final Invoice', 'Retention', 'Urgent'],
  },
  {
    field: 'attachment',
    type: 'file',
    question: "Attach an invoice or document? (optional)",
    optional: true,
  },
  {
    field: 'remarks',
    type: 'text',
    question: "Any additional remarks? (optional)",
    placeholder: 'Add notes or skip…',
    optional: true,
  },
];

function BotBubble({ text, animate }) {
  return (
    <div className={`flex items-end gap-2 ${animate ? 'animate-fade-in' : ''}`}>
      <div className="w-8 h-8 rounded-full bg-primary-800 flex items-center justify-center text-white text-xs font-bold shrink-0">
        WP
      </div>
      <div className="max-w-[75%] bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl rounded-bl-sm px-4 py-3 text-gray-800 dark:text-gray-100 text-sm shadow-sm">
        {text}
      </div>
    </div>
  );
}

function UserBubble({ text }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[75%] bg-primary-800 text-white rounded-2xl rounded-br-sm px-4 py-3 text-sm shadow-sm">
        {text}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="w-8 h-8 rounded-full bg-primary-800 flex items-center justify-center text-white text-xs font-bold shrink-0">
        WP
      </div>
      <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center h-4">
          <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

export default function PaymentForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [entities, setEntities] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [file, setFile] = useState(null);
  const [answers, setAnswers] = useState({});
  const [typing, setTyping] = useState(false);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    fetchEntities();
  }, []);

  useEffect(() => {
    if (entities.length > 0 && messages.length === 0) {
      askStep(0);
    }
  }, [entities]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    if (!typing && !done) inputRef.current?.focus();
  }, [typing, currentStep]);

  const fetchEntities = async () => {
    try {
      const res = await api.get('/entities?isActive=true');
      setEntities(res.data);
    } catch {
      toast.error('Failed to load entities');
    }
  };

  const addBot = (text) => {
    setMessages(prev => [...prev, { role: 'bot', text }]);
  };

  const addUser = (text) => {
    setMessages(prev => [...prev, { role: 'user', text }]);
  };

  const askStep = (stepIndex) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      addBot(STEPS[stepIndex].question);
      setCurrentStep(stepIndex);
      setInputValue('');
      setFile(null);
    }, 600);
  };

  const displayValue = (field, value) => {
    if (field === 'entityId') {
      return entities.find(e => e.id === value)?.name || value;
    }
    if (field === 'invoiceAmount' || field === 'gstAmount') {
      return `₹${parseFloat(value).toLocaleString('en-IN')}`;
    }
    if (field === 'attachment') return value?.name || 'File attached';
    return value || '—';
  };

  const advance = (field, rawValue, displayText) => {
    const newAnswers = { ...answers, [field]: rawValue };
    setAnswers(newAnswers);
    addUser(displayText);

    const next = currentStep + 1;
    if (next < STEPS.length) {
      askStep(next);
    } else {
      // All steps done — show summary
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        const inv = parseFloat(newAnswers.invoiceAmount || 0);
        const gst = parseFloat(newAnswers.gstAmount || 0);
        const total = inv + gst;
        addBot(
          `Great! Here's a summary:\n\n` +
          `🏢 Entity: ${entities.find(e => e.id === newAnswers.entityId)?.name}\n` +
          `🏭 Vendor: ${newAnswers.vendorName}\n` +
          `📋 Invoice: ${newAnswers.invoiceNumber} (${newAnswers.invoiceDate})\n` +
          `💰 Total: ₹${total.toLocaleString('en-IN')} (incl. GST)\n` +
          `📅 Due: ${newAnswers.dueDate} · ${newAnswers.paymentTerms}\n\n` +
          `Ready to submit?`
        );
        setDone(true);
      }, 700);
    }
  };

  const skip = () => {
    const step = STEPS[currentStep];
    if (!step.optional) return;
    addUser('(skipped)');
    const newAnswers = { ...answers, [step.field]: step.field === 'gstAmount' ? '0' : '' };
    setAnswers(newAnswers);
    const next = currentStep + 1;
    if (next < STEPS.length) askStep(next);
  };

  const handleSend = () => {
    const step = STEPS[currentStep];
    if (step.type === 'file') {
      if (file) {
        advance(step.field, file, file.name);
      } else if (step.optional) {
        skip();
      }
      return;
    }

    const val = inputValue.trim();
    if (!val && !step.optional) return;
    if (!val && step.optional) { skip(); return; }

    advance(step.field, val, displayValue(step.field, val));
  };

  const handleSelect = (value) => {
    const step = STEPS[currentStep];
    advance(step.field, value, displayValue(step.field, value));
  };

  const fileToBase64 = (f) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });

  const submitPayment = async (asDraft = false) => {
    setSubmitting(true);
    try {
      const payload = {
        entityId: answers.entityId,
        vendorName: answers.vendorName,
        natureOfExpense: answers.natureOfExpense,
        invoiceNumber: answers.invoiceNumber,
        invoiceDate: answers.invoiceDate,
        invoiceAmount: answers.invoiceAmount,
        gstAmount: answers.gstAmount || '0',
        dueDate: answers.dueDate,
        paymentTerms: answers.paymentTerms,
        remarks: answers.remarks || '',
      };

      if (answers.attachment) {
        payload.attachmentBase64 = await fileToBase64(answers.attachment);
        payload.attachmentName = answers.attachment.name;
      }

      const res = await api.post('/payments', payload);

      if (!asDraft) {
        await api.post(`/payments/${res.data.id}/submit`);
        addBot('✅ Payment request submitted successfully! Redirecting…');
        toast.success('Payment submitted for approval');
      } else {
        addBot('✅ Saved as draft! Redirecting…');
        toast.success('Payment saved as draft');
      }

      setTimeout(() => navigate('/payments'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save payment');
      setSubmitting(false);
    }
  };

  const step = STEPS[currentStep];
  const progress = Math.round((currentStep / STEPS.length) * 100);

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
        <button onClick={() => navigate('/payments')} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-semibold text-gray-900 dark:text-white">New Payment Request</h1>
          {!done && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-800 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">{currentStep}/{STEPS.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3 px-1">
        {messages.map((msg, i) =>
          msg.role === 'bot'
            ? <BotBubble key={i} text={msg.text} animate />
            : <UserBubble key={i} text={msg.text} />
        )}
        {typing && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      {!done && !typing && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2">
          {/* Select options */}
          {step?.type === 'select' && step.field === 'entityId' && (
            <div className="flex flex-wrap gap-2">
              {entities.map(e => (
                <button
                  key={e.id}
                  onClick={() => handleSelect(e.id)}
                  className="px-3 py-1.5 text-sm rounded-full border border-primary-800 text-primary-800 dark:text-primary-300 dark:border-primary-600 hover:bg-primary-800 hover:text-white transition-colors"
                >
                  {e.name}
                </button>
              ))}
            </div>
          )}

          {step?.type === 'select' && step.field === 'paymentTerms' && (
            <div className="flex flex-wrap gap-2">
              {step.options.map(o => (
                <button
                  key={o}
                  onClick={() => handleSelect(o)}
                  className="px-3 py-1.5 text-sm rounded-full border border-primary-800 text-primary-800 dark:text-primary-300 dark:border-primary-600 hover:bg-primary-800 hover:text-white transition-colors"
                >
                  {o}
                </button>
              ))}
            </div>
          )}

          {/* File upload */}
          {step?.type === 'file' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-800 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-800 transition-colors"
              >
                <Paperclip className="w-4 h-4" />
                {file ? file.name : 'Choose file (PDF, JPG, PNG, XLS)'}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.xls,.xlsx"
                className="hidden"
                onChange={e => setFile(e.target.files[0])}
              />
              {file && (
                <button
                  onClick={() => advance(step.field, file, file.name)}
                  className="px-4 py-2 bg-primary-800 text-white rounded-xl text-sm hover:bg-primary-700 transition-colors"
                >
                  Attach
                </button>
              )}
            </div>
          )}

          {/* Text / number / date input */}
          {(step?.type === 'text' || step?.type === 'number' || step?.type === 'date') && (
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type={step.type === 'number' ? 'number' : step.type === 'date' ? 'date' : 'text'}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder={step.placeholder || ''}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-800 text-sm"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() && !step.optional}
                className="p-2.5 bg-primary-800 text-white rounded-xl hover:bg-primary-700 disabled:opacity-40 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Skip button for optional fields */}
          {step?.optional && step.type !== 'file' && (
            <button onClick={skip} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <SkipForward className="w-3 h-3" /> Skip this
            </button>
          )}
          {step?.type === 'file' && step.optional && !file && (
            <button onClick={skip} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <SkipForward className="w-3 h-3" /> Skip – no attachment
            </button>
          )}
        </div>
      )}

      {/* Final confirm buttons */}
      {done && !submitting && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex gap-3">
          <button
            onClick={() => submitPayment(true)}
            className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Save as Draft
          </button>
          <button
            onClick={() => submitPayment(false)}
            className="flex-1 py-2.5 rounded-xl bg-primary-800 text-white text-sm font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" /> Submit for Approval
          </button>
        </div>
      )}

      {submitting && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 text-center text-sm text-gray-500 animate-pulse">
          Processing…
        </div>
      )}
    </div>
  );
}
