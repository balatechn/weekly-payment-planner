import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';

// Layout
import Layout from './components/Layout/Layout';
import PrivateRoute from './components/Layout/PrivateRoute';

// Pages
import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import PaymentList from './pages/Payments/PaymentList';
import PaymentForm from './pages/Payments/PaymentForm';
import PaymentDetails from './pages/Payments/PaymentDetails';
import ApprovalQueue from './pages/Approvals/ApprovalQueue';
import Reports from './pages/Reports/Reports';
import EmailHistory from './pages/Email/EmailHistory';
import UserManagement from './pages/Admin/UserManagement';
import EntityManagement from './pages/Admin/EntityManagement';
import EmailRecipients from './pages/Admin/EmailRecipients';
import AuditLogs from './pages/Admin/AuditLogs';
import Profile from './pages/Profile/Profile';

function App() {
  return (
    <Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          <Route path="payments">
            <Route index element={<PaymentList />} />
            <Route path="new" element={<PaymentForm />} />
            <Route path=":id" element={<PaymentDetails />} />
            <Route path=":id/edit" element={<PaymentForm />} />
          </Route>
          
          <Route path="approvals" element={<ApprovalQueue />} />
          <Route path="reports" element={<Reports />} />
          <Route path="emails" element={<EmailHistory />} />
          
          <Route path="admin">
            <Route path="users" element={<UserManagement />} />
            <Route path="entities" element={<EntityManagement />} />
            <Route path="email-recipients" element={<EmailRecipients />} />
            <Route path="audit-logs" element={<AuditLogs />} />
          </Route>
          
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
