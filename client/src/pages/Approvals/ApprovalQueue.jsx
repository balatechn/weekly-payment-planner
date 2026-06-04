import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ApprovalQueue() {
  const navigate = useNavigate();
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [actionType, setActionType] = useState('approve');
  const [comments, setComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      const response = await api.get('/approvals/pending');
      setPendingApprovals(response.data);
    } catch (error) {
      toast.error('Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      await api.post(`/approvals/${selectedPayment.id}/approve`, { comments });
      toast.success('Payment approved successfully');
      setShowApprovalModal(false);
      setComments('');
      fetchPendingApprovals();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to approve payment');
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      await api.post(`/approvals/${selectedPayment.id}/reject`, {
        comments,
        rejectionReason
      });
      toast.success('Payment rejected');
      setShowApprovalModal(false);
      setComments('');
      setRejectionReason('');
      fetchPendingApprovals();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reject payment');
    }
  };

  const openApprovalModal = (payment, action) => {
    setSelectedPayment(payment);
    setActionType(action);
    setShowApprovalModal(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Approval Queue</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Review and approve pending payment requests
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
          Loading pending approvals...
        </div>
      ) : pendingApprovals.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No pending approvals at the moment
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {pendingApprovals.map((payment) => (
            <div key={payment.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {payment.vendorName}
                    </h3>
                    <span className="badge badge-warning">
                      {payment.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Entity</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {payment.entity?.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Invoice</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {payment.invoiceNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Amount</p>
                      <p className="font-bold text-primary-800 dark:text-primary-400">
                        ₹{parseFloat(payment.totalAmount).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Due Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(payment.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Nature of Expense
                    </p>
                    <p className="text-gray-900 dark:text-white">{payment.natureOfExpense}</p>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>Requested by: {payment.user?.name}</span>
                    <span>•</span>
                    <span>{new Date(payment.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    onClick={() => navigate(`/payments/${payment.id}`)}
                    className="btn btn-secondary flex items-center space-x-2 whitespace-nowrap"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </button>
                  <button
                    onClick={() => openApprovalModal(payment, 'approve')}
                    className="btn btn-success flex items-center space-x-2 whitespace-nowrap"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => openApprovalModal(payment, 'reject')}
                    className="btn btn-danger flex items-center space-x-2 whitespace-nowrap"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approval/Rejection Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {actionType === 'approve' ? 'Approve Payment' : 'Reject Payment'}
            </h3>

            {actionType === 'reject' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className="input"
                  placeholder="Please provide a reason for rejection..."
                />
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Comments (Optional)
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
                className="input"
                placeholder="Add any additional comments..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setComments('');
                  setRejectionReason('');
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={actionType === 'approve' ? handleApprove : handleReject}
                className={`btn ${actionType === 'approve' ? 'btn-success' : 'btn-danger'}`}
              >
                {actionType === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
