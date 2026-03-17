import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiUser, FiMail, FiCalendar, FiShield, FiFlag } from 'react-icons/fi';
import Navbar from '../../common/Navbar/Navbar';
import GetUserProfileService from '../../../services/GetUserProfileService';
import ReportUserService from '../../../services/ReportUserService';
import { initializeTheme } from '../../../services/themeUtils';
import './UserProfile.css';

function UserProfile() {
  const navigate = useNavigate();
  const { email } = useParams();
  
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportDescription, setReportDescription] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  useEffect(() => {
    initializeTheme();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }

    fetchUserProfile(token);
  }, [email, navigate]);

  const fetchUserProfile = async (token) => {
    setIsLoading(true);
    try {
      const data = await GetUserProfileService.getUserProfile(token, email);
      
      if (data.confirmation === 'token invalid') {
        displayPopup('token invalid');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }

      if (data.confirmation === 'user not found') {
        displayPopup('user not found');
        setIsLoading(false);
        return;
      }

      if (data.confirmation === 'backend error') {
        displayPopup('server busy');
        setIsLoading(false);
        return;
      }

      if (data.confirmation === 'successful') {
        setUserProfile(data.user);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      displayPopup('server busy');
      setIsLoading(false);
    }
  };

  const displayPopup = (message) => {
    setPopupMessage(message);
    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
    }, 3000);
  };

  const openReportModal = () => {
    setShowReportModal(true);
    setReportDescription('');
  };

  const closeReportModal = () => {
    setShowReportModal(false);
    setReportDescription('');
  };

  const handleReportUser = async () => {
    // Validation: check if description is empty
    if (!reportDescription.trim()) {
      displayPopup('please fill description');
      return;
    }

    setIsSubmittingReport(true);
    const token = localStorage.getItem('token');
    
    try {
      const data = await ReportUserService.reportUser(token, email, reportDescription);
      
      // Handle token invalid
      if (data.confirmation === 'token invalid') {
        displayPopup('token invalid');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }
      
      // Handle cannot report self
      if (data.confirmation === 'cannot report self') {
        displayPopup('you cannot report yourself');
        closeReportModal();
        setIsSubmittingReport(false);
        return;
      }
      
      // Handle already reported
      if (data.confirmation === 'already reported') {
        displayPopup('you already reported this user');
        closeReportModal();
        setIsSubmittingReport(false);
        return;
      }
      
      // Handle backend error
      if (data.confirmation === 'backend error') {
        displayPopup('server busy');
        closeReportModal();
        setIsSubmittingReport(false);
        return;
      }
      
      // Handle successful report
      if (data.confirmation === 'successful: user reported') {
        displayPopup('user has been reported');
        closeReportModal();
      }
    } catch (error) {
      console.error('Error reporting user:', error);
      displayPopup('server busy');
    }
    
    setIsSubmittingReport(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (username) => {
    if (!username) return '?';
    const words = username.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return username.substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div style={{ height: '64px' }}></div>
        <Navbar showBack={true} showAccount={true} onBackClick={() => navigate(-1)} />
        <div className="user-profile-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading user profile...</p>
          </div>
        </div>
      </>
    );
  }

  if (!userProfile) {
    return (
      <>
        <Navbar />
        <div style={{ height: '64px' }}></div>
        <Navbar showBack={true} showAccount={true} onBackClick={() => navigate(-1)} />
        <div className="user-profile-container">
          <div className="error-container">
            <h2>User not found</h2>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={{ height: '64px' }}></div>
      <Navbar showBack={true} showAccount={true} onBackClick={() => navigate(-1)} />
      
      <div className="user-profile-container">
        <div className="user-profile-content">
          <div className="user-profile-card">
            <div className="profile-header">
              <div className="profile-avatar">
                {getInitials(userProfile.username)}
              </div>
              <div className="profile-info">
                <h1 className="profile-username">
                  <FiUser />
                  {userProfile.username}
                </h1>
                <div className="profile-email">
                  <FiMail />
                  {userProfile.user_email}
                </div>
                <div className={`profile-role-badge ${userProfile.role}`}>
                  <FiShield />
                  {userProfile.role}
                </div>
              </div>
            </div>

            <div className="profile-details">
              <div className="profile-detail-item">
                <div className="profile-detail-label">
                  <FiUser />
                  Full Name
                </div>
                <div className="profile-detail-value">
                  {userProfile.fullname}
                </div>
              </div>

              <div className="profile-detail-item">
                <div className="profile-detail-label">
                  <FiCalendar />
                  Member Since
                </div>
                <div className="profile-detail-value">
                  {formatDate(userProfile.created_at)}
                </div>
              </div>
            </div>

            <div className="profile-actions">
              <button className="btn-report-user" onClick={openReportModal}>
                <FiFlag />
                Report User
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Report User Modal */}
      {showReportModal && (
        <div className="modal-overlay" onClick={closeReportModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Report User</h3>
            <p>Please provide a reason for reporting this user:</p>
            <textarea
              className="report-textarea"
              placeholder="Describe the issue..."
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              rows="4"
            />
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={closeReportModal}>
                Cancel
              </button>
              <button 
                className="btn-confirm-report" 
                onClick={handleReportUser}
                disabled={isSubmittingReport}
              >
                <FiFlag />
                {isSubmittingReport ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Notification */}
      {showPopup && (
        <div className="popup-notification">
          {popupMessage}
        </div>
      )}
    </>
  );
}

export default UserProfile;
