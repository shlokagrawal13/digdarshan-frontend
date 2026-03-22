import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from 'react-router-dom';

// 🎯 HeaderNews Component
const HeaderNews = ({ apiUrls }) => {
  const [recentNews, setRecentNews] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const pollIntervalRef = useRef(null);
  const hasInitialFetch = useRef(false);

  const fetchNews = useCallback(async () => {
    try {
      let allNews = [];
      for (const apiUrl of apiUrls) {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const data = await response.json();
        if (data && data.posts) {
          allNews = [...allNews, ...data.posts.slice(0, 3)];
        }
      }
      setRecentNews(allNews);
    } catch (error) {
      console.error("Failed to fetch news:", error.message);
    }
  }, [apiUrls]);

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

  useEffect(() => {
    if (recentNews.length === 0 || isHovered) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % recentNews.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [recentNews, isHovered]);

  return (
    <div className="px-1 pt-4">
      <div className="bg-[#C4161C] text-white font-semibold p-4 rounded-lg shadow-md overflow-hidden">
        <h2 className="text-lg font-bold mb-3 flex items-center">
          <span className="mr-2">📰</span> ताज़ा खबर
        </h2>
        {recentNews.length > 0 ? (
          <motion.div
            className="whitespace-nowrap inline-block"
            animate={{ x: ["100%", "-100%"] }}
            transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
          >
            {recentNews.map((news, index) => (
              <Link
                key={index}
                to={`/news-detail/${news._id}`}
                onClick={() => {
                  console.log("Clicked news:", news._id);
                  localStorage.setItem('currentNewsId', news._id);
                }}
                className="mx-4 text-sm hover:underline"
              >
                {news.title || "Untitled News"}
              </Link>
            ))}
          </motion.div>
        ) : (
          <p className="text-sm">कोई ताज़ा खबर उपलब्ध नहीं है।</p>
        )}
      </div>

      <div
        className="relative w-full h-[400px] md:h-[450px] overflow-hidden rounded-2xl shadow-2xl mt-6"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <AnimatePresence initial={false} mode="wait">
          {recentNews.length > 0 ? (
            recentNews.map((news, index) =>
              index === currentSlide ? (
                <motion.div
                  key={index}
                  className="absolute inset-0 w-full h-full"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }}
                >
                  <div className="relative w-full h-full">
                    <img
                      src={news.image?.url || news.image || "https://placehold.co/1200x600"}
                      alt={news.title || "News Image"}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => (e.target.src = "https://placehold.co/1200x600")}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-70" />
                    <motion.div
                      className="absolute bottom-2 left-0 right-0 p-6 md:p-8"
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="max-w-4xl mx-auto">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          <span className="px-3 py-1.5 bg-red-600 text-white rounded-full text-sm font-medium shadow-lg">
                            {news.categories?.length > 0 ? news.categories[0] : news.category || "Uncategorized"}
                          </span>
                          <div className="flex items-center text-gray-300 text-sm">
                            <span className="font-medium">वेबवार्ता डेस्क</span>
                            <span className="mx-2">•</span>
                            <span>
                              {news.date
                                ? new Date(news.date).toLocaleDateString('hi-IN', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                  })
                                : "Unknown Date"}
                            </span>
                          </div>
                        </div>
                        <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-4 leading-tight">
                          {news.title || "Untitled News"}
                        </h2>
                        <Link
                          to={`/news-detail/${news._id}`}
                          onClick={() => localStorage.setItem('currentNewsId', news._id)}
                          className="inline-flex items-center px-4 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all duration-300 group"
                        >
                          पूरी खबर पढ़ें
                          <svg
                            className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </Link>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              ) : null
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-gray-100 to-gray-200">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">समाचार लोड हो रहा है...</p>
              </div>
            </div>
          )}
        </AnimatePresence>
        {recentNews.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
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
        )}
        {recentNews.length > 1 && (
          <>
            <motion.button
              className="absolute top-1/2 left-4 transform -translate-y-1/2 p-3 bg-black/20 hover:bg-red-600 text-white rounded-full backdrop-blur-sm border border-white/10 transition-all duration-300"
              onClick={() => setCurrentSlide((prev) => (prev - 1 + recentNews.length) % recentNews.length)}
              whileHover={{ scale: 1.1, x: -4 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>
            <motion.button
              className="absolute top-1/2 right-4 transform -translate-y-1/2 p-3 bg-black/20 hover:bg-red-600 text-white rounded-full backdrop-blur-sm border border-white/10 transition-all duration-300"
              onClick={() => setCurrentSlide((prev) => (prev + 1) % recentNews.length)}
              whileHover={{ scale: 1.1, x: 4 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          </>
        )}
      </div>
    </div>
  );
};

// 🎯 NewsCategory Component
const NewsCategory = ({ title, apiUrl }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pollIntervalRef = useRef(null);
  const hasInitialFetch = useRef(false);

  const fetchNews = useCallback(async () => {
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();
      if (data && data.posts) {
        setNews(data.posts.slice(0, 6));
        setError(null);
      } else {
        setError("Invalid news data format.");
      }
    } catch (error) {
      setError(`Failed to fetch news: ${error.message}`);
    } finally {
      setLoading(false);
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

  if (loading) return (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#C4161C] mx-auto"></div>
      <p className="text-gray-600 mt-2">लोड हो रहा है {title}...</p>
    </div>
  );
  if (error) return <p className="text-center text-[#C4161C] py-8">त्रुटि: {error}</p>;

  return (
    <div className="px-4 py-6">
      <div className="flex items-center mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-[#003087]">{title}</h2>
        <div className="h-0.5 bg-[#003087] flex-grow ml-2"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {news.map((newsItem, index) => (
          <motion.div
            key={index}
            className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col w-full ${index === 0 ? 'md:w-1/2 md:col-span-4' : ''}`}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative">
              <img
                src={newsItem.image?.url || newsItem.image || "https://placehold.co/400x250"}
                alt={newsItem.title || "News Image"}
                className={`w-full ${index === 0 ? 'h-64 md:h-80' : 'h-48'} object-cover`}
                onError={(e) => (e.target.src = "https://placehold.co/400x250")}
              />
              <span className="absolute top-2 left-2 text-xs text-white bg-[#C4161C] px-2 py-1 rounded">
                {newsItem.categories?.length > 0 ? newsItem.categories[0] : newsItem.category || "Uncategorized"}
              </span>
            </div>
            <div className="p-4 flex flex-col flex-grow">
              <Link
                to={`/news-detail/${newsItem._id}`}
                onClick={() => {
                  console.log("Category news title clicked:", newsItem._id);
                  localStorage.setItem('currentNewsId', newsItem._id);
                }}
                className={`font-semibold text-gray-900 hover:text-[#C4161C] hover:underline line-clamp-2 ${index === 0 ? 'text-lg' : 'text-base'}`}
              >
                {newsItem.title || "Untitled News"}
              </Link>
              {index === 0 && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                  {newsItem.body?.substring(0, 150) || "No content available"}...
                </p>
              )}
              <div className="flex justify-between items-center mt-2 pt-2 border-t">
                <Link
                  to={`/news-detail/${newsItem._id}`}
                  onClick={() => {
                    console.log("Category news read more clicked:", newsItem._id);
                    localStorage.setItem('currentNewsId', newsItem._id);
                  }}
                  className="text-[#003087] hover:text-[#C4161C] font-medium text-sm"
                >
                  और पढ़ें →
                </Link>
                <div className="flex items-center text-xs text-gray-500">
                  <span className="mr-2">Digdarshan Desk</span>
                  <span>
                    {newsItem.date
                      ? new Date(newsItem.date).toLocaleDateString('hi-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })
                      : "Unknown Date"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// 🎯 Sidebar Component
const Sidebar = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 sticky top-[20vw]">
      <div className="bg-red-600 text-white p-4 rounded-xl">
        <h3 className="text-lg font-bold border-b border-white/20 pb-2 mb-4">हमारे बारे में</h3>
        <div className="space-y-3 text-sm sm:text-base">
          <p className="font-bold">दिग्दर्शन न्यूज़ एजेंसी</p>
          <p className="font-bold">संपादक: श्लोक अग्रवाल</p>
          <p className="text-sm leading-relaxed">पता: 112, फर्स्ट फ्लोर, पॉकेट-7, सेक्टर-12, द्वारका, B57 Marg, ITO, New Raisen-464551</p>
          <p>फोन नंबर: 8770887289</p>
          <p>ईमेल: Digdarshan@gmail.com</p>
        </div>
      </div>
    </div>
  );
};

// 🎯 Video Section Component with YouTube API Integration
const VideoSection = () => {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
  const fetchYouTubeVideos = async () => {
    try {
      const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
      const CHANNEL_ID = process.env.REACT_APP_YOUTUBE_CHANNEL_ID;
      const UPLOADS_PLAYLIST_ID = CHANNEL_ID.replace("UC", "UU");

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=5&playlistId=${UPLOADS_PLAYLIST_ID}&key=${API_KEY}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${data.error?.message || 'Unknown error'}`);
      }

      const videoData = data.items.map((item) => ({
        id: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails?.high?.url || "https://placehold.co/400x250",
      }));

      setVideos(videoData);
      setSelectedVideo(videoData[0] || null);
    } catch (error) {
      console.error("Failed to fetch YouTube videos:", error.message);
      setError(`वीडियो लोड करने में त्रुटि हुई: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  fetchYouTubeVideos();
}, []);


  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#C4161C] mx-auto"></div>
        <p className="text-gray-600 mt-2">वीडियो लोड हो रहे हैं...</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-[#C4161C] py-8">त्रुटि: {error}</p>;
  }

  return (
    <div className="py-6">
      <div className="flex items-center mb-6">
        <h2 className="text-2xl font-bold text-[#C4161C]">वीडियो</h2>
        <div className="h-0.5 bg-[#C4161C] flex-grow ml-4"></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          {selectedVideo ? (
            <div className="relative rounded-xl overflow-hidden shadow-lg">
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=0&mute=0&enablejsapi=1`}
                  className="w-full h-full"
                  allowFullScreen
                  title={selectedVideo.title}
                ></iframe>
              </div>
              <div className="p-4 bg-gradient-to-t from-black to-transparent absolute bottom-0 left-0 right-0">
                <h3 className="text-white text-lg font-bold line-clamp-2">
                  {selectedVideo.title}
                </h3>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">कोई वीडियो उपलब्ध नहीं है।</p>
          )}
        </div>
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-4">
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {videos.map((video, index) => (
              <div
                key={index}
                onClick={() => setSelectedVideo(video)}
                className="flex gap-4 group cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
              >
                <div className="relative w-40 h-24 flex-shrink-0">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => (e.target.src = "https://placehold.co/400x250")}
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors rounded-lg" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold line-clamp-2 group-hover:text-[#C4161C] transition-colors">
                    {video.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 🎯 Home Component
const Home = () => {
  const apiUrls = [
  `${process.env.REACT_APP_API_URL}/api/news/national`,
`${process.env.REACT_APP_API_URL}/api/news/international`,
`${process.env.REACT_APP_API_URL}/api/news/business`,
`${process.env.REACT_APP_API_URL}/api/news/sports`,
`${process.env.REACT_APP_API_URL}/api/news/state`,
`${process.env.REACT_APP_API_URL}/api/news/entertainment`,
`${process.env.REACT_APP_API_URL}/api/news/madhyapradesh`,
`${process.env.REACT_APP_API_URL}/api/news/uttarpradesh`,
`${process.env.REACT_APP_API_URL}/api/news/otherstates`,
`${process.env.REACT_APP_API_URL}/api/news/horoscope`,
`${process.env.REACT_APP_API_URL}/api/news/technology`,
`${process.env.REACT_APP_API_URL}/api/news/health`,
`${process.env.REACT_APP_API_URL}/api/news/education`,
`${process.env.REACT_APP_API_URL}/api/news/lifestyle`
  ];


const categories = [
  { title: "राष्ट्रीय",         apiUrl: `${process.env.REACT_APP_API_URL}/api/news/national` },
  { title: "अंतरराष्ट्रीय",     apiUrl: `${process.env.REACT_APP_API_URL}/api/news/international` },
  { title: "कारोबार",           apiUrl: `${process.env.REACT_APP_API_URL}/api/news/business` },
  { title: "खेल",               apiUrl: `${process.env.REACT_APP_API_URL}/api/news/sports` },
  { title: "राज्य",             apiUrl: `${process.env.REACT_APP_API_URL}/api/news/state` },
  { title: "बॉलीवुड/मनोरंजन",   apiUrl: `${process.env.REACT_APP_API_URL}/api/news/entertainment` },
  { title: "मध्यप्रदेश",        apiUrl: `${process.env.REACT_APP_API_URL}/api/news/madhyapradesh` },
  { title: "उत्तरप्रदेश",       apiUrl: `${process.env.REACT_APP_API_URL}/api/news/uttarpradesh` },
  { title: "छत्तीसगढ़",         apiUrl: `${process.env.REACT_APP_API_URL}/api/news/chhattisgarh` },
  { title: "अन्य राज्य",        apiUrl: `${process.env.REACT_APP_API_URL}/api/news/otherstates` },
  { title: "राशिफल",            apiUrl: `${process.env.REACT_APP_API_URL}/api/news/horoscope` },
  { title: "टेक्नोलॉजी",        apiUrl: `${process.env.REACT_APP_API_URL}/api/news/technology` },
  { title: "स्वास्थ्य",         apiUrl: `${process.env.REACT_APP_API_URL}/api/news/health` },
  { title: "शिक्षा",            apiUrl: `${process.env.REACT_APP_API_URL}/api/news/education` },
  { title: "लाइफस्टाइल",        apiUrl: `${process.env.REACT_APP_API_URL}/api/news/lifestyle` },
];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <HeaderNews apiUrls={apiUrls} />
          </div>
          <div className="hidden lg:block lg:col-span-1">
            <Sidebar />
          </div>
          <div className="lg:col-span-4">
            {categories.map((category, index) => (
              <NewsCategory key={index} title={category.title} apiUrl={category.apiUrl} />
            ))}
            <VideoSection />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;