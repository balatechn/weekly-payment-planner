import { useEffect, useState } from 'react';
import { Mail, Send, Eye } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function EmailHistory() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchEmailHistory();
  }, []);

  const fetchEmailHistory = async () => {
    try {
      const response = await api.get('/emails/history');
      setEmails(response.data.emails);
    } catch (error) {
      toast.error('Failed to load email history');
    } finally {
      setLoading(false);
    }
  };

  const handleSendWeeklyEmail = async () => {
    if (!confirm('Are you sure you want to send the weekly payment schedule email?')) {
      return;
    }

    setSending(true);
    try {
      await api.post('/emails/send-weekly');
      toast.success('Weekly email sent successfully');
      fetchEmailHistory();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const viewEmail = async (emailId) => {
    try {
      const response = await api.get(`/emails/history/${emailId}`);
      setSelectedEmail(response.data);
      setShowEmailModal(true);
    } catch (error) {
      toast.error('Failed to load email details');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Email History</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View sent payment schedule emails
          </p>
        </div>
        <button
          onClick={handleSendWeeklyEmail}
          disabled={sending}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Send className="w-5 h-5" />
          <span>{sending ? 'Sending...' : 'Send Weekly Email'}</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
          Loading email history...
        </div>
      ) : emails.length === 0 ? (
        <div className="card text-center py-12">
          <Mail className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No emails sent yet
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Week
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Payments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Sent At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {emails.map((email) => (
                  <tr key={email.id} className="table-row">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {email.subject}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {email.weekStartDate && email.weekEndDate ? (
                        <>
                          {new Date(email.weekStartDate).toLocaleDateString()} - {new Date(email.weekEndDate).toLocaleDateString()}
                        </>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {email.paymentCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {email.totalAmount ? `₹${parseFloat(email.totalAmount).toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(email.sentAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${email.status === 'sent' ? 'badge-success' : 'badge-danger'}`}>
                        {email.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => viewEmail(email.id)}
                        className="text-primary-800 hover:text-primary-700 font-medium flex items-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Email Preview Modal */}
      {showEmailModal && selectedEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Email Preview
              </h3>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Subject:</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedEmail.subject}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Recipients:</p>
                <p className="text-gray-900 dark:text-white">{selectedEmail.recipients}</p>
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900 max-h-96 overflow-y-auto">
              <div dangerouslySetInnerHTML={{ __html: selectedEmail.body }} />
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowEmailModal(false)}
                className="btn btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
