import React from 'react';
import { FiStar, FiEdit, FiFlag, FiTrash2 } from 'react-icons/fi';
import './ArticleSection.css';

function ArticleSection({ 
  article, 
  averageRating, 
  ratingCount, 
  userclass, 
  onEdit, 
  onDelete, 
  onReport 
}) {
  if (!article) return null;

  return (
    <div className="article-detail">
      {article.image && (
        <div className="laptop-image">
          <img src={`data:image/jpeg;base64,${article.image}`} alt={article.title} />
        </div>
      )}

      <div className="article-header">
        <div className="header-accent"></div>
        <h1>{article.title}</h1>
        
        {article.tag && (
          <div className="tag-container">
            <span className="article-tag">{article.tag}</span>
          </div>
        )}
        
        {ratingCount > 0 && (
          <div className="average-rating-display">
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                  key={star}
                  className={`star-display ${parseFloat(averageRating) >= star ? 'filled' : ''}`}
                />
              ))}
            </div>
            <span className="rating-text">
              {averageRating} / 5 ({ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'})
            </span>
          </div>
        )}
        
        <div className="header-actions">
          {userclass === 'admin' && (
            <>
              <button className="btn-edit" onClick={onEdit}>
                <FiEdit />
                Edit
              </button>
              <button className="btn-delete" onClick={onDelete}>
                <FiTrash2 />
                Delete
              </button>
            </>
          )}
          <button className="btn-report" onClick={onReport}>
            <FiFlag />
            Report
          </button>
        </div>
      </div>

      <div className="article-body">
        <p>{article.content}</p>
      </div>
    </div>
  );
}

export default ArticleSection;
