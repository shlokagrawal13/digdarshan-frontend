import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Breadcrumb from '../components/Breadcrumb';

const SearchResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const searchQuery = new URLSearchParams(location.search).get('q');

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/news/search?q=${encodeURIComponent(searchQuery)}`);
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json();
        setResults(data.posts || []);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    if (searchQuery) {
      fetchSearchResults();
    }
  }, [searchQuery]);

  const handleReadMore = (news) => {
    localStorage.setItem("currentNewsId", news._id);
    const token = localStorage.getItem("token");

    if (!token) {
      localStorage.setItem("intendedPath", `/news-detail/${news._id}`);
      navigate("/login");
    } else {
      navigate(`/news-detail/${news._id}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Breadcrumb items={[{ label: 'होम', path: '/' }, { label: 'खोज परिणाम', path: '/search' }]} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-blue-900">
          "{searchQuery}" के लिए खोज परिणाम
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((news) => (
              <motion.div 
                key={news._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                whileHover={{ y: -5 }}
                onClick={() => handleReadMore(news)}
              >
                <div className="relative">
                  <img 
                    src={news.image || "https://via.placeholder.com/400x300?text=No+Image"}
                    alt={news.title} 
                    className="w-full h-48 object-cover transform transition-transform duration-500 hover:scale-105"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Available"
                    }}
                  />
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded-full shadow-lg">
                      {news.category || "अवर्गीकृत"}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">
                    {news.title}
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {news.body}
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <span>वेबवार्ता डेस्क</span>
                      <span>•</span>
                      <span>{new Date(news.date).toLocaleDateString('hi-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}</span>
                    </div>
                    {news.views !== undefined && <span>{news.views} views</span>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600">
            <p>कोई परिणाम नहीं मिला</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchResults;
