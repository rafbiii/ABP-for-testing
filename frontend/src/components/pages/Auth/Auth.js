import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiAlertCircle, FiCheckCircle, FiInfo } from 'react-icons/fi';
import Navbar from '../../common/Navbar/Navbar';
import { authService } from '../../../services/AuthService';
import { initializeTheme } from '../../../services/themeUtils';
import './Auth.css';

function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLogin = location.pathname === '/login';
  
  useEffect(() => {
      initializeTheme();
    }, []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    fullname: ''
  });
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    fullname: ''
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    confirmPassword: false,
    username: false,
    fullname: false
  });

  // Validasi real-time untuk setiap field
  const validateField = (name, value) => {
    let errorMessage = '';

    switch (name) {
      case 'username':
        if (!isLogin) {
          if (value.length > 0 && value.length < 8) {
            errorMessage = 'Username must be at least 8 characters';
          } else if (value.length > 16) {
            errorMessage = 'Username must not exceed 16 characters';
          } else if (value.length > 0 && !/^[a-zA-Z0-9]+$/.test(value)) {
            errorMessage = 'Username must only contain letters and numbers';
          }
        }
        break;

      case 'fullname':
        if (!isLogin) {
          if (value.length > 0 && value.length < 4) {
            errorMessage = 'Full name must be at least 4 characters';
          } else if (value.length > 32) {
            errorMessage = 'Full name must not exceed 32 characters';
          } else if (value.length > 0 && !/^[a-zA-Z\s]+$/.test(value)) {
            errorMessage = 'Full name must only contain letters';
          }
        }
        break;

      case 'email':
        if (value.length > 0) {
          const emailRegex = /^[a-zA-Z0-9._]+@[a-z]+\.[a-z]+$/;
          if (!emailRegex.test(value)) {
            errorMessage = 'Invalid email format (e.g., user@example.com)';
          }
        }
        break;

      case 'password':
        if (value.length > 0 && value.length < 8) {
          errorMessage = 'Password must be at least 8 characters';
        } else if (value.length > 16) {
          errorMessage = 'Password must not exceed 16 characters';
        } else if (value.length >= 8) {
          if (!/[a-z]/.test(value)) {
            errorMessage = 'Password must contain at least 1 lowercase letter';
          } else if (!/[A-Z]/.test(value)) {
            errorMessage = 'Password must contain at least 1 uppercase letter';
          } else if (!/[0-9]/.test(value)) {
            errorMessage = 'Password must contain at least 1 number';
          } else if (/[^a-zA-Z0-9]/.test(value)) {
            errorMessage = 'Password must not contain symbols';
          }
        }
        break;

      case 'confirmPassword':
        if (!isLogin && value.length > 0 && value !== formData.password) {
          errorMessage = 'Passwords do not match';
        }
        break;

      default:
        break;
    }

    return errorMessage;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });

    // Validasi real-time hanya jika field sudah pernah di-touch
    if (touched[name]) {
      const errorMessage = validateField(name, value);
      setFieldErrors({
        ...fieldErrors,
        [name]: errorMessage
      });
    }

    // Clear general error when user starts typing
    if (error) setError('');
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    // Tandai field sebagai touched
    setTouched({
      ...touched,
      [name]: true
    });

    // Validasi field saat blur
    const errorMessage = validateField(name, value);
    setFieldErrors({
      ...fieldErrors,
      [name]: errorMessage
    });
  };

  // Validasi ulang confirmPassword saat password berubah
  useEffect(() => {
    if (!isLogin && touched.confirmPassword && formData.confirmPassword) {
      const errorMessage = validateField('confirmPassword', formData.confirmPassword);
      setFieldErrors(prev => ({
        ...prev,
        confirmPassword: errorMessage
      }));
    }
  }, [formData.password, formData.confirmPassword, touched.confirmPassword, isLogin]);

  // Validasi form sebelum submit
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (isLogin) {
      // Login validation
      const emailError = validateField('email', formData.email);
      const passwordError = validateField('password', formData.password);

      if (!formData.email) {
        errors.email = 'Email is required';
        isValid = false;
      } else if (emailError) {
        errors.email = emailError;
        isValid = false;
      }

      if (!formData.password) {
        errors.password = 'Password is required';
        isValid = false;
      } else if (passwordError) {
        errors.password = passwordError;
        isValid = false;
      }
    } else {
      // Registration validation
      const usernameError = validateField('username', formData.username);
      const fullnameError = validateField('fullname', formData.fullname);
      const emailError = validateField('email', formData.email);
      const passwordError = validateField('password', formData.password);
      const confirmPasswordError = validateField('confirmPassword', formData.confirmPassword);

      if (!formData.username) {
        errors.username = 'Username is required';
        isValid = false;
      } else if (usernameError) {
        errors.username = usernameError;
        isValid = false;
      }

      if (!formData.fullname) {
        errors.fullname = 'Full name is required';
        isValid = false;
      } else if (fullnameError) {
        errors.fullname = fullnameError;
        isValid = false;
      }

      if (!formData.email) {
        errors.email = 'Email is required';
        isValid = false;
      } else if (emailError) {
        errors.email = emailError;
        isValid = false;
      }

      if (!formData.password) {
        errors.password = 'Password is required';
        isValid = false;
      } else if (passwordError) {
        errors.password = passwordError;
        isValid = false;
      }

      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
        isValid = false;
      } else if (confirmPasswordError) {
        errors.confirmPassword = confirmPasswordError;
        isValid = false;
      }
    }

    setFieldErrors(errors);
    setTouched({
      email: true,
      password: true,
      confirmPassword: true,
      username: true,
      fullname: true
    });

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validasi frontend
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // Login
        const response = await authService.login({
          email: formData.email,
          password: formData.password
        });

        navigate('/main');
      } else {
        // Register - sesuai dengan API format
        const response = await authService.register({
          username: formData.username,
          fullname: formData.fullname,
          email: formData.email,
          password: formData.password
        });

        // Show success modal
        setShowSuccessModal(true);
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          setShowSuccessModal(false);
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="grid-background"></div>
      <div className="bg-shape-1"></div>
      <div className="bg-shape-2"></div>
      <div className="bg-shape-3"></div>

      <Navbar showBack={true} onBackClick={() => navigate('/')} />

      <div className="container">
        <div className="auth-container">
          <div className="auth-card">
            <h2 className="auth-title">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="auth-subtitle">
              {isLogin 
                ? 'Sign in to continue to Retogen' 
                : 'Join our community of honest reviewers'}
            </p>

            {error && (
              <div className="error-banner">
                <FiAlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              {!isLogin && (
                <>
                  <div className="form-group">
                    <label className="form-label">
                      Username
                      <div className="info-tooltip">
                        <FiInfo size={16} className="info-icon" />
                        <div className="tooltip-content">
                          <strong>Username Requirements:</strong>
                          <ul>
                            <li>8-16 characters</li>
                            <li>Only letters and numbers</li>
                            <li>No symbols or spaces</li>
                          </ul>
                        </div>
                      </div>
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`form-input ${fieldErrors.username && touched.username ? 'input-error' : ''}`}
                      placeholder="Choose a username"
                      disabled={loading}
                    />
                    {fieldErrors.username && touched.username && (
                      <div className="field-error">
                        <FiAlertCircle size={14} />
                        <span>{fieldErrors.username}</span>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Full Name
                      <div className="info-tooltip">
                        <FiInfo size={16} className="info-icon" />
                        <div className="tooltip-content">
                          <strong>Full Name Requirements:</strong>
                          <ul>
                            <li>4-32 characters</li>
                            <li>Only letters and spaces</li>
                          </ul>
                        </div>
                      </div>
                    </label>
                    <input
                      type="text"
                      name="fullname"
                      value={formData.fullname}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`form-input ${fieldErrors.fullname && touched.fullname ? 'input-error' : ''}`}
                      placeholder="Your full name"
                      disabled={loading}
                    />
                    {fieldErrors.fullname && touched.fullname && (
                      <div className="field-error">
                        <FiAlertCircle size={14} />
                        <span>{fieldErrors.fullname}</span>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="form-label">
                  Email
                  {!isLogin && (
                    <div className="info-tooltip">
                      <FiInfo size={16} className="info-icon" />
                      <div className="tooltip-content">
                        <strong>Email Requirements:</strong>
                        <ul>
                          <li>Must contain @ symbol</li>
                          <li>Valid format (e.g., user@example.com)</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-input ${fieldErrors.email && touched.email ? 'input-error' : ''}`}
                  placeholder="your@email.com"
                  disabled={loading}
                />
                {fieldErrors.email && touched.email && (
                  <div className="field-error">
                    <FiAlertCircle size={14} />
                    <span>{fieldErrors.email}</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Password
                  {!isLogin && (
                    <div className="info-tooltip">
                      <FiInfo size={16} className="info-icon" />
                      <div className="tooltip-content">
                        <strong>Password Requirements:</strong>
                        <ul>
                          <li>8-16 characters</li>
                          <li>At least 1 lowercase letter</li>
                          <li>At least 1 uppercase letter</li>
                          <li>At least 1 number</li>
                          <li>No symbols allowed</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-input ${fieldErrors.password && touched.password ? 'input-error' : ''}`}
                  placeholder="Enter your password"
                  disabled={loading}
                />
                {fieldErrors.password && touched.password && (
                  <div className="field-error">
                    <FiAlertCircle size={14} />
                    <span>{fieldErrors.password}</span>
                  </div>
                )}
              </div>

              {!isLogin && (
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`form-input ${fieldErrors.confirmPassword && touched.confirmPassword ? 'input-error' : ''}`}
                    placeholder="Confirm your password"
                    disabled={loading}
                  />
                  {fieldErrors.confirmPassword && touched.confirmPassword && (
                    <div className="field-error">
                      <FiAlertCircle size={14} />
                      <span>{fieldErrors.confirmPassword}</span>
                    </div>
                  )}
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-register auth-submit"
                disabled={loading}
              >
                {loading ? (
                  isLogin ? 'Signing in' : 'Creating account'
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <div className="auth-switch">
              {isLogin ? (
                <p>
                  Don't have an account?{' '}
                  <span 
                    className="auth-link" 
                    onClick={() => !loading && navigate('/register')}
                  >
                    Sign up
                  </span>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <span 
                    className="auth-link" 
                    onClick={() => !loading && navigate('/login')}
                  >
                    Sign in
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="success-modal">
            <FiCheckCircle size={64} color="#00ced1" />
            <h3>Account Created!</h3>
            <p>Redirecting to login page...</p>
          </div>
        </div>
      )}
    </>
  );
}

export default Auth;