import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { getProfilePath } from '../utils/profileRoutes';

const CommentItem = ({
  comment,
  currentUser,
  isReply = false,
  onReply,
  onEdit,
  onDelete,
  fetchUserAvatar,
  formatDate,
  getAvatarColor,
}) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [resolvedAvatar, setResolvedAvatar] = useState(comment.user?.avatar || null);

  useEffect(() => {
    setEditText(comment.content || '');
  }, [comment.content]);

  useEffect(() => {
    let mounted = true;

    const resolveAvatar = async () => {
      if (comment.user?.avatar) {
        setResolvedAvatar(comment.user.avatar);
        return;
      }

      if (fetchUserAvatar && comment.user?._id) {
        try {
          const avatar = await fetchUserAvatar(comment.user._id);
          if (mounted && avatar) {
            setResolvedAvatar(avatar);
          }
        } catch (error) {
          console.error('Error resolving commenter avatar:', error);
        }
      }
    };

    resolveAvatar();
    return () => {
      mounted = false;
    };
  }, [comment.user?._id, comment.user?.avatar, fetchUserAvatar]);

  const handleSubmitReply = async () => {
    if (!replyContent.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    if (!currentUser) {
      toast.error('Please login to reply');
      return;
    }

    if (!onReply) return;

    setSubmittingReply(true);
    try {
      await onReply(comment._id, replyContent.trim());
      setReplyContent('');
      setShowReplyInput(false);
    } catch (error) {
      console.error('Error posting reply:', error);
      toast.error('Failed to post reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    if (!onEdit) return;

    try {
      await onEdit(comment._id, editText.trim());
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    try {
      await onDelete(comment._id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const commenterName = comment.user?.name || 'Anonymous';
  const commenterId = comment.user?._id;
  const avatarColor = getAvatarColor?.(commenterName) || 'bg-gradient-to-br from-gray-500 to-gray-700';

  return (
    <>
      <div className={`${isReply ? 'ml-10 mt-3' : 'mt-4'} animate-fadeIn`}>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Link
                to={getProfilePath(commenterId)}
                className="block w-9 h-9 rounded-full overflow-hidden bg-gray-100 shadow-sm"
                aria-label={`View ${commenterName}'s profile`}
              >
                {resolvedAvatar ? (
                  <img
                    src={resolvedAvatar}
                    alt={commenterName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?background=1e293b&color=fff&size=100&name=${commenterName}`;
                    }}
                  />
                ) : (
                  <div className={`w-full h-full ${avatarColor} flex items-center justify-center text-white text-sm font-bold`}>
                    {commenterName.charAt(0).toUpperCase()}
                  </div>
                )}
              </Link>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Link to={getProfilePath(commenterId)} className="font-semibold text-sm text-gray-900 hover:text-gray-700 transition-colors">
                  {commenterName}
                </Link>
                <span className="text-xs text-gray-400">
                  {formatDate ? formatDate(comment.createdAt) : ''}
                </span>
                {comment.isEdited && (
                  <span className="text-xs text-gray-400 italic">(edited)</span>
                )}
              </div>

              {isEditing ? (
                <div className="mt-2">
                  <textarea
                    rows="3"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleSaveEdit}
                      className="px-3 py-1.5 text-xs bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditText(comment.content || '');
                        setIsEditing(false);
                      }}
                      className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 text-sm mt-1 leading-relaxed">{comment.content}</p>
              )}

              {!isEditing && (
                <div className="flex items-center gap-4 mt-2">
                  <button
                    onClick={() => setShowReplyInput((prev) => !prev)}
                    className="text-xs text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    Reply
                  </button>
                  {(currentUser?._id === comment.user?._id || currentUser?.role === 'admin') && (
                    <>
                      <button
                        onClick={() => {
                          setEditText(comment.content || '');
                          setIsEditing(true);
                        }}
                        className="text-xs text-blue-500 hover:text-blue-700 transition-colors flex items-center gap-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="text-xs text-red-500 hover:text-red-700 transition-colors flex items-center gap-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </>
                  )}
                </div>
              )}

              {showReplyInput && (
                <div className="mt-3">
                  <textarea
                    rows="2"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={`Reply to ${commenterName}...`}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 bg-gray-50"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleSubmitReply}
                      disabled={submittingReply || !replyContent.trim()}
                      className="px-3 py-1.5 text-xs bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                    >
                      {submittingReply ? 'Posting...' : 'Post Reply'}
                    </button>
                    <button
                      onClick={() => setShowReplyInput(false)}
                      className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {comment.replies?.map((reply) => (
          <CommentItem
            key={reply._id}
            comment={reply}
            isReply
            currentUser={currentUser}
            onReply={onReply}
            onEdit={onEdit}
            onDelete={onDelete}
            fetchUserAvatar={fetchUserAvatar}
            formatDate={formatDate}
            getAvatarColor={getAvatarColor}
          />
        ))}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Comment?</h3>
            </div>
            <p className="text-gray-600 mb-6">
              This action cannot be undone. This comment will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CommentItem;
