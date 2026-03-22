// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { motion, AnimatePresence } from "framer-motion";
// import { Link } from 'react-router-dom';

// const Rastriya = () => {
//     const [recentNews, setRecentNews] = useState([]);
//     const [popularNews, setPopularNews] = useState([]);
//     const [news, setNews] = useState([]);
//     const [error, setError] = useState(null);
//     const [currentSlide, setCurrentSlide] = useState(0);
//     const [isHovered, setIsHovered] = useState(false);
//     const [currentPage, setCurrentPage] = useState(1);
//     const newsPerPage = 6;

//     useEffect(() => {
//         const fetchNews = async () => {
//             try {
//                 const response = await axios.get("https://dummyjson.com/posts");
//                 if (response.data && response.data.posts) {
//                     const fetchedNews = response.data.posts.map(item => ({
//                         ...item,
//                         image: item.image || "https://picsum.photos/800/400"
//                     }));

//                     setRecentNews(fetchedNews.slice(0, 4));
//                     setPopularNews(fetchedNews.slice(4, 8));
//                     setNews(fetchedNews.slice(8));
//                 } else {
//                     throw new Error("Invalid API response");
//                 }
//             } catch (err) {
//                 console.error("Error fetching news:", err);
//                 setError("Failed to fetch news. Please try again later.");
//             }
//         };
//         fetchNews();
//     }, []);

//     useEffect(() => {
//         if (recentNews.length === 0 || isHovered) return;
//         const interval = setInterval(() => {
//             setCurrentSlide((prev) => (prev + 1) % recentNews.length);
//         }, 4000);
//         return () => clearInterval(interval);
//     }, [recentNews, isHovered]);

//     const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % recentNews.length);
//     const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + recentNews.length) % recentNews.length);

//     const indexOfLastNews = currentPage * newsPerPage;
//     const indexOfFirstNews = indexOfLastNews - newsPerPage;
//     const currentNews = news.slice(indexOfFirstNews, indexOfLastNews);

//     const totalPages = Math.ceil(news.length / newsPerPage);

//     const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

//     return (
//         <div className="p-4 max-w-7xl mx-auto bg-gray-100 min-h-screen">
//             {/* ... (rest of the component remains the same) */}
//             <div className="bg-red-600 text-white text-lg font-bold p-3 text-center overflow-hidden">
//                 <h2 className="text-xl mb-1"> Breaking News </h2>
//                 <motion.div
//                     className="whitespace-nowrap inline-block"
//                     animate={{ x: ["100vw", "-100vw"] }}
//                     transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
//                 >
//                     {recentNews.map((news, index) => (
//                         <span key={index} className="mx-4">
//                             {news.title} 
//                         </span>
//                     ))}
//                 </motion.div>
//             </div>

//             <h1 className="text-4xl font-bold my-6 text-center">राष्ट्रीय समाचार</h1>
//             {error && <p className="text-red-500 text-center">{error}</p>}

//             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//                 <div
//                     className="md:col-span-3 relative w-full h-80 overflow-hidden rounded-lg shadow-lg"
//                     onMouseEnter={() => setIsHovered(true)}
//                     onMouseLeave={() => setIsHovered(false)}
//                 >
//                     <div className="relative w-full h-full flex">
//                         <AnimatePresence mode="sync">
//                             {recentNews.map((news, index) =>
//                                 index === currentSlide ? (
//                                     <motion.div
//                                         key={index}
//                                         className="absolute inset-0 w-full h-full"
//                                         initial={{ x: "100%" }}
//                                         animate={{ x: "0%" }}
//                                         exit={{ x: "-100%" }}
//                                         transition={{ duration: 0.8, ease: "easeInOut" }}
//                                     >
//                                         <img
//                                             src={news.image}
//                                             alt={news.title}
//                                             className="w-full h-80 object-cover rounded-lg"
//                                         />
//                                         <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white p-3 rounded-lg">
//                                             <h2 className="text-xl font-bold">{news.title}</h2>
//                                             <p className="text-sm mt-1">{news.body.slice(0, 100)}...</p>
//                                             <Link to="/news-detail" className="text-blue-400 mt-2 inline-block">Read More</Link>
//                                         </div>
//                                     </motion.div>
//                                 ) : null
//                             )}
//                         </AnimatePresence>
//                     </div>
//                     <button className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-lg" onClick={prevSlide}>
//                         ◀
//                     </button>
//                     <button className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-lg" onClick={nextSlide}>
//                         ▶
//                     </button>
//                 </div>

//                 <div className="bg-white p-4 rounded-lg shadow-md">
//                     <h2 className="text-xl font-bold mb-4">सबसे ज्यादा पढ़ी गई न्यूज़</h2>
//                     <div className="grid grid-cols-1 gap-4">
//                         {popularNews.map((news, index) => (
//                             <div key={index} className="flex items-center space-x-4">
//                                 <img src={news.image} alt={news.title} className="w-20 h-20 object-cover rounded-lg" />
//                                 <p className="text-sm">{news.title}</p>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
//                 {recentNews.map((article, index) => (
//                     <div key={index} className="bg-white p-4 rounded-lg shadow-md">
//                         <img src={article.image} alt={article.title} className="w-full h-48 object-cover rounded-lg" />
//                         <h2 className="text-lg font-bold mt-2">{article.title}</h2>
//                         <p className="text-sm text-gray-600">{article.body.slice(0, 60)}...</p>
//                         <button className="text-blue-500 mt-2">Read More</button>
//                     </div>
//                 ))}
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
//     {currentNews.map((article, index) => (
//         <div key={index} className="bg-white p-4 rounded-lg shadow-md">
//             <img src={article.image} alt={article.title} className="w-full h-48 object-cover rounded-lg" />
//             <h2 className="text-lg font-bold mt-2">{article.title}</h2>
//             <p className="text-sm text-gray-600">{article.body.slice(0, 60)}...</p>
//             <Link to="/news-detail" className="text-blue-400 mt-2 inline-block">Read More</Link>
//         </div>
//     ))}
// </div>

// {/* Pagination */}
// {totalPages > 1 && (
//     <div className="flex justify-center mt-6 items-center">
//         <button
//             onClick={() => handlePageChange(currentPage - 1)}
//             disabled={currentPage === 1}
//             className="px-3 py-2 mx-1 border rounded disabled:opacity-50 bg-gray-100 hover:bg-gray-200"
//         >
//             &lt;
//         </button>

//         {/* Show first and last page buttons */}
//         {currentPage > 3 && (
//             <>
//                 <button onClick={() => handlePageChange(1)} className="px-3 py-2 mx-1 border rounded bg-gray-100 hover:bg-gray-200">
//                     1
//                 </button>
//                 <span className="px-3 py-2 mx-1">...</span>
//             </>
//         )}

//         {/* Show buttons for current page and surrounding pages */}
//         {Array.from({ length: Math.min(totalPages, 5) }, (_, i) =>
//             Math.max(1, currentPage - 2) + i
//         ).map((pageNumber) => (
//             <button
//                 key={pageNumber}
//                 onClick={() => handlePageChange(pageNumber)}
//                 className={`px-3 py-2 mx-1 border rounded ${currentPage === pageNumber ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
//             >
//                 {pageNumber}
//             </button>
//         ))}

//         {/* Show ellipsis and last page button if there are more pages */}
//         {currentPage < totalPages - 2 && (
//             <>
//                 <span className="px-3 py-2 mx-1">...</span>
//                 <button onClick={() => handlePageChange(totalPages)} className="px-3 py-2 mx-1 border rounded bg-gray-100 hover:bg-gray-200">
//                     {totalPages}
//                 </button>
//             </>
//         )}

//         <button
//             onClick={() => handlePageChange(currentPage + 1)}
//             disabled={currentPage === totalPages}
//             className="px-3 py-2 mx-1 border rounded disabled:opacity-50 bg-gray-100 hover:bg-gray-200"
//         >
//             &gt;
//         </button>

//         {/* Display current page and total pages */}
//         <span className="ml-4 text-gray-600">
//             Page {currentPage} of {totalPages}
//         </span>
//     </div>

//             )}
//         </div>
//     );
// };

// export default Rastriya;