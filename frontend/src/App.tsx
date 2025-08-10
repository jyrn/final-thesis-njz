import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import RoleSelectionPage from './pages/auth/RoleSelectionPage';
import AuthPage from './pages/auth/AuthPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import JobSeekerDashboard from './pages/jobseeker/Dashboard';
import EmployerDashboard from './pages/employer/Dashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public auth routes */}
          <Route path="/" element={<RoleSelectionPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          
          {/* Protected routes with layout */}
          <Route path="/" element={<MainLayout />}>
            <Route 
              path="/jobseeker/dashboard" 
              element={
                <ProtectedRoute requiredRole="job_seeker">
                  <JobSeekerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/employer/dashboard" 
              element={
                <ProtectedRoute requiredRole="employer">
                  <EmployerDashboard />
                </ProtectedRoute>
              } 
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
