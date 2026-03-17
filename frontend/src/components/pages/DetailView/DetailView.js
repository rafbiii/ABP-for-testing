import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiStar, FiEdit, FiFlag, FiTrash2, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import Navbar from '../../common/Navbar/Navbar';
import ArticleSection from './ArticleSection';
import RatingsSection from './RatingsSection';
import CommentsSection from './CommentsSection';
import ReportsSection from './ReportsSection';
import UserProfileModal from './UserProfileModal';
import DetailArticleService from '../../../services/DetailArticleService';
import DeleteArticleService from '../../../services/DeleteArticleService';
import AddRatingService from '../../../services/AddRatingService';
import EditRatingService from '../../../services/EditRatingService';
import AddCommentService from '../../../services/AddCommentService';
import EditCommentService from '../../../services/EditCommentService';
import DeleteCommentService from '../../../services/DeleteCommentService';
import ReportArticleService from '../../../services/ReportArticleService';
import { initializeTheme } from '../../../services/themeUtils';
import './DetailViewCommon.css';

function DetailView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  
  // Comment states
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);
  
  // Reply states
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  
  // Rating states
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [hasUserRated, setHasUserRated] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  
  // Rating confirmation modal
  const [showRatingConfirmModal, setShowRatingConfirmModal] = useState(false);
  const [pendingRating, setPendingRating] = useState(0);
  
  // Edit rating states
  const [editRatingValue, setEditRatingValue] = useState(0);
  const [showEditRatingModal, setShowEditRatingModal] = useState(false);
  const [userRatingId, setUserRatingId] = useState(null);
  
  // User profile modal states
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [selectedUserEmail, setSelectedUserEmail] = useState('');
  
  useEffect(() => {
    initializeTheme();
  }, []);

  // Article data from API
  const [article, setArticle] = useState(null);
  const [userclass, setUserclass] = useState('user');
  const [username, setUsername] = useState('');
  const [comments, setComments] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }

    fetchArticleData(token);
  }, [id, navigate]);

  const fetchArticleData = async (token) => {
  setIsLoading(true);
  try {
    const data = await DetailArticleService.viewArticle(token, id);
    const currentUserEmail = data.user_email;  // ← Ganti nama variable untuk kejelasan
    
    if (data.confirmation === 'token invalid') {
      displayPopup('token invalid');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }

    if (data.confirmation === 'backend error') {
      displayPopup('server busy');
      setIsLoading(false);
      return;
    }

    if (data.confirmation === 'successful') {
      setArticle({
        title: data.article_title,
        content: data.article_content,
        tag: data.article_tag,
        image: data.article_image,
        user_email: data.user_email
      });
      setUserclass(data.userclass);
      setUsername(currentUserEmail);  // ← Ini adalah email user yang LOGIN
      
      if (data.comments && Array.isArray(data.comments)) {
        setComments(data.comments);
      }
      
      if (data.ratings && Array.isArray(data.ratings)) {
        setRatings(data.ratings);
        setRatingCount(data.ratings.length);
        
        if (data.ratings.length > 0) {
          const sum = data.ratings.reduce((acc, r) => acc + r.rating_value, 0);
          setAverageRating((sum / data.ratings.length).toFixed(1));
        }
        
        // ← PERBAIKI DI SINI: Gunakan currentUserEmail, bukan currentUsername
        const userRatingObj = data.ratings.find(r => r.user_email === currentUserEmail);
        if (userRatingObj) {
          setHasUserRated(true);
          setUserRating(userRatingObj.rating_value);
          setRating(userRatingObj.rating_value);
          setUserRatingId(userRatingObj.rating_id);
        }
      }
      
      if (data.reports && Array.isArray(data.reports)) {
        setReports(data.reports);
      }
      
      setIsLoading(false);
    }
  } catch (error) {
    console.error('Error fetching article:', error);
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

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      displayPopup('Comment cannot be empty');
      return;
    }
    
    if (comment.length < 1 || comment.length > 8192) {
      displayPopup('Comment must be between 1-8192 characters');
      return;
    }
    
    setIsSubmittingComment(true);
    const token = localStorage.getItem('token');
    
    try {
      const data = await AddCommentService.addComment(token, id, comment, "");
      
      if (data.confirmation === 'token invalid') {
        displayPopup('token invalid');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }
      
      if (data.confirmation === 'backend error') {
        displayPopup('server busy');
        setIsSubmittingComment(false);
        return;
      }
      
      if (data.confirmation === 'successful') {
          const data = await DetailArticleService.viewArticle(token, id);
          if (data.confirmation === 'successful') {
          setArticle({
            title: data.article_title,
            content: data.article_content,
            tag: data.article_tag,
            image: data.article_image,
            user_email: data.user_email
          });
          setComments(data.comments || []);
          setRatings(data.ratings);
          if (data.reports) setReports(data.reports);
          
          // ← PERBAIKI DI SINI: Gunakan username yang sudah di-set (yang merupakan email user login)
          const newUserRating = data.ratings.find(r => r.user_email === username);
          if (newUserRating) {
            setUserRatingId(newUserRating.rating_id);
            setHasUserRated(true);
            setUserRating(newUserRating.rating_value);  // ← Tambahkan ini
            setRating(newUserRating.rating_value);      // ← Tambahkan ini
          }
          
          // Hitung ulang average rating
          if (data.ratings && data.ratings.length > 0) {
            const sum = data.ratings.reduce((acc, r) => acc + r.rating_value, 0);
            setAverageRating((sum / data.ratings.length).toFixed(1));
            setRatingCount(data.ratings.length);
          }
        }
        
        setComment('');
        displayPopup('Comment added successfully');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      displayPopup('server busy');
    }
    
    setIsSubmittingComment(false);
  };

  const handleReplyClick = (commentId) => {
    setReplyingToCommentId(commentId);
    setReplyContent('');
  };

  const handleCancelReply = () => {
    setReplyingToCommentId(null);
    setReplyContent('');
  };

  const handleSubmitReply = async (parentCommentId) => {
    if (!replyContent.trim()) {
      displayPopup('Reply cannot be empty');
      return;
    }
    
    if (replyContent.length < 1 || replyContent.length > 8192) {
      displayPopup('Reply must be between 1-8192 characters');
      return;
    }
    
    setIsSubmittingReply(true);
    const token = localStorage.getItem('token');
    
    try {
      const data = await AddCommentService.addComment(token, id, replyContent, parentCommentId);
      
      if (data.confirmation === 'token invalid') {
        displayPopup('token invalid');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }
      
      if (data.confirmation === 'backend error') {
        displayPopup('server busy');
        setIsSubmittingReply(false);
        return;
      }
      
      if (data.confirmation === 'successful') {
        setArticle({
          title: data.article_title,
          content: data.article_content,
          tag: data.article_tag,
          image: data.article_image,
          user_email: data.user_email
        });
        setComments(data.comments || []);
        setRatings(data.ratings);
        if (data.reports) setReports(data.reports);
        
        setReplyingToCommentId(null);
        setReplyContent('');
        displayPopup('Reply added successfully');
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      displayPopup('server busy');
    }
    
    setIsSubmittingReply(false);
  };

  const handleEditComment = (commentId, content) => {
    setEditingCommentId(commentId);
    setEditCommentContent(content);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditCommentContent('');
  };

  const handleSaveEdit = async (commentId) => {
    if (!editCommentContent.trim()) {
      displayPopup('Comment cannot be empty');
      return;
    }
    
    if (editCommentContent.length < 1 || editCommentContent.length > 8192) {
      displayPopup('Comment must be between 1-8192 characters');
      return;
    }
    
    const token = localStorage.getItem('token');
    
    try {
      const data = await EditCommentService.editComment(token, id, commentId, editCommentContent);
      
      if (data.confirmation === 'token invalid') {
        displayPopup('token invalid');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }
      
      if (data.confirmation === 'backend error') {
        displayPopup('server busy');
        return;
      }
      
      if (data.confirmation === 'successful') {
        const data = await DetailArticleService.viewArticle(token, id);
          if (data.confirmation === 'successful') {
          setArticle({
            title: data.article_title,
            content: data.article_content,
            tag: data.article_tag,
            image: data.article_image,
            user_email: data.user_email
          });
          setComments(data.comments || []);
          setRatings(data.ratings);
          if (data.reports) setReports(data.reports);
          
          // ← PERBAIKI DI SINI: Gunakan username yang sudah di-set (yang merupakan email user login)
          const newUserRating = data.ratings.find(r => r.user_email === username);
          if (newUserRating) {
            setUserRatingId(newUserRating.rating_id);
            setHasUserRated(true);
            setUserRating(newUserRating.rating_value);  // ← Tambahkan ini
            setRating(newUserRating.rating_value);      // ← Tambahkan ini
          }
          
          // Hitung ulang average rating
          if (data.ratings && data.ratings.length > 0) {
            const sum = data.ratings.reduce((acc, r) => acc + r.rating_value, 0);
            setAverageRating((sum / data.ratings.length).toFixed(1));
            setRatingCount(data.ratings.length);
          }
        }
        
        setEditingCommentId(null);
        setEditCommentContent('');
        displayPopup('Comment updated successfully');
      }
    } catch (error) {
      console.error('Error editing comment:', error);
      displayPopup('server busy');
    }
  };

  const handleDeleteComment = (commentId) => {
    setDeletingCommentId(commentId);
    setShowDeleteCommentModal(true);
  };

  const confirmDeleteComment = async () => {
    const token = localStorage.getItem('token');
    
    try {
      const data = await DeleteCommentService.deleteComment(token, deletingCommentId);
      if (data.confirmation === 'token invalid') {
        displayPopup('token invalid');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }
      
      if (data.confirmation === 'backend error') {
        displayPopup('server busy');
        setShowDeleteCommentModal(false);
        return;
      }
      
      if (data.confirmation === 'successful') {
        setArticle({
          title: data.article_title,
          content: data.article_content,
          tag: data.article_tag,
          image: data.article_image,
          user_email: data.user_email
        });
        setComments(data.comments || []);
        setRatings(data.ratings);
        if (data.reports) setReports(data.reports);
        
        setShowDeleteCommentModal(false);
        setDeletingCommentId(null);
        displayPopup('Comment deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      displayPopup('server busy');
    }
  };

  const cancelDeleteComment = () => {
    setShowDeleteCommentModal(false);
    setDeletingCommentId(null);
  };

  const handleRatingClick = (selectedRating) => {
    if (hasUserRated) return;
    
    setPendingRating(selectedRating);
    setShowRatingConfirmModal(true);
  };

  const confirmRatingSubmission = async () => {
    setIsSubmittingRating(true);
    const token = localStorage.getItem('token');
    
    try {
      const data = await AddRatingService.addRating(token, id, pendingRating);
      
      if (data.confirmation === 'token invalid') {
        displayPopup('token invalid');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }

      if (data.confirmation === 'backend error') {
        displayPopup('server busy');
        setIsSubmittingRating(false);
        setShowRatingConfirmModal(false);
        return;
      }
      
      if (data.confirmation === 'successful') {
      const data = await DetailArticleService.viewArticle(token, id);
        if (data.confirmation === 'successful') {
        setArticle({
          title: data.article_title,
          content: data.article_content,
          tag: data.article_tag,
          image: data.article_image,
          user_email: data.user_email
        });
        setComments(data.comments || []);
        setRatings(data.ratings);
        if (data.reports) setReports(data.reports);
        
        // ← PERBAIKI DI SINI: Gunakan username yang sudah di-set (yang merupakan email user login)
        const newUserRating = data.ratings.find(r => r.user_email === username);
        if (newUserRating) {
          setUserRatingId(newUserRating.rating_id);
          setHasUserRated(true);
          setUserRating(newUserRating.rating_value);  // ← Tambahkan ini
          setRating(newUserRating.rating_value);      // ← Tambahkan ini
        }
        
        // Hitung ulang average rating
        if (data.ratings && data.ratings.length > 0) {
          const sum = data.ratings.reduce((acc, r) => acc + r.rating_value, 0);
          setAverageRating((sum / data.ratings.length).toFixed(1));
          setRatingCount(data.ratings.length);
        }
      }
      displayPopup('Rating submitted successfully');
      setShowRatingConfirmModal(false);
    }
    } catch (error) {
      console.error('Error submitting rating:', error);
      displayPopup('server busy');
    }
    
    setIsSubmittingRating(false);
  };

  const cancelRatingSubmission = () => {
    setShowRatingConfirmModal(false);
    setPendingRating(0);
    setRating(userRating || 0);
  };

  const handleEditRatingClick = () => {
    setEditRatingValue(userRating);
    setShowEditRatingModal(true);
  };

  const handleEditRatingStarClick = (selectedRating) => {
    setEditRatingValue(selectedRating);
  };

  const cancelEditRating = () => {
    setShowEditRatingModal(false);
    setEditRatingValue(0);
  };

  const confirmEditRating = async () => {
    if (editRatingValue === userRating) {
      displayPopup('Rating value unchanged');
      setShowEditRatingModal(false);
      return;
    }

    setIsSubmittingRating(true);
    const token = localStorage.getItem('token');
    
    try {
      const data = await EditRatingService.editRating(token, id, userRatingId, editRatingValue);
      
      if (data.confirmation === 'token invalid') {
        displayPopup('token invalid');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }
      
      if (data.confirmation === 'backend error') {
        displayPopup('server busy');
        setIsSubmittingRating(false);
        setShowEditRatingModal(false);
        return;
      }
      
      if (data.confirmation === 'successful') {
              const data = await DetailArticleService.viewArticle(token, id);
        if (data.confirmation === 'successful') {
        setArticle({
          title: data.article_title,
          content: data.article_content,
          tag: data.article_tag,
          image: data.article_image,
          user_email: data.user_email
        });
        setComments(data.comments || []);
        setRatings(data.ratings);
        if (data.reports) setReports(data.reports);
        
        // ← PERBAIKI DI SINI: Gunakan username yang sudah di-set (yang merupakan email user login)
        const newUserRating = data.ratings.find(r => r.user_email === username);
        if (newUserRating) {
          setUserRatingId(newUserRating.rating_id);
          setHasUserRated(true);
          setUserRating(newUserRating.rating_value);  // ← Tambahkan ini
          setRating(newUserRating.rating_value);      // ← Tambahkan ini
        }
        
        // Hitung ulang average rating
        if (data.ratings && data.ratings.length > 0) {
          const sum = data.ratings.reduce((acc, r) => acc + r.rating_value, 0);
          setAverageRating((sum / data.ratings.length).toFixed(1));
          setRatingCount(data.ratings.length);
        }
      }
        displayPopup('Rating updated successfully');
        setShowEditRatingModal(false);
      }
    } catch (error) {
      console.error('Error updating rating:', error);
      displayPopup('server busy');
    }
    
    setIsSubmittingRating(false);
  };

  const openReportModal = () => {
    setShowReportModal(true);
    setReportReason('');
  };

  const handleReport = async () => {
    // Validation: check if description is empty
    if (!reportReason.trim()) {
      displayPopup('please fill description');
      return;
    }

    setIsSubmittingReport(true);
    const token = localStorage.getItem('token');
    
    try {
      const data = await ReportArticleService.reportArticle(token, id, reportReason);
      
      // Handle token invalid
      if (data.confirmation === 'token invalid') {
        displayPopup('token invalid');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }
      
      // Handle article not found
      if (data.confirmation === 'article not found') {
        displayPopup('article not found');
        setShowReportModal(false);
        setReportReason('');
        setIsSubmittingReport(false);
        return;
      }
      
      // Handle already reported
      if (data.confirmation === 'already reported') {
        displayPopup('you already reported this article');
        setShowReportModal(false);
        setReportReason('');
        setIsSubmittingReport(false);
        return;
      }
      
      // Handle backend error
      if (data.confirmation === 'backend error') {
        displayPopup('server busy');
        setShowReportModal(false);
        setReportReason('');
        setIsSubmittingReport(false);
        return;
      }
      
      // Handle successful report
      if (data.confirmation === 'successful: article reported') {
        displayPopup('article has been reported');
        setShowReportModal(false);
        setReportReason('');
        
        // Refresh article data to get updated reports
        await fetchArticleData(token);
      }
    } catch (error) {
      console.error('Error reporting article:', error);
      displayPopup('server busy');
    }
    
    setIsSubmittingReport(false);
  };

  const handleEditArticle = () => {
    navigate(`/admin/edit/${id}`);
  };

  const handleDeleteArticle = () => {
    setShowDeleteConfirmModal(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    const token = localStorage.getItem('token');
    
    try {
      const data = await DeleteArticleService.deleteArticle(token, id);
      
      if (data.confirmation === 'token invalid') {
        displayPopup('token invalid');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }
      
      if (data.confirmation === 'backend error') {
        displayPopup('server busy');
        setIsDeleting(false);
        setShowDeleteConfirmModal(false);
        return;
      }
      
      if (data.confirmation === 'successful: article deleted') {
        setShowDeleteConfirmModal(false);
        setSuccessMessage('Article deleted successfully!');
        setShowSuccessModal(true);
        
        setTimeout(() => {
          navigate('/main');
        }, 2000);
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      displayPopup('server busy');
      setIsDeleting(false);
    }
  };
  
  const cancelDelete = () => {
    setShowDeleteConfirmModal(false);
  };

  const organizeComments = () => {
    const commentMap = new Map();
    const rootComments = [];

    comments.forEach(comment => {
      commentMap.set(comment.comment_id, { ...comment, replies: [] });
    });

    comments.forEach(comment => {
      if (comment.parent_comment_id && comment.parent_comment_id !== "") {
        const parent = commentMap.get(comment.parent_comment_id);
        const child = commentMap.get(comment.comment_id);
        if (parent && child) {
          parent.replies.push(child);
        }
      } else {
        const rootComment = commentMap.get(comment.comment_id);
        if (rootComment) {
          rootComments.push(rootComment);
        }
      }
    });

    return rootComments;
  };

  const organizedComments = organizeComments();

  const handleUserClick = (userEmail) => {
    setSelectedUserEmail(userEmail);
    setShowUserProfileModal(true);
  };

  const handleCloseUserProfileModal = () => {
    setShowUserProfileModal(false);
    setSelectedUserEmail('');
  };

  if (isLoading) {
    return (
      <>
        <Navbar showAccount={true} />
        <div className="navbar-placeholder"></div>
        <div className="loading-container">
          <h2>Loading article...</h2>
        </div>
      </>
    );
  }

  if (!article) {
    return (
      <>
        <Navbar />
        <Navbar showBack={true} showAccount={true} onBackClick={() => navigate('/main')} />
        <div className="navbar-placeholder"></div>
        <div className="error-container">
          <h2>Article not found</h2>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="navbar-placeholder"></div>
      <Navbar showBack={true} showAccount={true} onBackClick={() => navigate('/main')} />
      
      <ArticleSection
        article={article}
        averageRating={averageRating}
        ratingCount={ratingCount}
        userclass={userclass}
        onEdit={handleEditArticle}
        onDelete={handleDeleteArticle}
        onReport={openReportModal}
      />

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <RatingsSection
          hasUserRated={hasUserRated}
          userRating={userRating}
          rating={rating}
          setRating={setRating}
          onRatingClick={handleRatingClick}
          onEditRating={handleEditRatingClick}
        />

        <CommentsSection
          comments={comments}
          ratings={ratings}
          comment={comment}
          setComment={setComment}
          isSubmittingComment={isSubmittingComment}
          handleSubmitComment={handleSubmitComment}
          replyingToCommentId={replyingToCommentId}
          replyContent={replyContent}
          setReplyContent={setReplyContent}
          isSubmittingReply={isSubmittingReply}
          handleReplyClick={handleReplyClick}
          handleSubmitReply={handleSubmitReply}
          handleCancelReply={handleCancelReply}
          currentUserEmail={username}
          editingCommentId={editingCommentId}
          editCommentContent={editCommentContent}
          setEditCommentContent={setEditCommentContent}
          handleEditComment={handleEditComment}
          handleCancelEdit={handleCancelEdit}
          handleSaveEdit={handleSaveEdit}
          handleDeleteComment={handleDeleteComment}
          organizedComments={organizedComments}
          handleUserClick={handleUserClick}
        />

        <ReportsSection reports={reports} userclass={userclass} />
      </div>

      {/* Rating Confirmation Modal */}
      {showRatingConfirmModal && (
        <div className="modal-overlay" onClick={cancelRatingSubmission}>
          <div className="modal-content rating-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <FiStar size={64} color="#E34234" />
            <h3>Confirm Your Rating</h3>
            <p>Are you sure you want to rate this article <strong>{pendingRating} out of 5 stars</strong>?</p>
            <div className="star-rating-display-modal">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                  key={star}
                  className={`star-display ${pendingRating >= star ? 'filled' : ''}`}
                />
              ))}
            </div>
            <p className="rating-warning">Note: You can edit your rating later.</p>
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={cancelRatingSubmission}>
                Cancel
              </button>
              <button className="btn-confirm-rating" onClick={confirmRatingSubmission} disabled={isSubmittingRating}>
                <FiCheckCircle />
                {isSubmittingRating ? 'Submitting...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Rating Modal */}
      {showEditRatingModal && (
        <div className="modal-overlay" onClick={cancelEditRating}>
          <div className="modal-content rating-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <FiEdit size={64} color="#00BCD4" />
            <h3>Edit Your Rating</h3>
            <p>Select your new rating for this article</p>
            <div className="star-rating-edit-modal">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                  key={star}
                  className={`star-edit ${editRatingValue >= star ? 'active' : ''}`}
                  onClick={() => handleEditRatingStarClick(star)}
                />
              ))}
            </div>
            <p className="rating-value-edit">New rating: {editRatingValue} / 5</p>
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={cancelEditRating}>
                Cancel
              </button>
              <button className="btn-confirm-rating" onClick={confirmEditRating} disabled={isSubmittingRating || editRatingValue === 0}>
                <FiCheckCircle />
                {isSubmittingRating ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Report Article</h3>
            <p>Please provide a reason for reporting this article:</p>
            <textarea
              className="report-textarea"
              placeholder="Describe the issue..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              rows="4"
            />
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={() => setShowReportModal(false)}>
                Cancel
              </button>
              <button 
                className="btn-confirm-report" 
                  onClick={() => {
                  handleReport();
                  handleCloseUserProfileModal();
                }}
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

      {/* Delete Article Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-content delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <FiAlertCircle size={64} color="#E34234" />
            <h3>Delete Article?</h3>
            <p>Are you sure you want to delete this article? This action cannot be undone.</p>
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="btn-confirm-delete" onClick={confirmDelete}
                disabled={isDeleting}>
                <FiTrash2 />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Comment Confirmation Modal */}
      {showDeleteCommentModal && (
        <div className="modal-overlay" onClick={cancelDeleteComment}>
          <div className="modal-content delete-comment-modal" onClick={(e) => e.stopPropagation()}>
            <FiAlertCircle size={64} color="#E34234" />
            <h3>Delete Comment?</h3>
            <p>Are you sure you want to delete this comment? This action cannot be undone.</p>
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={cancelDeleteComment}>
                Cancel
              </button>
              <button className="btn-confirm-delete" onClick={confirmDeleteComment}>
                <FiTrash2 />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="success-modal">
            <FiCheckCircle size={64} color="#00BCD4" />
            <h3>{successMessage}</h3>
            <p>Redirecting to main page...</p>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={showUserProfileModal}
        onClose={handleCloseUserProfileModal}
        userEmail={selectedUserEmail}
      />
    </>
  );
}

export default DetailView;
