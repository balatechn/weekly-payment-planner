import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, Save, Send } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function PaymentForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    entityId: '',
    vendorName: '',
    natureOfExpense: '',
    invoiceNumber: '',
    invoiceDate: '',
    invoiceAmount: '',
    gstAmount: '',
    dueDate: '',
    paymentTerms: 'Final Invoice',
    remarks: '',
  });

  useEffect(() => {
    fetchEntities();
    if (isEdit) {
      fetchPayment();
    }
  }, [id]);

  const fetchEntities = async () => {
    try {
      const response = await api.get('/entities?isActive=true');
      setEntities(response.data);
    } catch (error) {
      toast.error('Failed to load entities');
    }
  };

  const fetchPayment = async () => {
    try {
      const response = await api.get(`/payments/${id}`);
      const payment = response.data;
      
      setFormData({
        entityId: payment.entityId,
        vendorName: payment.vendorName,
        natureOfExpense: payment.natureOfExpense,
        invoiceNumber: payment.invoiceNumber,
        invoiceDate: payment.invoiceDate,
        invoiceAmount: payment.invoiceAmount,
        gstAmount: payment.gstAmount,
        dueDate: payment.dueDate,
        paymentTerms: payment.paymentTerms,
        remarks: payment.remarks || '',
      });
    } catch (error) {
      toast.error('Failed to load payment');
      navigate('/payments');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e, saveAsDraft = false) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });

      if (file) {
        data.append('attachment', file);
      }

      if (isEdit) {
        await api.put(`/payments/${id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Payment updated successfully');
      } else {
        const response = await api.post('/payments', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (!saveAsDraft) {
          await api.post(`/payments/${response.data.id}/submit`);
          toast.success('Payment request submitted successfully');
        } else {
          toast.success('Payment saved as draft');
        }
      }

      navigate('/payments');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save payment');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = (parseFloat(formData.invoiceAmount) || 0) + (parseFloat(formData.gstAmount) || 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/payments')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isEdit ? 'Edit Payment Request' : 'New Payment Request'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Fill in the payment details below
          </p>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Entity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Entity <span className="text-red-500">*</span>
            </label>
            <select
              name="entityId"
              value={formData.entityId}
              onChange={handleChange}
              required
              className="input"
            >
              <option value="">Select Entity</option>
              {entities.map((entity) => (
                <option key={entity.id} value={entity.id}>
                  {entity.name}
                </option>
              ))}
            </select>
          </div>

          {/* Vendor Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Vendor / Payee Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="vendorName"
              value={formData.vendorName}
              onChange={handleChange}
              required
              className="input"
              placeholder="ABC Contractors Pvt Ltd"
            />
          </div>

          {/* Nature of Expense */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nature of Expense <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="natureOfExpense"
              value={formData.natureOfExpense}
              onChange={handleChange}
              required
              className="input"
              placeholder="Civil Work - Tower B"
            />
          </div>

          {/* Invoice Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Invoice Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={handleChange}
              required
              className="input"
              placeholder="INV-245"
            />
          </div>

          {/* Invoice Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Invoice Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="invoiceDate"
              value={formData.invoiceDate}
              onChange={handleChange}
              required
              className="input"
            />
          </div>

          {/* Invoice Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Invoice Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              name="invoiceAmount"
              value={formData.invoiceAmount}
              onChange={handleChange}
              required
              className="input"
              placeholder="50000"
            />
          </div>

          {/* GST Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              GST Amount
            </label>
            <input
              type="number"
              step="0.01"
              name="gstAmount"
              value={formData.gstAmount}
              onChange={handleChange}
              className="input"
              placeholder="9000"
            />
          </div>

          {/* Total Amount (Auto-calculated) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Total Amount (Auto-calculated)
            </label>
            <input
              type="text"
              value={`₹${totalAmount.toLocaleString('en-IN')}`}
              readOnly
              className="input bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
              className="input"
            />
          </div>

          {/* Payment Terms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Terms <span className="text-red-500">*</span>
            </label>
            <select
              name="paymentTerms"
              value={formData.paymentTerms}
              onChange={handleChange}
              required
              className="input"
            >
              <option value="Advance">Advance</option>
              <option value="Part Payment">Part Payment</option>
              <option value="Final Invoice">Final Invoice</option>
              <option value="Retention">Retention</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          {/* Attachment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Attachment (PDF, JPG, PNG, XLS)
            </label>
            <div className="flex items-center space-x-2">
              <label className="flex-1 cursor-pointer">
                <div className="input flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    {file ? file.name : 'Choose file...'}
                  </span>
                  <Upload className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.xls,.xlsx"
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Remarks */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Remarks
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows={3}
              className="input"
              placeholder="Additional notes or comments..."
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => navigate('/payments')}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          
          {!isEdit && (
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              className="btn btn-secondary flex items-center space-x-2"
              disabled={loading}
            >
              <Save className="w-5 h-5" />
              <span>Save as Draft</span>
            </button>
          )}

          <button
            type="submit"
            className="btn btn-primary flex items-center space-x-2"
            disabled={loading}
          >
            {isEdit ? <Save className="w-5 h-5" /> : <Send className="w-5 h-5" />}
            <span>{loading ? 'Processing...' : isEdit ? 'Update' : 'Submit'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
