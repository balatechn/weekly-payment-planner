import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  DollarSign,
  AlertCircle,
  TrendingUp,
  Plus
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [summaryRes, paymentsRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/dashboard/recent-payments?limit=5')
      ]);

      setSummary(summaryRes.data);
      setRecentPayments(paymentsRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const stats = summary ? [
    {
      name: 'Total Requests',
      value: summary.totalRequests,
      icon: FileText,
      color: 'bg-blue-500',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      name: 'Total Amount',
      value: `₹${parseFloat(summary.totalAmount).toLocaleString('en-IN')}`,
      icon: DollarSign,
      color: 'bg-green-500',
      textColor: 'text-green-600 dark:text-green-400'
    },
    {
      name: 'Pending Approval',
      value: summary.pendingApproval,
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600 dark:text-yellow-400'
    },
    {
      name: 'Approved',
      value: summary.approved,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600 dark:text-green-400'
    },
    {
      name: 'Rejected',
      value: summary.rejected,
      icon: XCircle,
      color: 'bg-red-500',
      textColor: 'text-red-600 dark:text-red-400'
    },
    {
      name: 'Overdue',
      value: summary.overduePayments,
      icon: AlertCircle,
      color: 'bg-red-500',
      textColor: 'text-red-600 dark:text-red-400'
    },
    {
      name: 'Upcoming (7 days)',
      value: summary.upcomingPayments,
      icon: TrendingUp,
      color: 'bg-purple-500',
      textColor: 'text-purple-600 dark:text-purple-400'
    },
  ] : [];

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Overview of payment requests</p>
        </div>
        <button
          onClick={() => navigate('/payments/new')}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>New Payment Request</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.name}</p>
                <p className={`text-2xl font-bold mt-2 ${stat.textColor}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Payments */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Payments</h2>
          <button
            onClick={() => navigate('/payments')}
            className="text-primary-800 hover:text-primary-700 font-medium text-sm"
          >
            View All →
          </button>
        </div>

        {recentPayments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No payment requests yet
          </p>
        ) : (
          <div className="overflow-x-auto">
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
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {recentPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    onClick={() => navigate(`/payments/${payment.id}`)}
                    className="table-row cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      ₹{parseFloat(payment.totalAmount).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(payment.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${getStatusBadge(payment.status)}`}>
                        {payment.status.replace('_', ' ').toUpperCase()}
                      </span>
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
