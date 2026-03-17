import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSave, FiImage, FiAlertCircle, FiCheckCircle, FiXCircle, FiX } from 'react-icons/fi';
import { verifyAdmin } from '../../../services/VerificationService';
import { addArticle, validateArticleInput, validateImageFormat } from '../../../services/AddArticleService';
import Navbar from '../../common/Navbar/Navbar';
import { initializeTheme } from '../../../services/themeUtils';
import './AddArticle.css';

function AddArticle() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [article, setArticle] = useState({
    article_title: '',
    article_tag: '',
    article_preview: '',
    article_content: '',
    article_image: null
  });
  const [imagePreview, setImagePreview] = useState(null);


  useEffect(() => {
      initializeTheme();
    }, []);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          localStorage.removeItem('token');
          setIsLoading(false);
          setModalType('token_invalid');
          setModalMessage('Token invalid. Please login again.');
          setShowModal(true);
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        const verifyResult = await verifyAdmin(token);

        if (verifyResult.confirmation === 'token invalid') {
          localStorage.removeItem('token');
          setIsLoading(false);
          setModalType('token_invalid');
          setModalMessage('Token invalid. Please login again.');
          setShowModal(true);
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        if (verifyResult.confirmation === 'not admin') {
          setIsLoading(false);
          setModalType('not_admin');
          setModalMessage("You're not admin. Access denied.");
          setShowModal(true);
          setTimeout(() => navigate('/main'), 2000);
          return;
        }

        if (verifyResult.confirmation === 'backend error') {
          console.warn('Backend error during admin verification');
          setModalType('error');
          setModalMessage('Server busy. Please try again later.');
          setShowModal(true);
          setIsLoading(false);
          return;
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error during admin verification:', error);
        setModalType('error');
        setModalMessage('Server busy. Please try again later.');
        setShowModal(true);
        setIsLoading(false);
      }
    };

    checkAdminAccess();
  }, [navigate]);

  const closeModal = () => {
    setShowModal(false);
    setModalMessage('');
    setModalType('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setArticle({
      ...article,
      [name]: value
    });
    
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: null
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      if (!validateImageFormat(file)) {
        setValidationErrors({
          ...validationErrors,
          image: 'Image must be in PNG or JPG format'
        });
        e.target.value = null;
        setImagePreview(null);
        return;
      }

      setArticle({
        ...article,
        article_image: file
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      if (validationErrors.image) {
        setValidationErrors({
          ...validationErrors,
          image: null
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = validateArticleInput(article);
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      
      const firstError = Object.values(validation.errors)[0];
      setModalType('error');
      setModalMessage(firstError);
      setShowModal(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await addArticle(article);
      
      if (!response.success) {
        if (response.error === 'backend_error') {
          setModalType('error');
          setModalMessage('Server busy. Please try again later.');
          setShowModal(true);
        } 
        else if (response.error === 'token_invalid') {
          localStorage.removeItem('token');
          setModalType('token_invalid');
          setModalMessage('Session expired. Please login again.');
          setShowModal(true);
          setTimeout(() => navigate('/login'), 2000);
        }
        else {
          setModalType('error');
          setModalMessage(response.message || 'Failed to add article. Please try again.');
          setShowModal(true);
        }
      } else {
        setModalType('success');
        setModalMessage('Article published successfully!');
        setShowModal(true);
        setTimeout(() => navigate('/main'), 2000);
      }
    } catch (error) {
      console.error('Error submitting article:', error);
      setModalType('error');
      setModalMessage('Server busy. Please try again later.');
      setShowModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="add-article-loading">
        Verifying access...
      </div>
    );
  }

  return (
    <>
      <div className="bg-shape-1"></div>
      <div className="bg-shape-2"></div>
      <div className="bg-shape-3"></div>
      
      <Navbar showBack={true} showAccount={true} onBackClick={() => navigate('/main')} />

      <div className="add-article-container">
        <div className="add-article-header">
          <div className="add-article-header-accent"></div>
          <h1>Write New Article</h1>
          <p>Create a new product review</p>
        </div>

        <form onSubmit={handleSubmit} className="add-article-form">
          <div className="add-article-form-row">
            <div className="add-article-form-group add-article-form-group-title">
              <label>Title</label>
              <input
                type="text"
                name="article_title"
                value={article.article_title}
                onChange={handleChange}
                placeholder="Acer Nitro 5 Review: The Ultimate Gaming Laptop for Every Gamer"
                className={validationErrors.title ? 'error' : ''}
              />
              {validationErrors.title && (
                <span className="add-article-error-message">
                  <FiAlertCircle /> {validationErrors.title}
                </span>
              )}
            </div>

            <div className="add-article-form-group add-article-form-group-category">
              <label>Category</label>
              <select
                name="article_tag"
                value={article.article_tag}
                onChange={handleChange}
                className={validationErrors.tag ? 'error' : ''}
              >
                <option value="">Select category</option>
                <option value="office">Office</option>
                <option value="budget">Budget</option>
                <option value="gaming">Gaming</option>
                <option value="flagship">Flagship</option>
              </select>
              {validationErrors.tag && (
                <span className="add-article-error-message">
                  <FiAlertCircle /> {validationErrors.tag}
                </span>
              )}
            </div>
          </div>

          <div className="add-article-form-group">
            <label>
              <FiImage style={{ marginRight: '8px' }} />
              Article Image (PNG/JPG only)
            </label>
            <input
              type="file"
              accept="image/png, image/jpg, image/jpeg"
              onChange={handleImageChange}
              className={validationErrors.image ? 'error' : ''}
            />
            {validationErrors.image && (
              <span className="add-article-error-message">
                <FiAlertCircle /> {validationErrors.image}
              </span>
            )}
            {imagePreview && (
              <div className="add-article-image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
          </div>

          <div className="add-article-form-group">
            <label>Preview</label>
            <textarea
              name="article_preview"
              value={article.article_preview}
              onChange={handleChange}
              placeholder="Brief description (max 150 characters)"
              rows="2"
              maxLength="150"
              className={validationErrors.preview ? 'error' : ''}
            />
            {validationErrors.preview && (
              <span className="add-article-error-message">
                <FiAlertCircle /> {validationErrors.preview}
              </span>
            )}
          </div>

          <div className="add-article-form-group">
            <label>Content</label>
            <textarea
              name="article_content"
              value={article.article_content}
              onChange={handleChange}
              placeholder="Write your detailed review here..."
              rows="12"
              className={validationErrors.content ? 'error' : ''}
            />
            {validationErrors.content && (
              <span className="add-article-error-message">
                <FiAlertCircle /> {validationErrors.content}
              </span>
            )}
          </div>

          <button 
            type="submit" 
            className="add-article-btn-save"
            disabled={isSubmitting}
          >
            <FiSave />
            {isSubmitting ? 'Publishing...' : 'Publish Article'}
          </button>
        </form>
      </div>

      {showModal && (
        <div className="add-article-modal-overlay" onClick={closeModal}>
          <div className={`add-article-modal ${modalType}`} onClick={(e) => e.stopPropagation()}>
            <button className="add-article-modal-close" onClick={closeModal}>
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
    </>
  );
}

export default AddArticle;