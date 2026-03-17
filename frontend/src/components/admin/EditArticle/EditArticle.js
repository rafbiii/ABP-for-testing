import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiImage, FiCheckCircle, FiXCircle, FiAlertCircle, FiX } from 'react-icons/fi';
import { getArticleForEdit, updateArticle } from "../../../services/EditArticleService";
import { verifyAdmin } from '../../../services/VerificationService';
import Navbar from '../../common/Navbar/Navbar';
import { initializeTheme } from '../../../services/themeUtils';
import './EditArticle.css';

function EditArticle() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState({});
  
  const [article, setArticle] = useState({
    article_id: id,
    article_title: '',
    article_tag: '',
    article_preview: '',
    article_content: '',
    article_image: null
  });
  
  useEffect(() => {
    initializeTheme();
  }, []);

  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const loadArticleData = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        localStorage.removeItem('token');
        setModalType('token_invalid');
        setModalMessage('Token invalid. Please login again.');
        setShowModal(true);
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      try {
        const responseData = await verifyAdmin(token);
        
        if (responseData.confirmation === 'token invalid') {
          localStorage.removeItem('token');
          setModalType('token_invalid');
          setModalMessage('Token invalid. Please login again.');
          setShowModal(true);
          setTimeout(() => navigate('/login'), 2000);
          return;
        }
        
        if (responseData.confirmation === 'not admin') {
          setModalType('not_admin');
          setModalMessage("You're not admin. Access denied.");
          setShowModal(true);
          setTimeout(() => navigate('/main'), 2000);
          return;
        }

        if (responseData.confirmation === 'backend error') {
          setModalType('error');
          setModalMessage('Server busy. Please try again later.');
          setShowModal(true);
          setIsLoading(false);
          return;
        }

        const response = await getArticleForEdit(id, token);
        
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
        
        if (response.confirmation === 'backend error') {
          setModalType('error');
          setModalMessage('Server busy. Please try again later.');
          setShowModal(true);
          setIsLoading(false);
          return;
        }
        
        if (response.confirmation === 'successful') {
          
          setArticle({
            article_id: response.article_id,
            article_title: response.article_title,
            article_tag: response.article_tag,
            article_preview: response.article_preview,
            article_content: response.article_content,
            article_image: response.article_image
          });
          
          if (response.article_image) {
            let imageToDisplay = response.article_image;
            
            if (!response.article_image.startsWith('data:image')) {
              imageToDisplay = 'data:image/jpeg;base64,' + response.article_image;
            }
            
            setImagePreview(imageToDisplay);
          } else {
            console.log('No image in response');
          }
          
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading article:', error);
        setModalType('error');
        setModalMessage('Server busy. Please try again later.');
        setShowModal(true);
        setIsLoading(false);
      }
    };

    loadArticleData();
  }, [id, navigate]);

  const closeModal = () => {
    setShowModal(false);
    setModalMessage('');
    setModalType('');
  };

  const handleChange = (e) => {
    setArticle({
      ...article,
      [e.target.name]: e.target.value
    });
    if (validationErrors[e.target.name]) {
      setValidationErrors({
        ...validationErrors,
        [e.target.name]: ''
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setValidationErrors({
          ...validationErrors,
          article_image: 'Image must be PNG or JPG format'
        });
        return;
      }

      setValidationErrors({
        ...validationErrors,
        article_image: ''
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        
        setArticle({
          ...article,
          article_image: base64String
        });
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!article.article_title.trim()) {
      errors.article_title = 'Title is required';
    }
    if (!article.article_tag.trim()) {
      errors.article_tag = 'Category is required';
    }
    if (!article.article_preview.trim()) {
      errors.article_preview = 'Preview is required';
    }
    if (!article.article_content.trim()) {
      errors.article_content = 'Content is required';
    }
    if (!article.article_image) {
      errors.article_image = 'Image is required';
    }

    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      setModalType('error');
      setModalMessage(firstError);
      setShowModal(true);
    }
    
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmUpdate = async () => {
    setShowConfirmModal(false);
    const token = localStorage.getItem('token');

    try {
      const response = await updateArticle(article, token);
      
      if (response.confirmation === 'token invalid') {
        localStorage.removeItem('token');
        setModalType('token_invalid');
        setModalMessage('Session expired. Please login again.');
        setShowModal(true);
        setTimeout(() => navigate('/login'), 2000);
        return;
      }
      
      if (response.confirmation === 'backend error') {
        setModalType('error');
        setModalMessage('Server busy. Please try again later.');
        setShowModal(true);
        return;
      }
      
      if (response.confirmation === 'successful: article edited') {
        setModalType('success');
        setModalMessage('Article updated successfully!');
        setShowModal(true);
        
        setTimeout(() => {
          navigate(`/article/${response.article_id}`);
        }, 2000);
      }
    } catch (error) {
      console.error('Error updating article:', error);
      setModalType('error');
      setModalMessage('Server busy. Please try again later.');
      setShowModal(true);
    }
  };

  const handleBackClick = () => {
    navigate(`/article/${id}`);
  };

  return (
    <>
      <div className="bg-shape-1"></div>
      <div className="bg-shape-2"></div>
      <div className="bg-shape-3"></div>
      
      <Navbar showBack={true} showAccount={true} onBackClick={handleBackClick} />

      <div className="edit-article-container">
        <div className="edit-article-header">
          <div className="edit-article-header-accent"></div>
          <h1>Edit Article</h1>
          <p>Update your product review</p>
        </div>

        <form onSubmit={handleSubmit} className="edit-article-form">
          <div className="edit-article-form-row">
            <div className="edit-article-form-group edit-article-form-group-title">
              <label>Title</label>
              <input
                type="text"
                name="article_title"
                value={article.article_title}
                onChange={handleChange}
                placeholder="Article title"
                className={validationErrors.article_title ? 'error' : ''}
              />
              {validationErrors.article_title && (
                <span className="edit-article-error-message">
                  <FiAlertCircle /> {validationErrors.article_title}
                </span>
              )}
            </div>

            <div className="edit-article-form-group edit-article-form-group-category">
              <label>Category</label>
              <select
                name="article_tag"
                value={article.article_tag}
                onChange={handleChange}
                className={validationErrors.article_tag ? 'error' : ''}
              >
                <option value="">Select category</option>
                <option value="office">Office</option>
                <option value="budget">Budget</option>
                <option value="gaming">Gaming</option>
                <option value="flagship">Flagship</option>
              </select>
              {validationErrors.article_tag && (
                <span className="edit-article-error-message">
                  <FiAlertCircle /> {validationErrors.article_tag}
                </span>
              )}
            </div>
          </div>

          <div className="edit-article-form-group">
            <label>
              <FiImage style={{ marginRight: '8px' }} />
              Image (PNG/JPG only)
            </label>
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleImageChange}
              className={validationErrors.article_image ? 'error' : ''}
            />
            {validationErrors.article_image && (
              <span className="edit-article-error-message">
                <FiAlertCircle /> {validationErrors.article_image}
              </span>
            )}
          </div>

          {imagePreview && (
            <div className="edit-article-image-preview">
              <img 
                src={imagePreview} 
                alt="Article Preview"
                onError={(e) => {
                  console.error('Image failed to load');
                  e.target.style.display = 'none';
                }}
                onLoad={() => {
                }}
              />
            </div>
          )}

          <div className="edit-article-form-group">
            <label>Preview</label>
            <textarea
              name="article_preview"
              value={article.article_preview}
              onChange={handleChange}
              placeholder="Brief description (max 150 characters)"
              rows="2"
              maxLength="150"
              className={validationErrors.article_preview ? 'error' : ''}
            />
            {validationErrors.article_preview && (
              <span className="edit-article-error-message">
                <FiAlertCircle /> {validationErrors.article_preview}
              </span>
            )}
          </div>

          <div className="edit-article-form-group">
            <label>Content</label>
            <textarea
              name="article_content"
              value={article.article_content}
              onChange={handleChange}
              placeholder="Write your detailed review here..."
              rows="12"
              className={validationErrors.article_content ? 'error' : ''}
            />
            {validationErrors.article_content && (
              <span className="edit-article-error-message">
                <FiAlertCircle /> {validationErrors.article_content}
              </span>
            )}
          </div>

          <div className="edit-article-button-group">
            <button type="submit" className="edit-article-btn-save">
              <FiSave />
              Update Article
            </button>
          </div>
        </form>

        {showConfirmModal && (
          <div className="edit-article-modal-overlay" onClick={() => setShowConfirmModal(false)}>
            <div className="edit-article-modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Update Article?</h3>
              <p>Are you sure you want to update this article?</p>
              <div className="edit-article-modal-buttons">
                <button className="edit-article-btn-cancel" onClick={() => setShowConfirmModal(false)}>
                  Cancel
                </button>
                <button className="edit-article-btn-confirm" onClick={confirmUpdate}>
                  <FiSave />
                  Update Article
                </button>
              </div>
            </div>
          </div>
        )}

        {showModal && (
          <div className="edit-article-modal-overlay" onClick={closeModal}>
            <div className={`edit-article-modal ${modalType}`} onClick={(e) => e.stopPropagation()}>
              <button className="edit-article-modal-close" onClick={() => {closeModal(); navigate(-1);}}>
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
}

export default EditArticle;