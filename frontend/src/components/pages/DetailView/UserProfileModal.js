import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiCalendar, FiShield, FiFlag, FiX } from 'react-icons/fi';
import GetUserProfileService from '../../../services/GetUserProfileService';
import ReportUserService from '../../../services/ReportUserService';
import './UserProfileModal.css';

function UserProfileModal({ isOpen, onClose, userEmail }) {
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportDescription, setReportDescription] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  useEffect(() => {
    if (isOpen && userEmail) {
      fetchUserProfile();
    }
  }, [isOpen, userEmail]);

  const fetchUserProfile = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const data = await GetUserProfileService.getUserProfile(token, userEmail);
      
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
      const data = await ReportUserService.reportUser(token, userEmail, reportDescription);
      
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
      day: 'numeric'
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

  if (!isOpen) return null;

  return (
    <>
      {/* User Profile Modal */}
      <div className="modal-overlay" onClick={onClose}>
        <div className="user-profile-modal" onClick={(e) => e.stopPropagation()}>
          <button className="btn-close-modal" onClick={onClose}>
            <FiX />
          </button>

          {isLoading ? (
            <div className="modal-loading">
              <div className="loading-spinner"></div>
              <p>Loading user profile...</p>
            </div>
          ) : !userProfile ? (
            <div className="modal-error">
              <h3>User not found</h3>
            </div>
          ) : (
            <>
              <div className="profile-modal-header">
                <div className="profile-avatar">
                  {getInitials(userProfile.username)}
                </div>
                <div className="profile-info">
                  <h2 className="profile-username">
                    {userProfile.username}
                  </h2>
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

              <div className="profile-modal-details">
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

              <div className="profile-modal-actions">
                <button className="btn-report-user" onClick={openReportModal}>
                  <FiFlag />
                  Report User
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Report User Modal */}
      {showReportModal && (
        <div className="modal-overlay" onClick={closeReportModal} style={{ zIndex: 1002 }}>
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
        <div className="popup-notification" style={{ zIndex: 1003 }}>
          {popupMessage}
        </div>
      )}
    </>
  );
}

export default UserProfileModal;
