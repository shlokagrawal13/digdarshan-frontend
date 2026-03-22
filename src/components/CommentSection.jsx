import React from 'react';
import { FaComment, FaEye } from 'react-icons/fa';
import ErrorBoundary from './ErrorBoundary';

class CommentSectionContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null
    };
  }

  static getDerivedStateFromError(error) {
    return { error: error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Comment Section Error:', error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
          <h3 className="text-red-600 font-medium mb-2">Error Loading Comments</h3>
          <p className="text-gray-600 mb-4">Sorry, there was a problem loading the comments. Please try refreshing the page.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return (
      <div className="mt-8" id="commentsSection" ref={this.props.commentsSectionRef}>
        {this.props.children}
      </div>
    );
  }
}

const CommentSection = (
  {
  comments,
  selectedComment,
  setSelectedComment,
  replyTo,
  handleReplyClick,
  handleCancelReply,
  handleComment,
  isSubmitting,
  newComment,
  setNewComment,
  name,
  setName,
  email,
  setEmail,
  website,
  setWebsite,
  saveInfo,
  setSaveInfo,
  replyFormRefs,
  commentsSectionRef
}) => {
  // Helper function to format date and time
  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('hi-IN', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const [currentPage, setCurrentPage] = React.useState(1);
  const commentsPerPage = 10;
  const topLevelComments = comments?.filter(c => !c.parentId) || [];
  const totalPages = Math.ceil(topLevelComments.length / commentsPerPage);
  const paginatedComments = topLevelComments.slice((currentPage - 1) * commentsPerPage, currentPage * commentsPerPage);

  return (
    <ErrorBoundary>
      <CommentSectionContent commentsSectionRef={commentsSectionRef}>
        {selectedComment ? (
          <div className="mb-6">
            <h3 className="text-lg font-bold border-b border-gray-200 pb-2 mb-4">
              Selected Comment
              <button 
                onClick={() => setSelectedComment(null)}
                className="ml-4 text-sm text-gray-500 hover:text-red-500"
              >
                Back to all comments
              </button>
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start gap-3 bg-white p-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-medium">
                    {selectedComment.name ? selectedComment.name[0].toUpperCase() : '?'}
                  </span>
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                     {selectedComment.website && (
                      <a href={selectedComment.website} target="_blank" rel="noopener noreferrer" 
                        className="text-blue-600 text-sm hover:underline"
                      >
                                            <span className="font-medium">{selectedComment.name || 'Anonymous'}</span>
                      </a>
                    )}

                    {/* {selectedComment.website && (
                      <a href={selectedComment.website} target="_blank" rel="noopener noreferrer" 
                        className="text-blue-600 text-sm hover:underline"
                      >
                        {new URL(selectedComment.website).hostname}
                      </a>
                    )} */}
                    <span className="text-gray-500 text-sm">•</span>
                    <span className="text-gray-500 text-sm">
                      {formatDateTime(selectedComment.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-800 mb-2">{selectedComment.content}</p>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleReplyClick(selectedComment._id)}
                      className="text-blue-600 text-sm hover:underline flex items-center gap-1"
                      aria-label={`Reply to ${selectedComment.name}'s comment`}
                    >
                      <FaComment size={12} />
                      Reply
                    </button>
                  </div>
                </div>
              </div>

              {/* Show replies for selected comment */}
              {selectedComment.replies?.length > 0 && (
                <div className="mt-4 ml-12 space-y-4 bg-white p-4">
                  {selectedComment.replies.filter((reply, index, self) => 
                    index === self.findIndex((r) => r._id === reply._id)
                  ).map((reply, index) => (
                    <div key={`reply-${reply._id}-${index}`} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium text-sm">
                          {reply.name ? reply.name[0].toUpperCase() : '?'}
                        </span>
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-1">
                          {reply.website && (
                            <a href={reply.website} target="_blank" rel="noopener noreferrer" 
                              className="text-blue-600 text-sm hover:underline"
                            >
                            <span className="font-medium">{reply.name || 'Anonymous'}</span>
                            </a>
                          )}
                         
                          {/* {reply.website && (
                            <a href={reply.website} target="_blank" rel="noopener noreferrer" 
                              className="text-blue-600 text-sm hover:underline"
                            >
                              {new URL(reply.website).hostname}
                            </a>
                          )} */}
                          <span className="text-gray-500 text-sm">•</span>
                          <span className="text-gray-500 text-sm">
                            {formatDateTime(reply.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-800 mb-2">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Inline Reply Form for selected comment */}
              {replyTo === selectedComment._id && (
                <div 
                  ref={el => replyFormRefs.current[selectedComment._id] = el}
                  className="mt-4 ml-0 sm:ml-12 bg-white p-4 rounded-lg transition-all duration-300 ease-in-out"
                >
                  <h4 className="text-lg font-bold mb-4 flex justify-between items-center">
                    <span>Reply to {selectedComment.name}</span>
                    <button 
                      onClick={handleCancelReply}
                      className="ml-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
                    >
                      Cancel
                    </button>
                  </h4>
                  <form onSubmit={(e) => handleComment(e, replyTo)} className="space-y-4">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                      rows="4"
                      placeholder="Write your reply..."
                      required
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                        placeholder="Name *"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                      <input
                        type="email"
                        className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                        placeholder="Email *"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      <input
                        type="url"
                        className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                        placeholder="Website (optional)"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input
                          type="checkbox"
                          checked={saveInfo}
                          onChange={(e) => setSaveInfo(e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        Save my info for next time
                      </label>
                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className={`bg-blue-600 text-white px-6 py-2 rounded-lg ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'} transition-all flex items-center gap-2`}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Posting...
                          </>
                        ) : 'Post Reply'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <h3 className="text-lg font-bold border-b border-gray-200 pb-2 mb-4">COMMENTS ({comments.length})</h3>
            <div className="space-y-6">
              {paginatedComments.map((comment) => (
                <div key={comment._id} className="border-b border-gray-100 pb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-medium">
                        {comment.name ? comment.name[0].toUpperCase() : '?'}
                      </span>
                    </div>
                    <div className="flex-grow px-4 py-1 bg-gray-50">
                      <div className="flex items-center gap-2 mb-1 ">
                         {comment.website && (
                          <a href={comment.website} target="_blank" rel="noopener noreferrer" 
                            className="text-blue-600 text-sm hover:underline"
                          >
                                                  <span className="font-medium">{comment.name || 'Anonymous'}</span>

                          </a>
                        )}
                        {/* {comment.website && (
                          <a href={comment.website} target="_blank" rel="noopener noreferrer" 
                            className="text-blue-600 text-sm hover:underline"
                          >
                            {new URL(comment.website).hostname}
                          </a>
                        )} */}
                        <span className="text-gray-500 text-sm">•</span>
                        <span className="text-gray-500 text-sm">
                          {formatDateTime(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-800 mb-2">{comment.content}</p>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleReplyClick(comment._id)}
                          className="text-blue-600 text-sm hover:underline flex items-center gap-1"
                          aria-label={`Reply to ${comment.name}'s comment`}
                        >
                          <FaComment size={12} />
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>

                  {comment.replies?.length > 0 && (
                    <div className="mt-4 ml-12 space-y-4">
                      {comment.replies.filter((reply, index, self) => 
                        // Filter out duplicates based on _id
                        index === self.findIndex((r) => r._id === reply._id)
                      ).map((reply, index) => (
                        <div key={`reply-${reply._id}-${index}`} className="flex items-start gap-3 ">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 font-medium text-sm">
                              {reply.name ? reply.name[0].toUpperCase() : '?'}
                            </span>
                          </div>
                          <div className="flex-grow px-4 py-1 bg-gray-50">
                            <div className="flex items-center gap-2 mb-1">
                               {reply.website && (
                                <a href={reply.website} target="_blank" rel="noopener noreferrer" 
                                  className="text-blue-600 text-sm hover:underline"
                                >
                                   <span className="font-medium">{reply.name || 'Anonymous'}</span>
                                </a>
                              )}
                            
                              {/* {reply.website && (
                                <a href={reply.website} target="_blank" rel="noopener noreferrer" 
                                  className="text-blue-600 text-sm hover:underline"
                                >
                                  {new URL(reply.website).hostname}
                                </a>
                              )} */}
                              <span className="text-gray-500 text-sm">•</span>
                              <span className="text-gray-500 text-sm">
                                {formatDateTime(reply.createdAt)}
                              </span>
                            </div>
                            <p className="text-gray-800 mb-2">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Inline Reply Form */}
                  {replyTo === comment._id && (
                    <div 
                      ref={el => replyFormRefs.current[comment._id] = el}
                      className="mt-4 ml-0 sm:ml-12 bg-gray-50 p-4 rounded-lg transition-all duration-300 ease-in-out"
                    >
                      <h4 className="text-lg font-bold mb-4 flex justify-between items-center">
                        <span>Reply to {comment.name}</span>
                        <button 
                          onClick={handleCancelReply}
                          className="ml-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
                        >
                          Cancel
                        </button>
                      </h4>
                      <form onSubmit={(e) => handleComment(e, replyTo)} className="space-y-4">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                          rows="4"
                          placeholder="Write your reply..."
                          required
                        />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <input
                            type="text"
                            className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                            placeholder="Name *"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                          />
                          <input
                            type="email"
                            className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                            placeholder="Email *"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                          <input
                            type="url"
                            className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                            placeholder="Website (optional)"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 text-sm text-gray-600">
                            <input
                              type="checkbox"
                              checked={saveInfo}
                              onChange={(e) => setSaveInfo(e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            Save my info for next time
                          </label>
                          <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className={`bg-blue-600 text-white px-6 py-2 rounded-lg ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'} transition-all flex items-center gap-2`}
                          >
                            {isSubmitting ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Posting...
                              </>
                            ) : 'Post Reply'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-6">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded bg-gray-200 text-gray-700 font-medium transition-colors ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300'}`}
                >
                  Previous
                </button>
                <span className="text-gray-600">Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded bg-gray-200 text-gray-700 font-medium transition-colors ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300'}`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </CommentSectionContent>
    </ErrorBoundary>
  );
};

export default CommentSection;
