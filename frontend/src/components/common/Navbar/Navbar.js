import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiSun, FiMoon, FiArrowLeft, FiUser } from 'react-icons/fi';
import { toggleTheme, getCurrentTheme } from '../../../services/themeUtils';
import './Navbar.css';

function Navbar({ showBack = false, showAccount = false, onBackClick }) {
  const [theme, setTheme] = useState('light');
  const navigate = useNavigate();
  const location = useLocation();
  
  // Cek apakah sedang di halaman /account
  const isAccountPage = location.pathname === '/account';

  useEffect(() => {
    setTheme(getCurrentTheme());
  }, []);

  const handleThemeToggle = () => {
    const newTheme = toggleTheme();
    setTheme(newTheme);
  };

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-left">
          {showBack ? (
            <button className="navbar-back-btn" onClick={handleBackClick}>
              <FiArrowLeft />
              <span>Back</span>
            </button>
          ) : (
            <div className="navbar-back-placeholder"></div>
          )}
          
          <div className="navbar-logo" onClick={() => navigate('/main')} style={{ cursor: 'pointer' }}>
            <div className="navbar-icon">
              <img src="/figures/logo.png" alt="Retogen Logo" />
            </div>
            <span>Retogen</span>
          </div>
        </div>

        <div className="navbar-buttons">
          <button className="navbar-theme-toggle" onClick={handleThemeToggle}>
            {theme === 'dark' ? <FiMoon /> : <FiSun />}
          </button>

          {!isAccountPage && (
            <>
              {showAccount ? (
                <button 
                  className="navbar-btn navbar-btn-account" 
                  onClick={() => navigate('/account')}
                >
                  <FiUser />
                  <span>Account</span>
                </button>
              ) : (
                <>
                  <button 
                    className="navbar-btn navbar-btn-login" 
                    onClick={() => navigate('/login')}
                  >
                    Login
                  </button>
                  <button 
                    className="navbar-btn navbar-btn-register" 
                    onClick={() => navigate('/register')}
                  >
                    Sign Up
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;