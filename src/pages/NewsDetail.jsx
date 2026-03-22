import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FaThumbsUp, FaComment, FaEye, FaShare, FaFacebookF, FaTwitter, FaWhatsapp } from "react-icons/fa";
import AuthPrompt from '../components/AuthPrompt';
import CommentSection from '../components/CommentSection';
import io from 'socket.io-client';
import ViewTracker from '../components/ViewTracker';

const commentHighlightStyle = `
@keyframes highlight {
  0% { background-color: transparent; }
  30% { background-color: rgba(59, 130, 246, 0.1); }
  100% { background-color: transparent; }
}

.highlight-comment {
  animation: highlight 2s ease-out;
}
`;

const NewsDetail = ({title, apiUrl}) => {
  const { id } = useParams();
  const navigate = useNavigate();  // Add refs for scrolling and reply handling
  const commentsSectionRef = useRef(null);
  const commentFormRef = useRef(null);
  const replyFormRefs = useRef({});
  const cleanupTimeout = useRef(null);
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [popularNews, setPopularNews] = useState([]);
  const [recentNews, setRecentNews] = useState([]);
  const [likes, setLikes] = useState(0);
  const [views, setViews] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [socket, setSocket] = useState(null);
  const [hasLiked, setHasLiked] = useState(false);  const [name, setName] = useState(() => {
    const savedInfo = localStorage.getItem('commentInfo');
    return savedInfo ? JSON.parse(savedInfo).name : "";
  });
  const [email, setEmail] = useState(() => {
    const savedInfo = localStorage.getItem('commentInfo');
    return savedInfo ? JSON.parse(savedInfo).email : "";
  });
  const [website, setWebsite] = useState(() => {
    const savedInfo = localStorage.getItem('commentInfo');
    return savedInfo ? JSON.parse(savedInfo).website : "";
  });
  const [saveInfo, setSaveInfo] = useState(!!localStorage.getItem('commentInfo'));
  const [replyTo, setReplyTo] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const [comments, setComments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visibleCommentCount, setVisibleCommentCount] = useState(10);
  const [visiblePopularCount, setVisiblePopularCount] = useState(5);

  const handleLoadMoreComments = () => {
    setVisibleCommentCount(prev => prev + 10);
  };

  const handleLoadLessComments = () => {
    setVisibleCommentCount(10);
  };

  const handleLoadMorePopular = () => {
    setVisiblePopularCount((prev) => prev + 5);
  };
  const handleLoadLessPopular = () => {
    setVisiblePopularCount(5);
  };

  // Load comments in one place
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/social/${id}/comments`);
        if (data.success && Array.isArray(data.comments)) {
          setComments(data.comments);
          // If there's a selected comment, update it with fresh data
          if (selectedComment) {
            const updatedSelectedComment = data.comments.find(c => c._id === selectedComment._id);
            if (updatedSelectedComment) {
              setSelectedComment(updatedSelectedComment);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch comments:', err);
      }
    };

    if (id) {
      fetchComments();
    }

    // Setup an interval to refresh comments periodically
    const interval = setInterval(fetchComments, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [id, selectedComment?._id]);
  // Socket setup with improved handling
  useEffect(() => {
    const newSocket = io(`${process.env.REACT_APP_API_URL}`, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      if (id) {
        newSocket.emit('joinPost', id);
      }
    });    // Enhanced comment event handler with proper data handling
    newSocket.on('newComment', ({ comment, parentId }) => {
      if (!comment?._id || !comment?.name) return;

      setComments(prev => {
        // Check for duplicates
        const commentExists = parentId 
          ? prev.some(c => c._id === parentId && c.replies?.some(r => r._id === comment._id))
          : prev.some(c => c._id === comment._id);

        if (commentExists) return prev;

        // Create a properly formatted comment object
        const formattedComment = {
          ...comment,
          _id: comment._id,
          name: comment.name,
          email: comment.email,
          website: comment.website,
          content: comment.content,
          createdAt: comment.createdAt || new Date().toISOString(),
          replies: comment.replies || []
        };

        if (parentId) {
          return prev.map(c => {
            if (c._id === parentId) {
              const replies = c.replies || [];
              const updatedReplies = [...replies];
              
              // Only add if not already present
              if (!updatedReplies.some(r => r._id === formattedComment._id)) {
                updatedReplies.push(formattedComment);
                updatedReplies.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
              }
              
              return {
                ...c,
                replies: updatedReplies
              };
            }
            return c;
          });
        }

        return [formattedComment, ...prev];
      });
    });

    // Other socket events
    newSocket.on('viewUpdate', ({ viewCount }) => {
      setViews(viewCount);
    });

    newSocket.on('likeUpdate', ({ count }) => {
      setLikes(parseInt(count));
    });

    return () => {
      if (id) {
        newSocket.emit('leavePost', id);
      }
      newSocket.disconnect();
    };
  }, [id]);

  // useEffect to fetch news data from API
  // Removed localStorage fetching to avoid quota exceeded errors
  const handleReadMore = (newsId, newsData) => {
    localStorage.setItem("currentNewsId", newsId);
    const token = localStorage.getItem("token");

    if (!token) {
      localStorage.setItem("intendedPath", `/news-detail/${newsId}`);
      navigate("/login");
    } else {
      navigate(`/news-detail/${newsId}`);
    }
  };
  const handleViewCountUpdate = useCallback((newCount) => {
    console.log('View count updated:', newCount);
    setViews(newCount);
  }, []);

  const preventContextMenu = (e) => {
    e.preventDefault();
  };

  const preventCopy = (e) => {
    e.preventDefault();
    return false;
  };
  // Second useEffect to fetch from server if not in localStorage
  useEffect(() => {
    const fetchFromServer = async () => {
      if (!id || news) return; // Skip if we already have news from localStorage

      try {
        setLoading(true);
        setError(null);

        // Try each category until we find the article
        const categories = [
          'national', 'international', 'business', 'sports', 'state', 
          'entertainment', 'madhyapradesh', 'uttarpradesh', 'chhattisgarh',
          'otherstates', 'horoscope', 'technology', 'health', 'education', 'lifestyle'
        ];

        let foundArticle = null;
        let foundCategory = null;

        for (const category of categories) {
          try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/news/${category}`);
            if (response.data?.posts) {
              const article = response.data.posts.find(post => post._id === id);
              if (article) {
                foundArticle = article;
                foundCategory = category;
                break;
              }
            }
          } catch (err) {
            console.error(`Error checking ${category}:`, err);
          }
        }

        if (foundArticle) {
          // Set the main article data
          setNews(foundArticle);
          setLikes(foundArticle.likes || 0);
          setViews(foundArticle.views || 0);
          setComments(foundArticle.comments || []);

          // Fetch popular news from the same category
          try {
            const categoryResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/news/${foundCategory}`);
            if (categoryResponse.data?.posts) {
              // Filter out current article
              const otherNews = categoryResponse.data.posts
                .filter(post => post._id !== id)
                .map(post => ({
                  ...post,
                  category: foundCategory // Add category info
                }));

              // Get view counts
              const newsWithViews = await Promise.all(
                otherNews.map(async (post) => {
                  try {
                    const statsRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/social/${post._id}/stats`);
                    return {
                      ...post,
                      views: statsRes.data.viewCount || 0
                    };
                  } catch (err) {
                    return { ...post, views: 0 };
                  }
                })
              );              // Sort by views (descending)
              const sortedByViews = newsWithViews.sort((a, b) => (b.views || 0) - (a.views || 0));
              setPopularNews(sortedByViews); // <-- Remove .slice(0, 4) here

              // Sort by date for recent news
              const sortedByDate = [...newsWithViews].sort((a, b) => new Date(b.date) - new Date(a.date));
              setRecentNews(sortedByDate.slice(0, 3));
            }
          } catch (err) {
            console.error("Error fetching popular news:", err);
          }
        } else {
          setError("News article not found");
        }
      } catch (err) {
        console.error("Error fetching news:", err);
        setError("Failed to fetch news. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFromServer();
  }, [id, news]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    
    const initializePost = async () => {      try {
        const statsRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/social/${id}/stats`);
        if (statsRes.data) {
          setLikes(statsRes.data.likeCount);
          setViews(statsRes.data.viewCount);
          // Don't set comments from stats endpoint
        }

        if (isAuthenticated) {
          const likeStatusRes = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/social/${id}/like/status`,
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
          );
          setHasLiked(likeStatusRes.data.hasLiked);
        }
      } catch (err) {
        console.error('Failed to initialize post:', err);
      }
    };

    initializePost();
  }, [id, isAuthenticated]);

  // Cleanup reply form refs when unmounting
  useEffect(() => {
    return () => {
      replyFormRefs.current = {};
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('viewUpdate', ({ viewCount }) => {
        setViews(viewCount);
      });

      return () => socket.off('viewUpdate');
    }
  }, [socket]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/social/${id}/like`,
        null,
        { headers: { Authorization: `Bearer ${token}` }}
      );

      if (data.success) {
        setLikes(data.count);
        setHasLiked(data.hasLiked);
      }
    } catch (err) {
      console.error("Failed to like:", err);
    }
  };  // Comprehensive comment validation and submission
const handleComment = async (e, parentId = null) => {
  e.preventDefault();
    
  if (!isAuthenticated) {
    setShowAuthPrompt(true);
    return;
  }

  const errors = [];
  const trimmedComment = newComment.trim();
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const trimmedWebsite = website.trim();
  
  if (!trimmedComment) {
    errors.push('Please enter a comment');
  }
  if (!trimmedName) {
    errors.push('Please enter your name');
  }
  if (!trimmedEmail) {
    errors.push('Please enter your email');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    errors.push('Please enter a valid email address');
  }
  if (trimmedWebsite && !/^https?:\/\/.+/.test(trimmedWebsite)) {
    errors.push('Please enter a valid website URL starting with http:// or https://');
  }

  if (errors.length > 0) {
    alert(errors.join('\n'));
    return;
  }

  // Prevent double submission
  if (isSubmitting) return;

  setIsSubmitting(true);
  try {
    // Save user info if checkbox is checked
    if (saveInfo) {
      localStorage.setItem('commentInfo', JSON.stringify({ 
        name: trimmedName, 
        email: email.trim(), 
        website: website.trim() 
      }));
    } else {
      localStorage.removeItem('commentInfo');
    }

    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token is missing');
    }    const { data } = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/social/${id}/comment`,
      { 
        content: trimmedComment,
        name: trimmedName,
        email: trimmedEmail,
        website: trimmedWebsite || undefined,
        parentId
      },
      { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (data.success && data.comment) {
      setNewComment('');
      
      // Create a properly formatted comment object
      const formattedComment = {
        ...data.comment,
        _id: data.comment._id,
        name: trimmedName,
        email: trimmedEmail,
        website: trimmedWebsite || undefined,
        content: trimmedComment,
        createdAt: new Date().toISOString(),
        replies: []
      };

      // Update the comments state immediately
      setComments(prevComments => {
        // Check for existing comment to prevent duplicates
        const commentExists = (comment) => comment._id === formattedComment._id;
        
        if (parentId) {
          return prevComments.map(c => {
            if (c._id === parentId) {
              const existingReplies = c.replies || [];
              // Only add reply if it doesn't exist
              if (!existingReplies.some(commentExists)) {
                return {
                  ...c,
                  replies: [...existingReplies, formattedComment]
                };
              }
            }
            return c;
          });
        }

        // Only add top-level comment if it doesn't exist
        return prevComments.some(commentExists) 
          ? prevComments 
          : [formattedComment, ...prevComments];
      });

      // Update comments state right after the above setComments call
      if (selectedComment && parentId === selectedComment._id) {
        // Update selectedComment state with new reply
        setSelectedComment(prev => ({
          ...prev,
          replies: [...(prev.replies || []), formattedComment]
        }));
      }

      if (parentId) {
        setReplyTo(null);
      } else {
        setTimeout(() => {
          if (commentsSectionRef.current) {
            const navbarHeight = 80;
            const safetyMargin = 120;
            const elementPosition = commentsSectionRef.current.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - (navbarHeight + safetyMargin);
            window.scrollTo({
              top: Math.max(0, offsetPosition),
              behavior: 'smooth'
            });
          }
        }, 500);
      }
    } else {
      throw new Error(data.message || 'Failed to post comment');
    }
  } catch (err) {
    console.error('Failed to post comment:', err);
    alert(err.message || 'Failed to post comment. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};
  const categorySlugMap = {
    "राष्ट्रीय": "national",
    "अंतर्राष्ट्रीय": "international",
    "कारोबार": "business",
    "मध्य प्रदेश": "madhyapradesh",
    "खेल": "sports",
    "राज्य": "state",
    "मनोरंजन": "entertainment",
    "छत्तीसगढ़": "chhattisgarh",
    "अन्य राज्य": "otherstates",
    "उत्तर प्रदेश": "uttarpradesh",
    "राशिफल": "horoscope",
    "टेक्नोलॉजी": "technology",
    "स्वास्थ्य": "health",
    "शिक्षा": "education",
    "लाइफस्टाइल": "lifestyle"
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: news.title,
          text: news.body.substring(0, 100),
          url: window.location.href
        });
      }
    } catch (err) {
      console.error("Failed to share:", err);
    }
  };  // Comment form refs and scrolling
  const cleanupRefs = useCallback(() => {
    Object.keys(replyFormRefs.current).forEach(key => {
      if (!document.contains(replyFormRefs.current[key])) {
        delete replyFormRefs.current[key];
      }
    });
  }, []);
  const scrollToElement = useCallback((element) => {
    if (!element) return;
    const navbarHeight = 120; // Height of the navbar
    const safetyMargin = 120; // Increased safety margin for better spacing
    const offset = navbarHeight + safetyMargin;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    window.scrollTo({
      top: Math.max(0, offsetPosition),
      behavior: 'smooth'
    });
  }, []);

  const scrollToReplyForm = useCallback((commentId) => {
    setReplyTo(commentId);
    
    // Wait for state update and form to mount
    requestAnimationFrame(() => {
      try {
        const replyFormRef = replyFormRefs.current[commentId];
        if (replyFormRef && document.contains(replyFormRef)) {
          scrollToElement(replyFormRef);
          const textarea = replyFormRef.querySelector('textarea');
          if (textarea) {
            setTimeout(() => textarea.focus(), 800);
          }
        }
      } catch (error) {
        console.error('Error scrolling to reply form:', error);
      }
    });
  }, [scrollToElement]);
  // Clear reply form refs when comments change 
  useEffect(() => {
    replyFormRefs.current = {};
  }, [comments]);

  // Handle reply and cancel actions
  const handleReplyClick = useCallback((commentId) => {
    setReplyTo(commentId);
    
    // Wait for state update and form to mount
    requestAnimationFrame(() => {
      try {
        const replyFormRef = replyFormRefs.current[commentId];
        if (replyFormRef && document.contains(replyFormRef)) {
          scrollToElement(replyFormRef);
          const textarea = replyFormRef.querySelector('textarea');
          if (textarea) {
            setTimeout(() => textarea.focus(), 800);
          }
        }
      } catch (error) {
        console.error('Error scrolling to reply form:', error);
      }
    });
  }, [scrollToElement]);

  const handleCancelReply = useCallback(() => {
    setReplyTo(null);
  }, []);
  // Add a new function to handle smooth scrolling with offset
  const scrollToElementWithOffset = useCallback((element, offset = 250) => {
    if (!element) return;
    
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }, []);

  // Update the comment icon click handler
  const handleCommentIconClick = useCallback(() => {
    if (commentFormRef.current) {
      scrollToElement(commentFormRef.current);
      const textarea = commentFormRef.current.querySelector('textarea');
      if (textarea) {
        setTimeout(() => textarea.focus(), 800);
      }
    }
  }, [scrollToElement]);
  // Update the recent comment click handler
  const handleRecentCommentClick = useCallback((comment) => {
    setSelectedComment(comment);
    if (commentsSectionRef.current) {
      scrollToElement(commentsSectionRef.current);
    }
  }, [scrollToElement]);

  // Update post comment scroll behavior
  // useEffect(() => {
  //   if (comments.length > 0 && commentsSectionRef.current) {
  //     const shouldScroll = comments[0]?._id === comments[comments.length - 1]?._id;
  //     if (shouldScroll) {
  //       scrollToElement(commentsSectionRef.current);
  //     }
  //   }
  // }, [comments, scrollToElement]);

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto p-8">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="mt-8 space-y-4">
            <div className="h-64 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1200px] mx-auto p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-600 font-medium mb-2">Error Loading Article</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="max-w-[1200px] mx-auto p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h2 className="text-yellow-600 font-medium mb-2">Article Not Found</h2>
          <p className="text-gray-600 mb-4">The article you're looking for could not be found.</p>
          <button 
            onClick={() => navigate('/')} 
            className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  // Rest of the component return statement
  return (
    <div 
      className="max-w-[1200px] mx-auto bg-white select-none"
      onContextMenu={preventContextMenu}
      onCopy={preventCopy}
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        msUserSelect: 'none',
        MozUserSelect: 'none'
      }}
    >
      <style>{commentHighlightStyle}</style>
      
      <header className="border-b border-gray-200 py-2 px-4">
        <div className="flex items-center text-xs text-gray-500">
          <span className="hover:underline cursor-pointer" onClick={() => navigate("/")}>होम</span>
          <span className="mx-1">›</span>
          {news?.categories && (
            <span className="hover:underline cursor-pointer flex items-center" onClick={() => {
              const category = Array.isArray(news.categories) ? news.categories[0] : news.categories;
              navigate(`/${categorySlugMap[category] || ''}`);
            }}>
              {Array.isArray(news.categories) && news.categories.length > 0 ? (
                news.categories.map((category, index) => (
                  <span key={index} className="mr-2">{category}</span>
                ))
              ) : (
                <span className="bg-black text-white text-xs px-2 py-1 inline-block">
                  {news.categories || news.category || "Uncategorized"}
                </span>
              )}
            </span>
          )}
          <span className="mx-1">›</span>
          <span>{news.title?.substring(0, 60)}...</span>
        </div>
      </header>

        {/* main container */}
      <div className="flex flex-col md:flex-row h-full">
        {/* left container */}
        <div 
          className="w-full md:w-2/3 p-4"
          onContextMenu={preventContextMenu}
          onCopy={preventCopy}
          style={{
            userSelect: 'none',
            WebkitUserSelect: 'none',
            msUserSelect: 'none',
            MozUserSelect: 'none'
          }}
        >
          <div className="flex gap-2 mb-2">
            {news.categories?.length > 0 ? (
              news.categories.map((category, index) => (
                <span key={index} className="bg-black text-white text-xs px-2 py-1 inline-block">
                  {category}
                </span>
              ))
            ) : (
              <span className="bg-black text-white text-xs px-2 py-1 inline-block">
                {news.category || "Uncategorized"}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold mb-4">{news.title}</h1>

          <div className="flex items-center mb-4">
            <div className="w-6 h-6 bg-gray-200 rounded-full mr-2"></div>
            <span className="text-sm">Digdarshan Desk</span>
            <span className="mx-2 text-gray-500">•</span>
            <span className="text-sm text-gray-500">{new Date(news.date).toLocaleDateString('hi-IN')}</span>

            <div className="ml-auto flex items-center gap-3">
              <div className="flex items-center gap-1">
                <FaEye />
                <span className="text-sm">{views}</span>
              </div>
              <div className="flex items-center gap-1"  onClick={handleCommentIconClick}>
                <FaComment />
                <span className="text-sm">{comments.length}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <span className="text-sm">Share</span>
            <button className="w-6 h-6 bg-blue-600 text-white flex items-center justify-center rounded-full">
              <FaFacebookF size={12} />
            </button>
            <button className="w-6 h-6 bg-blue-400 text-white flex items-center justify-center rounded-full">
              <FaTwitter size={12} />
            </button>
            <button className="w-6 h-6 bg-green-500 text-white flex items-center justify-center rounded-full">
              <FaWhatsapp size={12} />
            </button>
          </div>

          <div className="mb-6">
            <img 
              src={news.image?.url || news.image || "https://placehold.co/800x400"} 
              alt={news.title}
              className="w-full h-auto"
            />
            <p className="text-sm text-gray-600 mt-2">{news.body.substring(0, 300)}...</p>
          </div>

          <div className="prose max-w-none mb-8">
            {news.body.split("\n\n").map((paragraph, index) => (
              <p key={index} className="mb-4">{paragraph}</p>
            ))}
          </div>

          <div className="border-t border-b py-4 flex justify-between items-center">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 ${hasLiked ? "text-blue-600 font-bold" : "hover:text-blue-600"}`}
            >
              <FaThumbsUp className={hasLiked ? "fill-current" : ""} />
              <span>{likes}</span>
            </button>
            <div 
              className="flex items-center gap-2 cursor-pointer hover:text-blue-600"
              onClick={handleCommentIconClick}
            >
              <FaComment />
              <span>{comments.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaEye />
              <span>{views}</span>
            </div>
            <button onClick={handleShare} className="flex items-center gap-2">
              <FaShare />
              <span>Share</span>
            </button>
          </div>          <div ref={commentFormRef} className="mt-8 mb-6">
            <h3 className="text-lg font-bold border-b border-gray-200 pb-2 mb-4">
              {replyTo ? 'LEAVE A REPLY TO COMMENT' : 'LEAVE A REPLY'}
              {replyTo && (
                <button 
                  onClick={() => setReplyTo(null)} 
                  className="ml-2 text-sm text-gray-500 hover:text-red-500"
                >
                  (Cancel Reply)
                </button>
              )}
            </h3>
            <form onSubmit={(e) => handleComment(e, replyTo)} className="mb-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full border p-2 mb-4"
                rows="4"
                placeholder="Comment..."
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input
                  type="text"
                  className="border p-2"
                  placeholder="Name *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <input
                  type="email"
                  className="border p-2"
                  placeholder="Email *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input
                  type="url"
                  className="border p-2"
                  placeholder="Website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="save-info"
                  checked={saveInfo}
                  onChange={(e) => setSaveInfo(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="save-info" className="text-sm">
                  Save my name, email, and website in this browser for the next time I comment.
                </label>
              </div>
              <button type="submit" className="bg-black text-white px-4 py-2">
                Post Comment
              </button>
            </form>
          </div>          <div className="mt-8 mb-6">
            <h3 className="text-lg font-bold border-b border-gray-200 pb-2 mb-4">RELATED ARTICLES</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentNews.map((newsItem, index) => (
                <div 
                  key={index} 
                  className="border cursor-pointer hover:shadow-lg transition-shadow duration-300"
                  onClick={() => handleReadMore(newsItem._id, newsItem)}
                >
                  <img
                    src={newsItem.image?.url || newsItem.image || "https://placehold.co/800x400"}
                    alt={newsItem.title}
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/800x400";
                    }}
                  />
                  <div className="p-2">
                    <h4 className="font-medium text-sm">{newsItem.title.substring(0, 60)}...</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(newsItem.date).toLocaleDateString('hi-IN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>          {/* Comments Section */}
          <CommentSection
            comments={comments}
            selectedComment={selectedComment}
            setSelectedComment={setSelectedComment}
            replyTo={replyTo}
            handleReplyClick={handleReplyClick}
            handleCancelReply={handleCancelReply}
            handleComment={handleComment}
            isSubmitting={isSubmitting}
            newComment={newComment}
            setNewComment={setNewComment}
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            website={website}
            setWebsite={setWebsite}
            saveInfo={saveInfo}
            setSaveInfo={setSaveInfo}
            replyFormRefs={replyFormRefs}
            commentsSectionRef={commentsSectionRef}
          />
        </div>
        
       {/* right container */}
        <div className="w-full md:w-1/3 p-4">
          <div className="bg-red-600 text-white p-4 mb-6">
            <h3 className="text-lg font-bold border-b border-white pb-2 mb-4">हमारे बारे में</h3>
            <p className="mb-2 font-bold">दिग्दर्शन समाचार एजेंसी</p>
            <p className="mb-2 font-bold">संपादक: श्लोक अग्रवाल</p>
            <p className="mb-4">पता: 112, फर्स्ट फ्लोर, पॉकेट-7, सेक्टर-12, द्वारका, B57 Marg, ITO, New Raisen-464551</p>
            <p className="mb-2">फोन नंबर: 8770887289</p>
            <p className="mb-2">ईमेल: Digdarshan@gmail.com</p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-bold border-b border-gray-200 pb-2 mb-4">ताज़ा लोकप्रिय</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                  width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                  background: #f1f1f1;
                  border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: #d1d5db;
                  border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                  background: #9ca3af;
                }
              `}</style>
              {popularNews.slice(0, visiblePopularCount).map((newsItem, index) => (
                <div key={index} className="flex gap-3"
                 onClick={() => handleReadMore(newsItem._id, newsItem)}
                >
                  <img
                    src={newsItem.image?.url || newsItem.image || "https://placehold.co/300"}
                    alt={newsItem.title}
                    className="w-20 h-16 object-cover rounded-lg shadow-md group-hover:shadow-xl transition-shadow duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/300";
                    }}
                  />
                  <div>
                    <h4 className="font-medium text-sm">{newsItem.title.substring(0, 60)}...</h4>
                    <p className="text-xs text-gray-500 mt-1">
                        <span className="font-medium">{newsItem.views}</span> बार देखी गई
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {popularNews.length > 5 && (
              <div className="text-center mt-4 bg-white py-2">
                {visiblePopularCount < popularNews.length ? (
                  <button
                    onClick={handleLoadMorePopular}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Load More →
                  </button>
                ) : (
                  <button
                    onClick={handleLoadLessPopular}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    ← Show Less
                  </button>
                )}
              </div>
            )}
          </div>       
               <div className="mb-6">
            <h3 className="text-lg font-bold border-b border-gray-200 pb-2 mb-4 text-red-600">
              RECENT COMMENTS
            </h3>
            <div className="max-h-[80vw] overflow-y-auto custom-scrollbar pr-2">
              <style>
                {`
                  .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                  }
                  .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 3px;
                  }
                  .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #d1d5db;
                    border-radius: 3px;
                  }
                  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #9ca3af;
                  }
                `}
              </style>
              <div className="space-y-4">
                {comments?.filter(c => !c.parentId)
                  .slice(0, visibleCommentCount)
                  .map((comment, index) => (
                    <div 
                      key={index} 
                      className="group border-b border-gray-100 pb-4 cursor-pointer hover:bg-gray-50 transition-colors p-4"
                      onClick={() => handleRecentCommentClick(comment)}
                    >
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 font-medium text-sm">
                            {comment.name ? comment.name[0].toUpperCase() : '?'}
                          </span>
                        </div>
                        <div className="flex-grow">
                          <span className="font-medium text-sm block">{comment.name || 'Anonymous'}</span>
                          <p className="text-gray-600 text-sm line-clamp-2 mb-1">{comment.content}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString('hi-IN')}
                            </span>
                            {comment.replies?.length > 0 && (
                              <span className="text-xs text-blue-600">
                                • {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-blue-600 text-xs">View →</span>
                        </div>
                      </div>
                    </div>
                  ))}
                {comments?.filter(c => !c.parentId).length > 10 && (
                  <div className="text-center mt-4 sticky bottom-0 bg-white py-2">
                    {visibleCommentCount > 10 ? (
                      <button
                        onClick={handleLoadLessComments}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        ← Show Less
                      </button>
                    ) : (
                      <button
                        onClick={handleLoadMoreComments}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Load More Comments →
                      </button>
                    )}
                  </div>
                )}
              </div>
           
               </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 p-4 flex justify-between items-center">
        <div className="flex gap-2">
          <button className="w-6 h-6 bg-blue-600 text-white flex items-center justify-center rounded-full">
            <FaFacebookF size={12} />
          </button>
          <button className="w-6 h-6 bg-blue-400 text-white flex items-center justify-center rounded-full">
            <FaTwitter size={12} />
          </button>
          <button className="w-6 h-6 bg-green-500 text-white flex items-center justify-center rounded-full">
            <FaWhatsapp size={12} />
          </button>
        </div>
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-200 rounded-full mr-2"></div>
          <div>
            <div className="text-sm font-medium">Digdarshan Desk</div>
            <div className="text-xs text-gray-500">https://www.Digdarshan.com</div>
          </div>
        </div>
      </div>

      {showAuthPrompt && (
        <AuthPrompt onClose={() => setShowAuthPrompt(false)} />
      )}

      <ViewTracker postId={id} onViewCountUpdate={handleViewCountUpdate} />
    </div>
    
  );
};

export default NewsDetail;