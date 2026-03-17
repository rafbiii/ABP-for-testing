import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiX, FiAlertCircle } from 'react-icons/fi';
import Navbar from '../../common/Navbar/Navbar';
import { initializeTheme } from '../../../services/themeUtils';
import { getUserDetails, deleteUser, makeAdmin } from '../../../services/UserService';
import './DetailUserAdmin.css';

const DetailUser = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMakeAdminConfirm, setShowMakeAdminConfirm] = useState(false);

  useEffect(() => {
    initializeTheme();
  }, []);

  useEffect(() => {
    const loadUserDetails = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        localStorage.removeItem('token');
        setModalType('token_invalid');
        setModalMessage('Token invalid. Please login again.');
        setShowModal(true);
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      const userEmail = localStorage.getItem('view_user_email');
      try {
        const response = await getUserDetails(userEmail, token);
        
        if (response.confirmation === 'token invalid') {
          localStorage.removeItem('token');
          setModalType('token_invalid');
          setModalMessage('Token invalid. Please login again.');
          setShowModal(true);
          setTimeout(() => navigate('/login'), 2000);
          return;
        }
        
        if (response.confirmation === 'not admin') {
          setModalType('not_admin');
          setModalMessage("You're not admin. Access denied.");
          setShowModal(true);
          setTimeout(() => navigate('/main'), 2000);
          return;
        }

        if (response.confirmation === 'user not found') {
          setModalType('error');
          setModalMessage('User not found.');
          setShowModal(true);
          setTimeout(() => navigate('/admin/users'), 2000);
          return;
        }

        if (response.confirmation === 'backend error') {
          setModalType('error');
          setModalMessage('Server busy. Please try again later.');
          setShowModal(true);
          setIsLoading(false);
          return;
        }

        if (response.confirmation === 'successful') {
          setUser(response.user);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading user details:', error);
        setModalType('error');
        setModalMessage('Server busy. Please try again later.');
        setShowModal(true);
        setIsLoading(false);
      }
    };

    loadUserDetails();
  }, [userId, navigate]);

  const closeModal = () => {
    setShowModal(false);
    setModalMessage('');
    setModalType('');
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleMakeAdminClick = () => {
    setShowMakeAdminConfirm(true);
  };

  const confirmDelete = async () => {
    setShowDeleteConfirm(false);
    const token = localStorage.getItem('token');

    const userId = localStorage.getItem('view_user_id');
    try {
      const response = await deleteUser(userId, token);
      
      if (response.confirmation === 'token invalid') {
        localStorage.removeItem('token');
        setModalType('token_invalid');
        setModalMessage('Token invalid. Please login again.');
        setShowModal(true);
        setTimeout(() => navigate('/login'), 2000);
        return;
      }
      
      if (response.confirmation === 'not admin') {
        setModalType('not_admin');
        setModalMessage("You're not admin. Access denied.");
        setShowModal(true);
        setTimeout(() => navigate('/main'), 2000);
        return;
      }

      if (response.confirmation === 'user not found') {
        setModalType('error');
        setModalMessage('User not found.');
        setShowModal(true);
        return;
      }

      if (response.confirmation === 'cannot delete admin') {
        setModalType('error');
        setModalMessage('Cannot delete admin users.');
        setShowModal(true);
        return;
      }

      if (response.confirmation === 'backend error') {
        setModalType('error');
        setModalMessage('Server busy. Please try again later.');
        setShowModal(true);
        return;
      }

      if (response.confirmation === 'successful: user deleted') {
        setModalType('success');
        setModalMessage('User has been deleted successfully!');
        setShowModal(true);
        setTimeout(() => navigate('/admin/users'), 2000);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setModalType('error');
      setModalMessage('Server busy. Please try again later.');
      setShowModal(true);
    }
  };

  const confirmMakeAdmin = async () => {
    setShowMakeAdminConfirm(false);
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('view_user_id');
    try {
      const response = await makeAdmin(userId, token);
      
      if (response.confirmation === 'token invalid') {
        localStorage.removeItem('token');
        setModalType('token_invalid');
        setModalMessage('Token invalid. Please login again.');
        setShowModal(true);
        setTimeout(() => navigate('/login'), 2000);
        return;
      }
      
      if (response.confirmation === 'not admin') {
        setModalType('not_admin');
        setModalMessage("You're not admin. Access denied.");
        setShowModal(true);
        setTimeout(() => navigate('/main'), 2000);
        return;
      }

      if (response.confirmation === 'user not found') {
        setModalType('error');
        setModalMessage('User not found.');
        setShowModal(true);
        return;
      }

      if (response.confirmation === 'already admin') {
        setModalType('error');
        setModalMessage('User is already an admin.');
        setShowModal(true);
        return;
      }

      if (response.confirmation === 'backend error') {
        setModalType('error');
        setModalMessage('Server busy. Please try again later.');
        setShowModal(true);
        return;
      }

      if (response.confirmation === 'successful: role updated to admin') {
        setModalType('success');
        setModalMessage('User has been promoted to admin!');
        setShowModal(true);
        // Refresh user data
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error('Error making user admin:', error);
      setModalType('error');
      setModalMessage('Server busy. Please try again later.');
      setShowModal(true);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <>
        <Navbar showBack={true} showAccount={true} />
        <div className="detail-user-loading-container">
          <div className="detail-user-loading-spinner"></div>
          <p>Loading user details...</p>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar showBack={true} showAccount={true} />
        <div className="detail-user-loading-container">
          <FiXCircle size={64} color="#E34234" />
          <p>User not found</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar showBack={true} showAccount={true} />
      <div className="detail-user-container">
        <div className="detail-user-header">
          <h1>User Details</h1>
          <div className="header-buttons">
            {user.role === 'user' && (
              <>
                <button className="btn-make-admin" onClick={handleMakeAdminClick}>
                  Make Admin
                </button>
                <button className="btn-delete" onClick={handleDeleteClick}>
                  Delete User
                </button>
              </>
            )}
          </div>
        </div>

        <div className="detail-user-content">
          <div className="user-card">
            <div className="user-avatar">
              {user.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <h2>{user.username}</h2>
            <span className={`user-badge badge-${user.role}`}>
              {user.role}
            </span>
          </div>

          <div className="user-info-section">
            <h3>User Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Full Name</label>
                <p>{user.fullname || '-'}</p>
              </div>
              <div className="info-item">
                <label>Email</label>
                <p>{user.email}</p>
              </div>
              <div className="info-item">
                <label>Account Created</label>
                <p>{formatDate(user.created_at)}</p>
              </div>
              <div className="info-item">
                <label>Last Updated</label>
                <p>{formatDate(user.updated_at)}</p>
              </div>
            </div>
          </div>

          <div className="user-info-section">
            <h3>Reports History</h3>
            {user.reports && user.reports.length > 0 ? (
              <div className="reports-list">
                {user.reports.map((report, index) => (
                  <div key={report.report_id || index} className="report-card">
                    <div className="report-header">
                      <h4>Report #{report.report_id}</h4>
                    </div>
                    <div className="report-content">
                      <div className="report-detail">
                        <label>Description</label>
                        <p className="report-description">{report.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-reports">
                <p>No reports found for this user.</p>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="detail-user-modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
            <div className="detail-user-modal-content" onClick={(e) => e.stopPropagation()}>
              <FiAlertCircle size={64} color="#E34234" />
              <h3>Delete User?</h3>
              <p>Are you sure you want to delete <strong>{user.username}</strong>? This action cannot be undone and will remove all their comments, ratings, and reports.</p>
              <div className="detail-user-modal-buttons">
                <button className="detail-user-btn-cancel" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </button>
                <button className="detail-user-btn-confirm detail-user-btn-delete" onClick={confirmDelete}>
                  <FiXCircle />
                  Delete User
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Make Admin Confirmation Modal */}
        {showMakeAdminConfirm && (
          <div className="detail-user-modal-overlay" onClick={() => setShowMakeAdminConfirm(false)}>
            <div className="detail-user-modal-content" onClick={(e) => e.stopPropagation()}>
              <FiCheckCircle size={64} color="#00BCD4" />
              <h3>Promote to Admin?</h3>
              <p>Are you sure you want to promote <strong>{user.username}</strong> to admin? They will have full administrative privileges.</p>
              <div className="detail-user-modal-buttons">
                <button className="detail-user-btn-cancel" onClick={() => setShowMakeAdminConfirm(false)}>
                  Cancel
                </button>
                <button className="detail-user-btn-confirm detail-user-btn-make-admin" onClick={confirmMakeAdmin}>
                  <FiCheckCircle />
                  Make Admin
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Modal */}
        {showModal && (
          <div className="detail-user-modal-overlay" onClick={closeModal}>
            <div className={`detail-user-modal ${modalType}`} onClick={(e) => e.stopPropagation()}>
              <button className="detail-user-modal-close" onClick={closeModal}>
                <FiX />
              </button>
              {modalType === 'success' && <FiCheckCircle size={64} color="#00BCD4" />}
              {(modalType === 'error' || modalType === 'token_invalid' || modalType === 'not_admin') && (
                <FiXCircle size={64} color="#E34234" />
              )}
              <h3>{modalType === 'success' ? 'Success!' : 'Error'}</h3>
              <p>{modalMessage}</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DetailUser;