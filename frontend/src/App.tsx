import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import RoleSelectionPage from './pages/auth/RoleSelectionPage';
import AuthPage from './pages/auth/AuthPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import JobSeekerDashboard from './pages/jobseeker/Dashboard';
import EmployerDashboard from './pages/employer/Dashboard';
import TermsPage from "./pages/legal/TermsPage"
import PrivacyPage from "./pages/legal/PrivacyPage"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes without layout */}
        <Route path="/" element={<RoleSelectionPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/legal/terms" element={<TermsPage />} />
        <Route path="/legal/privacy" element={<PrivacyPage />} />

        {/* Protected routes with layout */}
        <Route path="/" element={<MainLayout />}>
          <Route path="/jobseeker/dashboard" element={<JobSeekerDashboard />} />
          <Route path="/employer/dashboard" element={<EmployerDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
