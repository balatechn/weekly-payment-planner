import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Download, Trash2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';

export default function PaymentDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const user = useAuthStore((state) => state.user);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayment();
  }, [id]);

  const fetchPayment = async () => {
    try {
      const response = await api.get(`/payments/${id}`);
      setPayment(response.data);
    } catch (error) {
      toast.error('Failed to load payment details');
      navigate('/payments');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this payment request?')) {
      return;
    }

    try {
      await api.delete(`/payments/${id}`);
      toast.success('Payment deleted successfully');
      navigate('/payments');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete payment');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: { class: 'badge-gray', text: 'Draft' },
      submitted: { class: 'badge-info', text: 'Submitted' },
      under_review: { class: 'badge-warning', text: 'Under Review' },
      approved: { class: 'badge-success', text: 'Approved' },
      rejected: { class: 'badge-danger', text: 'Rejected' },
      paid: { class: 'badge-success', text: 'Paid' },
    };
    return badges[status] || badges.draft;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading payment details...</div>
      </div>
    );
  }

  if (!payment) {
    return null;
  }

  const statusBadge = getStatusBadge(payment.status);
  const canEdit = user?.role !== 'department_user' || 
                  (payment.userId === user?.id && payment.status === 'draft');
  const canDelete = user?.role !== 'department_user' || 
                    (payment.userId === user?.id && payment.status === 'draft');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/payments')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Payment Details
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {payment.invoiceNumber}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {canEdit && (
            <button
              onClick={() => navigate(`/payments/${id}/edit`)}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <Edit className="w-5 h-5" />
              <span>Edit</span>
            </button>
          )}
          {canDelete && (
            <button
              onClick={handleDelete}
              className="btn btn-danger flex items-center space-x-2"
            >
              <Trash2 className="w-5 h-5" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Payment Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Payment Information
              </h2>
              <span className={`badge ${statusBadge.class}`}>
                {statusBadge.text}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Entity</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                  {payment.entity?.name}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Vendor / Payee</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                  {payment.vendorName}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Nature of Expense</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                  {payment.natureOfExpense}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Payment Terms</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                  {payment.paymentTerms}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Invoice Number</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                  {payment.invoiceNumber}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Invoice Date</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                  {new Date(payment.invoiceDate).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Due Date</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                  {new Date(payment.dueDate).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Created By</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                  {payment.user?.name}
                </p>
              </div>
            </div>

            {payment.remarks && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Remarks</p>
                <p className="text-gray-900 dark:text-white">{payment.remarks}</p>
              </div>
            )}

            {payment.rejectionReason && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm font-semibold text-red-900 dark:text-red-300 mb-2">Rejection Reason</p>
                <p className="text-red-800 dark:text-red-400">{payment.rejectionReason}</p>
              </div>
            )}
          </div>

          {/* Approval History */}
          {payment.approvals && payment.approvals.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Approval History
              </h2>

              <div className="space-y-4">
                {payment.approvals.map((approval, index) => (
                  <div
                    key={approval.id}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {approval.approver?.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {approval.stage.toUpperCase()} - {approval.status.toUpperCase()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(approval.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {approval.comments && (
                      <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        {approval.comments}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Amount Summary */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Amount Summary
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Invoice Amount</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  ₹{parseFloat(payment.invoiceAmount).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">GST Amount</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  ₹{parseFloat(payment.gstAmount).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">Total Amount</span>
                  <span className="text-lg font-bold text-primary-800 dark:text-primary-400">
                    ₹{parseFloat(payment.totalAmount).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {payment.attachment && (
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Attachment
              </h2>
              <a
                href={`/uploads/${payment.attachment}`}
                download
                className="flex items-center justify-center space-x-2 btn btn-secondary w-full"
              >
                <Download className="w-5 h-5" />
                <span>Download File</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
