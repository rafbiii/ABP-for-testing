import React, { useState } from 'react';
import { FiStar, FiEdit, FiTrash2, FiCheckCircle, FiUser, FiChevronDown, FiMessageCircle, FiSend, FiX } from 'react-icons/fi';
import './CommentsSection.css';

// Recursive Reply Item Component
const ReplyItem = ({
  reply,
  ratings,
  onReply,
  replyingToCommentId,
  replyContent,
  setReplyContent,
  isSubmittingReply,
  handleSubmitReply,
  handleCancelReply,
  getUserRating,
  currentUserEmail,
  editingCommentId,
  editCommentContent,
  setEditCommentContent,
  handleEditComment,
  handleCancelEdit,
  handleSaveEdit,
  handleDeleteComment,
  handleUserClick
}) => {
  const replyUserRating = getUserRating(reply.user_email);
  const isReplying = replyingToCommentId === reply.comment_id;
  const hasNestedReplies = reply.replies && reply.replies.length > 0;
  const isOwner = reply.user_email === currentUserEmail;
  const isEditing = editingCommentId === reply.comment_id;
  
  return (
    <div className="reply-item">
      <div className="comment-header">
        <div className="comment-author">
          <FiUser />
          <span
            className="author-name clickable"
            onClick={() => handleUserClick(reply.user_email)}
          >
            {reply.owner}
          </span>
          {replyUserRating !== null && (
            <div className="comment-user-rating">
              <FiStar className="rating-icon-small" />
              <span className="rating-value-small">{replyUserRating}</span>
            </div>
          )}
        </div>
        {!isEditing && isOwner && (
          <div className="comment-owner-actions">
            <button 
              className="btn-action-edit" 
              onClick={() => handleEditComment(reply.comment_id, reply.comment_content)}
            >
              <FiEdit />
              Edit
            </button>
            <button 
              className="btn-action-delete" 
              onClick={() => handleDeleteComment(reply.comment_id)}
            >
              <FiTrash2 />
              Delete
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="edit-comment-form">
          <textarea
            className="edit-textarea"
            value={editCommentContent}
            onChange={(e) => setEditCommentContent(e.target.value)}
            rows="4"
            maxLength={8192}
          />
          <div className="character-count">
            {editCommentContent.length} / 8192 characters
          </div>
          <div className="edit-buttons">
            <button className="btn-cancel-edit" onClick={handleCancelEdit}>
              <FiX />
              Cancel
            </button>
            <button 
              className="btn-save-edit" 
              onClick={() => handleSaveEdit(reply.comment_id)}
              disabled={!editCommentContent.trim()}
            >
              <FiCheckCircle />
              Save
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="comment-text">{reply.comment_content}</p>
          
          <div className="comment-actions">
            <button className="btn-reply" onClick={() => onReply(reply.comment_id)}>
              <FiMessageCircle />
              Reply
            </button>
          </div>
        </>
      )}

      {isReplying && !isEditing && (
        <div className="reply-form">
          <textarea
            className="reply-textarea"
            placeholder="Write your reply... (1-8192 characters)"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            rows="3"
            maxLength={8192}
          />
          <div className="character-count">
            {replyContent.length} / 8192 characters
          </div>
          <div className="reply-buttons">
            <button className="btn-cancel-reply" onClick={handleCancelReply}>
              <FiX />
              Cancel
            </button>
            <button 
              className="btn-submit-reply" 
              onClick={() => handleSubmitReply(reply.comment_id)}
              disabled={isSubmittingReply || !replyContent.trim()}
            >
              <FiSend />
              {isSubmittingReply ? 'Posting...' : 'Post Reply'}
            </button>
          </div>
        </div>
      )}

      {hasNestedReplies && (
        <div className="replies-container">
          {reply.replies.map((nestedReply) => (
            <ReplyItem
              key={nestedReply.comment_id}
              reply={nestedReply}
              ratings={ratings}
              onReply={onReply}
              replyingToCommentId={replyingToCommentId}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              isSubmittingReply={isSubmittingReply}
              handleSubmitReply={handleSubmitReply}
              handleCancelReply={handleCancelReply}
              getUserRating={getUserRating}
              currentUserEmail={currentUserEmail}
              editingCommentId={editingCommentId}
              editCommentContent={editCommentContent}
              setEditCommentContent={setEditCommentContent}
              handleEditComment={handleEditComment}
              handleCancelEdit={handleCancelEdit}
              handleSaveEdit={handleSaveEdit}
              handleDeleteComment={handleDeleteComment}
              handleUserClick={handleUserClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Comment component with collapsible replies
const CommentItem = ({ 
  comment, 
  ratings, 
  onReply, 
  replyingToCommentId,
  replyContent,
  setReplyContent,
  isSubmittingReply,
  handleSubmitReply,
  handleCancelReply,
  currentUserEmail,
  editingCommentId,
  editCommentContent,
  setEditCommentContent,
  handleEditComment,
  handleCancelEdit,
  handleSaveEdit,
  handleDeleteComment,
  handleUserClick
}) => {
  const [showReplies, setShowReplies] = useState(false);
  
  const getUserRating = (user_email) => {
    const userRatingObj = ratings.find((r) => r.user_email === user_email);
    return userRatingObj ? userRatingObj.rating_value : null;
  };

  const countAllReplies = (replies) => {
    let count = replies.length;
    replies.forEach(reply => {
      if (reply.replies && reply.replies.length > 0) {
        count += countAllReplies(reply.replies);
      }
    });
    return count;
  };

  const commentUserRating = getUserRating(comment.user_email);
  const hasReplies = comment.replies && comment.replies.length > 0;
  const totalRepliesCount = hasReplies ? countAllReplies(comment.replies) : 0;
  const isReplying = replyingToCommentId === comment.comment_id;
  const isOwner = comment.user_email === currentUserEmail;
  const isEditing = editingCommentId === comment.comment_id;
  
  return (
    <div className="comment-item">
      <div className="comment-header">
        <div className="comment-author">
          <FiUser />
          <span 
            className="author-name clickable"
            onClick={() => handleUserClick(comment.user_email)}
          >
            {comment.owner}
          </span>
          {commentUserRating !== null && (
            <div className="comment-user-rating">
              <FiStar className="rating-icon-small" />
              <span className="rating-value-small">{commentUserRating}</span>
            </div>
          )}
        </div>
        {!isEditing && isOwner && (
          <div className="comment-owner-actions">
            <button 
              className="btn-action-edit" 
              onClick={() => handleEditComment(comment.comment_id, comment.comment_content)}
            >
              <FiEdit />
              Edit
            </button>
            <button 
              className="btn-action-delete" 
              onClick={() => handleDeleteComment(comment.comment_id)}
            >
              <FiTrash2 />
              Delete
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="edit-comment-form">
          <textarea
            className="edit-textarea"
            value={editCommentContent}
            onChange={(e) => setEditCommentContent(e.target.value)}
            rows="4"
            maxLength={8192}
          />
          <div className="character-count">
            {editCommentContent.length} / 8192 characters
          </div>
          <div className="edit-buttons">
            <button className="btn-cancel-edit" onClick={handleCancelEdit}>
              <FiX />
              Cancel
            </button>
            <button 
              className="btn-save-edit" 
              onClick={() => handleSaveEdit(comment.comment_id)}
              disabled={!editCommentContent.trim()}
            >
              <FiCheckCircle />
              Save
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="comment-text">{comment.comment_content}</p>
          
          <div className="comment-actions">
            <button className="btn-reply" onClick={() => onReply(comment.comment_id)}>
              <FiMessageCircle />
              Reply
            </button>
          </div>
        </>
      )}

      {isReplying && !isEditing && (
        <div className="reply-form">
          <textarea
            className="reply-textarea"
            placeholder="Write your reply... (1-8192 characters)"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            rows="3"
            maxLength={8192}
          />
          <div className="character-count">
            {replyContent.length} / 8192 characters
          </div>
          <div className="reply-buttons">
            <button className="btn-cancel-reply" onClick={handleCancelReply}>
              <FiX />
              Cancel
            </button>
            <button 
              className="btn-submit-reply" 
              onClick={() => handleSubmitReply(comment.comment_id)}
              disabled={isSubmittingReply || !replyContent.trim()}
            >
              <FiSend />
              {isSubmittingReply ? 'Posting...' : 'Post Reply'}
            </button>
          </div>
        </div>
      )}

      {hasReplies && (
        <>
          <button 
            className={`show-replies-btn ${showReplies ? 'open' : ''}`}
            onClick={() => setShowReplies(!showReplies)}
          >
            <FiChevronDown />
            <span className="replies-count">
              {showReplies ? 'Hide' : 'Show'} {totalRepliesCount} {totalRepliesCount === 1 ? 'reply' : 'replies'}
            </span>
          </button>

          {showReplies && (
            <div className="replies-container">
              {comment.replies.map((reply) => (
                <ReplyItem
                  key={reply.comment_id}
                  reply={reply}
                  ratings={ratings}
                  onReply={onReply}
                  replyingToCommentId={replyingToCommentId}
                  replyContent={replyContent}
                  setReplyContent={setReplyContent}
                  isSubmittingReply={isSubmittingReply}
                  handleSubmitReply={handleSubmitReply}
                  handleCancelReply={handleCancelReply}
                  getUserRating={getUserRating}
                  currentUserEmail={currentUserEmail}
                  editingCommentId={editingCommentId}
                  editCommentContent={editCommentContent}
                  setEditCommentContent={setEditCommentContent}
                  handleEditComment={handleEditComment}
                  handleCancelEdit={handleCancelEdit}
                  handleSaveEdit={handleSaveEdit}
                  handleDeleteComment={handleDeleteComment}
                  handleUserClick={handleUserClick}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

function CommentsSection({
  comments,
  ratings,
  comment,
  setComment,
  isSubmittingComment,
  handleSubmitComment,
  replyingToCommentId,
  replyContent,
  setReplyContent,
  isSubmittingReply,
  handleReplyClick,
  handleSubmitReply,
  handleCancelReply,
  currentUserEmail,
  editingCommentId,
  editCommentContent,
  setEditCommentContent,
  handleEditComment,
  handleCancelEdit,
  handleSaveEdit,
  handleDeleteComment,
  organizedComments,
  handleUserClick
}) {
  return (
    <>
      {/* Comment Input Section */}
      <div className="rating-section">
        <h2>Share Your Thoughts</h2>
        <form onSubmit={handleSubmitComment}>
          <div className="comment-input">
            <textarea
              placeholder="Write your comment here... (1-8192 characters)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="4"
              maxLength={8192}
            />
            <div className="character-count">
              {comment.length} / 8192 characters
            </div>
            <button 
              type="submit" 
              className="btn-submit"
              disabled={isSubmittingComment || !comment.trim()}
            >
              <FiSend />
              {isSubmittingComment ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="comments-section">
        <h2>Comments ({comments.length})</h2>
        {comments.length === 0 ? (
          <p className="no-comments">No comments yet. Be the first to comment!</p>
        ) : (
          <div className="comments-list">
            {organizedComments.map((comment) => (
              <CommentItem 
                key={comment.comment_id} 
                comment={comment}
                ratings={ratings}
                onReply={handleReplyClick}
                replyingToCommentId={replyingToCommentId}
                replyContent={replyContent}
                setReplyContent={setReplyContent}
                isSubmittingReply={isSubmittingReply}
                handleSubmitReply={handleSubmitReply}
                handleCancelReply={handleCancelReply}
                currentUserEmail={currentUserEmail}
                editingCommentId={editingCommentId}
                editCommentContent={editCommentContent}
                setEditCommentContent={setEditCommentContent}
                handleEditComment={handleEditComment}
                handleCancelEdit={handleCancelEdit}
                handleSaveEdit={handleSaveEdit}
                handleDeleteComment={handleDeleteComment}
                handleUserClick={handleUserClick}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default CommentsSection;