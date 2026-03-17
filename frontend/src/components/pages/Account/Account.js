import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiCalendar, FiLogOut, FiArrowLeft, FiShield, FiEdit } from 'react-icons/fi';
import Navbar from '../../common/Navbar/Navbar';
import './Account.css';
import { initializeTheme } from '../../../services/themeUtils';
import { getUserDetails } from '../../../services/UserService';

function Account() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeTheme();
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const email = '';
      
      if (!token) {
        navigate('/');
        return;
      }

      // Call UserService with email and token
      const data = await getUserDetails(email, token);

      // Handle responses
      if (data.confirmation === 'token invalid') {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        alert('Session expired. Please login again.');
        navigate('/');
        return;
      }

      if (data.confirmation === 'not admin') {
        alert("You're not authorized to view this page");
        navigate('/main');
        return;
      }

      if (data.confirmation === 'user not found') {
        setError('User not found');
        return;
      }

      if (data.confirmation === 'backend error') {
        setError('Unable to load profile. Please try again later.');
        return;
      }

      if (data.confirmation === 'successful') {
        setUser(data.user);
      }

    } catch (err) {
      console.error('Error fetching user details:', err);
      setError('Server is busy. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    navigate('/');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="main-page">
        <div className="bg-shape-1"></div>
        <div className="bg-shape-2"></div>
        <div className="bg-shape-3"></div>

        <Navbar showAccount={true} />

        <div className="container">
          <div className="loading-message">
            <h2>Loading...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <div className="bg-shape-1"></div>
        <div className="bg-shape-2"></div>
        <div className="bg-shape-3"></div>
        <Navbar showBack={true}/>
        <div className="account-back-button-container">
          <button className="account-btn-back" onClick={() => navigate('/main')}>
            <FiArrowLeft />
            <span>Back to Main</span>
          </button>
        </div>
        <div className="account-container">
          <div className="account-card error-card">
            <p className="error-message">{error}</p>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <div className="bg-shape-1"></div>
      <div className="bg-shape-2"></div>
      <div className="bg-shape-3"></div>

      <Navbar showBack={true} />

      <div className="account-back-button-container">
        <button className="account-btn-back" onClick={() => navigate('/main')}>
          <FiArrowLeft />
          <span>Back to Main</span>
        </button>
      </div>

      <div className="container">
        <div className="account-container">
          <div className="account-card">
            <div className="account-header">
              <div className="avatar">
                <FiUser />
              </div>
              <h2>{user.fullname || user.username}</h2>
              {user.username !== user.fullname && user.fullname && (
                <p className="username-subtitle">@{user.username}</p>
              )}
              {user.role === 'admin' && (
                <div className="role-badge">
                  <FiShield />
                  <span>Administrator</span>
                </div>
              )}
            </div>

            <div className="account-info">
              <div className="info-item">
                <FiUser className="info-icon" />
                <div>
                  <span className="info-label">Username</span>
                  <span className="info-value">{user.username}</span>
                </div>
              </div>

              <div className="info-item">
                <FiMail className="info-icon" />
                <div>
                  <span className="info-label">Email</span>
                  <span className="info-value">{user.email}</span>
                </div>
              </div>

              {user.fullname && (
                <div className="info-item">
                  <FiEdit className="info-icon" />
                  <div>
                    <span className="info-label">Full Name</span>
                    <span className="info-value">{user.fullname}</span>
                  </div>
                </div>
              )}

              <div className="info-item">
                <FiCalendar className="info-icon" />
                <div>
                  <span className="info-label">Member Since</span>
                  <span className="info-value">{formatDate(user.created_at)}</span>
                </div>
              </div>

              {user.updated_at && user.updated_at !== user.created_at && (
                <div className="info-item">
                  <FiCalendar className="info-icon" />
                  <div>
                    <span className="info-label">Last Updated</span>
                    <span className="info-value">{formatDate(user.updated_at)}</span>
                  </div>
                </div>
              )}
            </div>

            <button className="btn-logout" onClick={handleLogout}>
              <FiLogOut />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Account;