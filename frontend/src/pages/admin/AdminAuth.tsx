import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { FiUser, FiEye } from 'react-icons/fi';
import { HiShieldCheck, HiLockClosed, HiEyeOff } from 'react-icons/hi';
import { AdminFormData } from '../../types/admin';
import './AdminAuth.css';

interface AdminAuthProps {}

const AdminAuth: React.FC<AdminAuthProps> = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AdminFormData>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // First authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const firebaseUser = userCredential.user;
      
      // Get Firebase ID token
      const idToken = await firebaseUser.getIdToken();
      
      // Then verify admin privileges with backend
      const response = await fetch('http://localhost:3001/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({})
      });

      const data = await response.json();

      if (data.success) {
        // Store admin data and token
        localStorage.setItem('adminUser', JSON.stringify(data.admin));
        localStorage.setItem('adminToken', idToken);
        
        // Navigate to appropriate dashboard
        if (data.admin.role === 'superadmin') {
          navigate('/superadmin/dashboard');
        } else {
          navigate('/admin/dashboard');
        }
      } else {
        setError(data.message || 'Access denied. Admin privileges required.');
      }
    } catch (error: any) {
      console.error('Admin login error:', error);
      if (error.code === 'auth/user-not-found') {
        setError('Admin account not found.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Invalid password.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email format.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-container">
      <div className="admin-auth-background">
        <div className="admin-auth-overlay"></div>
      </div>
      
      <div className="admin-auth-content">
        <div className="admin-auth-card">
          <div className="admin-auth-header">
            <div className="admin-logo">
              <HiShieldCheck className="shield-icon" />
            </div>
            <h1>PESO Admin Portal</h1>
            <p>Secure administrative access</p>
          </div>

          <form onSubmit={handleSubmit} className="admin-auth-form">
            {error && (
              <div className="error-message">
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Admin Email</label>
              <div className="input-wrapper">
                <FiUser className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your admin email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <HiLockClosed className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <HiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>


            <button
              type="submit"
              className="admin-login-btn"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Access Admin Portal'}
            </button>
          </form>

          <div className="admin-auth-footer">
            <p>Authorized personnel only</p>
            <button 
              type="button" 
              className="back-link"
              onClick={() => navigate('/')}
            >
              ← Back to Main Site
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;
