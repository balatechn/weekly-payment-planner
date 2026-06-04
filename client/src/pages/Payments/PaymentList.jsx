import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Download } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function PaymentList() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    entityId: '',
    status: '',
    vendorName: '',
  });

  useEffect(() => {
    fetchPayments();
    fetchEntities();
  }, [filters]);

  const fetchPayments = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await api.get(`/payments?${params.toString()}`);
      setPayments(response.data.payments);
    } catch (error) {
      toast.error('Failed to load payments');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEntities = async () => {
    try {
      const response = await api.get('/entities?isActive=true');
      setEntities(response.data);
    } catch (error) {
      console.error('Failed to load entities:', error);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'badge-gray',
      submitted: 'badge-info',
      under_review: 'badge-warning',
      approved: 'badge-success',
      rejected: 'badge-danger',
      paid: 'badge-success',
    };
    return badges[status] || 'badge-gray';
  };

  const isOverdue = (dueDate, status) => {
    return new Date(dueDate) < new Date() && !['paid', 'rejected'].includes(status);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payment Requests</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all payment requests</p>
        </div>
        <button
          onClick={() => navigate('/payments/new')}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>New Payment</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Entity
            </label>
            <select
              value={filters.entityId}
              onChange={(e) => setFilters({ ...filters, entityId: e.target.value })}
              className="input"
            >
              <option value="">All Entities</option>
              {entities.map((entity) => (
                <option key={entity.id} value={entity.id}>
                  {entity.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="input"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Vendor Name
            </label>
            <input
              type="text"
              value={filters.vendorName}
              onChange={(e) => setFilters({ ...filters, vendorName: e.target.value })}
              placeholder="Search vendor..."
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="card">
        {loading ? (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            Loading payments...
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No payment requests found
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Entity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Due Date
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
                {payments.map((payment) => (
                  <tr key={payment.id} className="table-row">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {payment.vendorName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {payment.natureOfExpense}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {payment.entity?.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {payment.invoiceNumber}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(payment.invoiceDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      ₹{parseFloat(payment.totalAmount).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${isOverdue(payment.dueDate, payment.status) ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-900 dark:text-white'}`}>
                        {new Date(payment.dueDate).toLocaleDateString()}
                      </div>
                      {isOverdue(payment.dueDate, payment.status) && (
                        <div className="text-xs text-red-600 dark:text-red-400">Overdue</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${getStatusBadge(payment.status)}`}>
                        {payment.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => navigate(`/payments/${payment.id}`)}
                        className="text-primary-800 hover:text-primary-700 font-medium"
                      >
                        View Details
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
  );
}
