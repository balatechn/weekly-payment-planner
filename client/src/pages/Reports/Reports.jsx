import { useState } from 'react';
import { Download, FileBarChart, Calendar } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function Reports() {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('entity-wise');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [forecastParams, setForecastParams] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      let url = '';
      let filename = '';

      if (reportType === 'entity-wise') {
        const params = new URLSearchParams();
        if (dateRange.startDate) params.append('startDate', dateRange.startDate);
        if (dateRange.endDate) params.append('endDate', dateRange.endDate);
        url = `/reports/entity-wise?${params.toString()}`;
        filename = 'entity-wise-report.xlsx';
      } else if (reportType === 'vendor-wise') {
        const params = new URLSearchParams();
        if (dateRange.startDate) params.append('startDate', dateRange.startDate);
        if (dateRange.endDate) params.append('endDate', dateRange.endDate);
        url = `/reports/vendor-wise?${params.toString()}`;
        filename = 'vendor-wise-report.xlsx';
      } else if (reportType === 'monthly-forecast') {
        url = `/reports/monthly-forecast?month=${forecastParams.month}&year=${forecastParams.year}`;
        filename = `forecast-${forecastParams.month}-${forecastParams.year}.xlsx`;
      }

      const response = await api.get(url, { responseType: 'blob' });
      
      const blob = new Blob([response.data]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();

      toast.success('Report downloaded successfully');
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Generate and download payment reports
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Selection */}
        <div className="lg:col-span-2 card">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Generate Report
          </h2>

          <div className="space-y-6">
            {/* Report Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Report Type
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="input"
              >
                <option value="entity-wise">Entity-wise Payment Report</option>
                <option value="vendor-wise">Vendor-wise Payment Report</option>
                <option value="monthly-forecast">Monthly Payment Forecast</option>
              </select>
            </div>

            {/* Date Range (for entity-wise and vendor-wise) */}
            {(reportType === 'entity-wise' || reportType === 'vendor-wise') && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
            )}

            {/* Month/Year (for forecast) */}
            {reportType === 'monthly-forecast' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Month
                  </label>
                  <select
                    value={forecastParams.month}
                    onChange={(e) => setForecastParams({ ...forecastParams, month: parseInt(e.target.value) })}
                    className="input"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={month}>
                        {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Year
                  </label>
                  <select
                    value={forecastParams.year}
                    onChange={(e) => setForecastParams({ ...forecastParams, year: parseInt(e.target.value) })}
                    className="input"
                  >
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="btn btn-primary flex items-center space-x-2 w-full"
            >
              <Download className="w-5 h-5" />
              <span>{loading ? 'Generating...' : 'Generate & Download Report'}</span>
            </button>
          </div>
        </div>

        {/* Report Info */}
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <FileBarChart className="w-6 h-6 text-primary-800 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">
                  Available Reports
                </h3>
              </div>
            </div>

            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Entity-wise payment breakdown with totals</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Vendor-wise payment summary and analysis</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Monthly payment forecast and planning</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>All reports exported in Excel format</span>
              </li>
            </ul>
          </div>

          <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1" />
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  Date Range
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-400">
                  Leave date fields empty to generate reports for all time periods.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
