import React from 'react';
import { FiStar, FiEdit } from 'react-icons/fi';
import './RatingsSection.css';

function RatingsSection({ 
  hasUserRated, 
  userRating, 
  rating, 
  setRating, 
  onRatingClick, 
  onEditRating 
}) {
  return (
    <div className="rating-section">
      <h2>{hasUserRated ? 'Your Rating' : 'Rate This Article'}</h2>
      {hasUserRated ? (
        <div className="user-rating-display">
          <div className="star-rating-display">
            {[1, 2, 3, 4, 5].map((star) => (
              <FiStar
                key={star}
                className={`star-display ${userRating >= star ? 'filled' : ''}`}
              />
            ))}
          </div>
          <p className="rating-value">You rated: {userRating} / 5</p>
          <button className="btn-edit-rating" onClick={onEditRating}>
            <FiEdit />
            Edit Rating
          </button>
        </div>
      ) : (
        <div className="rating-input-container">
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <FiStar
                key={star}
                className={`star ${rating >= star ? 'active' : ''}`}
                onClick={() => onRatingClick(star)}
                onMouseEnter={() => !hasUserRated && setRating(star)}
                onMouseLeave={() => !hasUserRated && setRating(userRating || 0)}
              />
            ))}
          </div>
          <p className="rating-helper">Click a star to rate from 1 to 5</p>
        </div>
      )}
    </div>
  );
}

export default RatingsSection;
