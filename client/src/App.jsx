import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
};

// Placeholder components until defined
const AdminPlaceholder = () => <AdminDashboard />;
const EmployeePlaceholder = () => <EmployeeDashboard />;

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={
            <ProtectedRoute role="ADMIN">
              <AdminPlaceholder />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              {/* Logic to redirect based on role is better handled inside a dashboard wrapper or here */}
              <DashboardRedirect />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

const DashboardRedirect = () => {
  const { user } = useAuth();
  if (user.role === 'ADMIN') return <Navigate to="/admin" />;
  return <EmployeePlaceholder />;
}

export default App;
