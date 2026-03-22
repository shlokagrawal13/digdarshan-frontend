import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const NewsSection = ({ title, apiUrl }) => {
  const [recentNews, setRecentNews] = useState([]);
  const [popularNews, setPopularNews] = useState([]);
  const [news, setNews] = useState([]);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const newsPerPage = 6;
  const navigate = useNavigate();
  const pollIntervalRef = useRef(null);
  const hasInitialFetch = useRef(false);

  const fetchNews = useCallback(async () => {
    try {
      const response = await axios.get(apiUrl);
      if (response.data && response.data.posts) {
        const fetchedNews = response.data.posts.map((item) => ({
          ...item,
          image: item.image?.url || "https://picsum.photos/800/400",
          views: item.views || 0,
        }));

        const newsWithViews = await Promise.all(
          fetchedNews.map(async (post) => {
            try {
              const statsRes = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/social/${post._id}/stats`
              );
              return {
                ...post,
                views: statsRes.data.viewCount || post.views || 0,
              };
            } catch (err) {
              console.error(`Error fetching stats for post ${post._id}:`, err);
              return post;
            }
          })
        );

        const sortedByViews = [...newsWithViews].sort((a, b) => b.views - a.views);

        setRecentNews(newsWithViews.slice(0, 4));
        setPopularNews(sortedByViews.slice(0, 4));
        setNews(newsWithViews.slice(4));
      } else {
        throw new Error("Invalid API response");
      }
    } catch (err) {
      console.error("Error fetching news:", err);
      setError("Failed to fetch news. Please try again later.");
    }
  }, [apiUrl]);

  // Initial fetch only once
  useEffect(() => {
    if (!hasInitialFetch.current) {
      fetchNews();
      hasInitialFetch.current = true;
    }
  }, [fetchNews]);

  // Set up polling with Page Visibility API and 5-minute interval
  useEffect(() => {
    const startPolling = () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (document.hidden) return; // Don't poll if tab is hidden
      pollIntervalRef.current = setInterval(() => {
        if (!document.hidden) {
          fetchNews();
        }
      }, 5 * 60 * 1000); // 5 minutes
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab hidden: clear polling
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      } else {
        // Tab visible: resume polling
        startPolling();
      }
    };

    startPolling();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchNews]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % recentNews.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + recentNews.length) % recentNews.length);

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    const touchDiff = touchStart - touchEnd;
    if (Math.abs(touchDiff) > 50) { // minimum swipe distance
      if (touchDiff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  const handleImageError = (e) => {
    e.target.src = "https://via.placeholder.com/800x400?text=Image+Not+Available";
    setIsImageLoading(false);
  };

  const indexOfLastNews = currentPage * newsPerPage;
  const indexOfFirstNews = indexOfLastNews - newsPerPage;
  const currentNews = news.slice(indexOfFirstNews, indexOfLastNews);

  const totalPages = Math.ceil(news.length / newsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

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

  return (
    <div className="p-4 max-w-7xl mx-auto bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Breaking News Ticker */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white text-lg font-bold p-4 text-center overflow-hidden rounded-xl shadow-lg mb-8">
        <h2 className="text-2xl mb-2 font-bold tracking-tight">ताज़ा खबरें</h2>
        <motion.div
          className="whitespace-nowrap inline-block"
          animate={{ x: ["100vw", "-100vw"] }}
          transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
        >
          {recentNews.map((news, index) => (
            <span key={index} className="mx-6 text-xl">
              • {news.title}
            </span>
          ))}
        </motion.div>
       </div>     
       <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
          <span className="hover:text-blue-600 cursor-pointer transition-colors" onClick={() => navigate("/")}>होम</span>
          <span>›</span>
          <span className="text-red-600" >{title}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 leading-tight">
          {title}
        </h1>
      </div>
      {error && <p className="text-red-500 text-center">{error}</p>}

      {/* Main Hero Section with Slider and Recent News */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
        {/* Main Slider - 8 columns */}
        <div className="md:col-span-8">
          <div
            className="relative w-full h-[400px] overflow-hidden rounded-2xl shadow-2xl group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="relative w-full h-full">
              <AnimatePresence initial={false} mode="wait">
                {recentNews.map((news, index) =>
                  index === currentSlide ? (
                    <motion.div
                      key={index}
                      className="absolute inset-0 w-full h-full"
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ 
                        duration: 0.5,
                        ease: [0.4, 0.0, 0.2, 1]
                      }}
                    >
                      {isImageLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-gray-100 to-gray-200">
                          <motion.div 
                            className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                        </div>
                      )}
                      <img
                        src={news.image}
                        alt={news.title}
                        className={`w-full h-full object-cover transition-all duration-700 ${
                          isHovered ? 'scale-105' : 'scale-100'
                        } ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80" />
                      <motion.div
                        className="absolute bottom-2 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent"
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="max-w-4xl mx-auto">
                          <motion.div 
                            className="flex items-center gap-4 mb-4"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                          >
                            <span className="px-3 py-1.5 bg-red-600 text-white rounded-full text-sm font-medium shadow-lg">
                              {news.categories?.length > 0 ? news.categories[0] : news.category || "Uncategorized"}
                            </span>
                            <div className="flex items-center text-gray-300 text-sm">
                              <span className="font-medium mr-2">दिग्दर्शन डेस्क</span>
                              <span>•</span>
                              <span className="ml-2">
                                {new Date(news.date).toLocaleDateString("hi-IN", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </motion.div>

                          <motion.h2 
                            className="text-2xl md:text-3xl lg:text-2xl font-bold text-white mb-4 leading-tight"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                          >
                            {news.title}
                          </motion.h2>

                          {/* <motion.p 
                            className="text-gray-300 text-base md:text-lg mb-6 line-clamp-2"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                          >
                            {news.body?.substring(0, 200)}...
                          </motion.p> */}

                          <motion.div 
                            className="flex items-center justify-between"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                          >
                            <motion.button
                              onClick={() => handleReadMore(news._id, news)}
                              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 group"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              पूरी खबर पढ़ें
                              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                              </svg>
                            </motion.button>
                            <div className="flex items-center gap-4 text-gray-300">
                              <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span>{news.views} views</span>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      </motion.div>
                    </motion.div>
                  ) : null
                )}
              </AnimatePresence>
            </div>

            {/* Slider Navigation */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {recentNews.map((_, index) => (
                <motion.button
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide ? 'w-8 bg-red-600' : 'w-2 bg-white/50'
                  }`}
                  onClick={() => setCurrentSlide(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>

            {/* Previous/Next Buttons */}
            <motion.div 
              className="absolute inset-y-0 left-0 flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <button
                className="ml-4 w-12 h-12 flex items-center justify-center bg-black/20 hover:bg-red-600 text-white rounded-full backdrop-blur-sm border border-white/10 transition-all duration-300"
                onClick={prevSlide}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </motion.div>

            <motion.div 
              className="absolute inset-y-0 right-0 flex items-center"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <button
                className="mr-4 w-12 h-12 flex items-center justify-center bg-black/20 hover:bg-red-600 text-white rounded-full backdrop-blur-sm border border-white/10 transition-all duration-300"
                onClick={nextSlide}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </motion.div>
          </div>
        </div>

        {/* Recent News - 4 columns */}
        <div className="md:col-span-4  space-y-4">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-1 px-4 rounded-lg">
            <h2 className="text-md font-bold">ताज़ा अपडेट</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
            {recentNews.map((article, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
                whileHover={{ y: -5 }}
                onClick={() => handleReadMore(article._id, article)}
              >
                <div className="relative">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full shadow-lg">
                      {article.categories?.length > 0
                        ? article.categories[0]
                        : article.category || "Uncategorized"}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="text-sm font-bold line-clamp-2 mb-1 group-hover:text-blue-200 transition-colors">
                      {article.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span>दिग्दर्शन डेस्क</span>
                        <span>•</span>
                        <span>{new Date(article.date).toLocaleDateString("hi-IN", {
                          day: "numeric",
                          month: "short",
                        })}</span>
                      </div>
                      <span>{article.views} views</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Rest of the content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main News Grid */}
        <div className="w-full lg:w-2/3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {currentNews.map((article, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                whileHover={{ y: -5 }}
              >
                <div className="relative">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-48 sm:h-52 object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded-full shadow-lg">
                      {article.categories?.length > 0
                        ? article.categories[0]
                        : article.category || "Uncategorized"}
                    </span>
                  </div>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <span>दिग्दर्शन डेस्क</span>
                    <span>•</span>
                    <span>{new Date(article.date).toLocaleDateString("hi-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                    {article.title}
                  </h2>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleReadMore(article._id, article)}
                      className="text-blue-500 font-medium hover:text-blue-700 transition-colors duration-200"
                    >
                      पूरी खबर पढ़ें →
                    </button>
                    <span className="text-sm text-gray-500">{article.views} views</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-1/3 space-y-6">
          {/* About Us Section */}
          <div className="bg-red-600 text-white p-4 rounded-xl">
            <h3 className="text-lg font-bold border-b border-white/20 pb-2 mb-4">हमारे बारे में</h3>
            <div className="space-y-3 text-sm sm:text-base">
              <p className="font-bold">दिग्दर्शन न्यूज़ समाचार एजेंसी</p>
              <p className="font-bold">संपादक: श्लोक अग्रवाल</p>
              <p className="text-sm leading-relaxed">पता: 112, फर्स्ट फ्लोर, पॉकेट-7, सेक्टर-12, द्वारका, B57 Marg, ITO, New Raisen-464551</p>
              <p>फोन नंबर: 8770887289</p>
              <p>ईमेल: Digdarshan@gmail.com</p>
            </div>
          </div>

          {/* Popular News Section */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <h2 className="text-lg font-bold border-b border-gray-200 pb-2 mb-4">सबसे ज्यादा पढ़ी गई खबरें</h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {popularNews.map((newsItem, index) => (
                <motion.div
                  key={index}
                  className="group cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleReadMore(newsItem._id, newsItem)}
                >
                  <div className="flex gap-3 items-start">
                    <div className="relative flex-shrink-0 ">
                      <img
                        src={newsItem.image}
                        alt={newsItem.title}
                        className="w-20 h-16 object-cover rounded-lg shadow-md group-hover:shadow-xl transition-shadow duration-300"
                      />
                      {/* <div className="absolute -top-2 -left-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {index + 1}
                      </div> */}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-gray-800 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                        {newsItem.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        <span className="font-medium">{newsItem.views}</span> बार देखी गई
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-12 bg-white p-4 rounded-2xl shadow-lg">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 mx-1 rounded-lg disabled:opacity-50 bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
          >
            ←
          </button>

          {currentPage > 3 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className="px-4 py-2 mx-1 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
              >
                1
              </button>
              <span className="px-3 py-2 mx-1">...</span>
            </>
          )}

          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => Math.max(1, currentPage - 2) + i).map(
            (pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                className={`px-4 py-2 mx-1 rounded-lg transition-colors duration-200 ${
                  currentPage === pageNumber 
                    ? "bg-blue-500 text-white hover:bg-blue-600" 
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {pageNumber}
              </button>
            )
          )}

          {currentPage < totalPages - 2 && (
            <>
              <span className="px-3 py-2 mx-1">...</span>
              <button
                onClick={() => handlePageChange(totalPages)}
                className="px-4 py-2 mx-1 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 mx-1 rounded-lg disabled:opacity-50 bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
          >
            →
          </button>

          <span className="ml-4 text-gray-600 font-medium">
            Page {currentPage} of {totalPages}
          </span>
        </div>
      )}
    </div>
  );
};

export default NewsSection;