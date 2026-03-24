import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useUser } from '../contexts/UserContext';
import { FaBars, FaTimes, FaChevronDown, FaChevronUp } from "react-icons/fa";
import SearchBox from './SearchBox';

const Navbar = () => {
  const { user, logout } = useUser();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showStatesDropdown, setShowStatesDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSubMenuOpen, setMobileSubMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showTopBars, setShowTopBars] = useState(true);
  const [topBarsHeight, setTopBarsHeight] = useState(0);
  const lastScrollY = useRef(0);
  const topBarsRef = useRef(null);

  useEffect(() => {
    if (topBarsRef.current) {
      setTopBarsHeight(topBarsRef.current.offsetHeight);
    }
    const handleResize = () => {
      if (topBarsRef.current) {
        setTopBarsHeight(topBarsRef.current.offsetHeight);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Only react if scrolled down enough so it doesn't flicker at top
      if (currentScrollY > 60) {
        if (currentScrollY > lastScrollY.current) {
          setShowTopBars(false); // Scroll down
        } else {
          setShowTopBars(true);  // Scroll up
        }
      } else {
        setShowTopBars(true); // Back to very top
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);
  

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // You can implement the search functionality here
      // For example, navigate to search results page with the query
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header 
      className="sticky z-50 bg-white shadow-md transition-all duration-300 ease-in-out"
      style={{ top: showTopBars ? "0px" : `-${Math.max(topBarsHeight, 10)}px` }}
    >
      <div ref={topBarsRef} className="w-full">
        {/* Top Blue Bar */}
        <div className="bg-blue-900 text-white py-2 px-4 sm:px-6 flex justify-between items-center">
          <span id="currentDate" className="text-xs sm:text-sm">
            {new Date().toLocaleDateString("hi-IN", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric"
            })}
          </span>
          
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2"
              >
                {user && user.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl}
                    alt={user.name} 
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-gray-200"
                    onError={(e) => {
                      console.error("Image load error:", e);
                      e.target.onError = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
                    }}
                  />
                ) : (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-white hidden sm:inline">{user.name}</span>
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-red-500 hover:text-white"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-x-2 sm:space-x-4">
              <Link to="/login" className="text-xs sm:text-base hover:text-blue-300">Login</Link>
              <Link to="/signup" className="text-xs sm:text-base hover:text-blue-300">Signup</Link>
            </div>
          )}
        </div>

        {/* Red Service Links - Improved for both mobile and desktop */}
        <nav className="bg-red-600 text-white py-2">
          <div className="container mx-auto">
            {/* Desktop View - Horizontal */}
            <div className="hidden sm:flex justify-center space-x-4 md:space-x-6">
              <Link to="/subscription" className="font-semibold hover:underline text-sm md:text-base">Subscription Form</Link>
              <Link to="/services" className="font-semibold hover:underline text-sm md:text-base">Our Services</Link>
              <Link to="/about-us" className="font-semibold hover:underline text-sm md:text-base">About Us</Link>
              <Link to="/contact-us" className="font-semibold hover:underline text-sm md:text-base">Contact Us</Link>
            </div>
            
            {/* Mobile View - Grid */}
            <div className="sm:hidden grid grid-cols-2 gap-2 px-2">
              <Link 
                to="/subscription" 
                className="font-semibold text-center py-1 px-2 hover:bg-red-700 rounded text-xs"
                onClick={() => setMobileMenuOpen(false)}
              >
                Subscription
              </Link>
              <Link 
                to="/services" 
                className="font-semibold text-center py-1 px-2 hover:bg-red-700 rounded text-xs"
                onClick={() => setMobileMenuOpen(false)}
              >
                Our Services
              </Link>
              <Link 
                to="/about-us" 
                className="font-semibold text-center py-1 px-2 hover:bg-red-700 rounded text-xs"
                onClick={() => setMobileMenuOpen(false)}
              >
                About Us
              </Link>
              <Link 
                to="/contact-us" 
                className="font-semibold text-center py-1 px-2 hover:bg-red-700 rounded text-xs"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact Us
              </Link>
            </div>
          </div>
        </nav>
      </div>

      {/* Logo and Branding */}
      <div className="flex items-center justify-between px-4 sm:px-0 py-3">
        <div className="flex items-center">
          <img src="\images\LOGO\LOGO.jpg" alt="वेब वार्ता" className="h-12 sm:h-20 w-auto" />
          
        </div>        {/* Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-xl mx-8">
          <SearchBox
            query={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSubmit={handleSearch}
          />
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className="sm:hidden text-blue-900"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Main Navigation - Desktop */}
      <nav className="bg-blue-900 text-white py-2 hidden sm:block">
        <div className="container mx-auto flex space-x-6 px-4 whitespace-nowrap ">
          <Link to="/" className="bg-red-600 px-4 py-1 rounded font-semibold">होम</Link>
          <Link to="/national" className="hover:text-red-400 hover:underline transition duration-300">राष्ट्रीय</Link>
          <Link to="/international" className="hover:text-red-400 hover:underline transition duration-300">अंतर्राष्ट्रीय</Link>
          <Link to="/business" className="hover:text-red-400 hover:underline transition duration-300">कारोबार</Link>
          <Link to="/sports" className="hover:text-red-400 hover:underline transition duration-300">खेल</Link>
          <Link to="/entertainment" className="hover:text-red-400 hover:underline transition duration-300">मनोरंजन</Link>
          
          {/* States Dropdown */}
          <div 
            className="relative inline-block"
            onMouseEnter={() => setShowStatesDropdown(true)}
            onMouseLeave={() => setShowStatesDropdown(false)}
          >
            <Link to="/states" className="hover:text-red-400 hover:underline transition duration-300 flex items-center">
              राज्य {showStatesDropdown ? <FaChevronUp className="ml-1" size={12} /> : <FaChevronDown className="ml-1" size={12} />}
            </Link>
            {showStatesDropdown && (
              <div className="absolute left-0 transform -translate-y-1 w-48 bg-white rounded-md shadow-lg py-1 z-[100]">
                <Link 
                  to="/madhya-pradesh" 
                  className="block px-4 py-2 text-gray-800 hover:bg-blue-900 hover:text-white"
                >
                  मध्य प्रदेश
                </Link>
                <Link 
                  to="/uttar-pradesh" 
                  className="block px-4 py-2 text-gray-800 hover:bg-blue-900 hover:text-white"
                >
                  उत्तर प्रदेश
                </Link>
                <Link 
                  to="/chhattisgarh" 
                  className="block px-4 py-2 text-gray-800 hover:bg-blue-900 hover:text-white"
                >
                  छत्तीसगढ़
                </Link>
                <Link 
                  to="/other-states" 
                  className="block px-4 py-2 text-gray-800 hover:bg-blue-900 hover:text-white"
                >
                  अन्य राज्य
                </Link>
              </div>
            )}
          </div>

          <Link to="/horoscope" className="hover:text-red-400 hover:underline transition duration-300">राशिफल</Link>
          <Link to="/technology" className="hover:text-red-400 hover:underline transition duration-300">टेक्नोलॉजी</Link>
          <Link to="/health" className="hover:text-red-400 hover:underline transition duration-300">स्वास्थ्य</Link>
          <Link to="/education" className="hover:text-red-400 hover:underline transition duration-300">शिक्षा</Link>
          <Link to="/lifestyle" className="hover:text-red-400 hover:underline transition duration-300">लाइफस्टाइल</Link>
          <Link to="/NewsDownload" className="hover:text-red-400 hover:underline transition duration-300">NewsDownload</Link>
        </div>
      </nav>      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div 
          className="sm:hidden bg-blue-900 text-white pt-3 overflow-y-auto shadow-inner"
          style={{ height: 'calc(100vh - 152px)', minHeight: 'calc(100vh - 152px)' }}
        >
          <div className="flex flex-col space-y-2 px-4 pb-12">            {/* Mobile Search Bar */}
            <div className="mb-4 px-2 -mx-4 py-3 bg-gradient-to-r from-blue-900/10 to-indigo-900/10 backdrop-blur-sm">
              <SearchBox
                query={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onSubmit={handleSearch}
              />
            </div>
            <Link to="/" className="bg-red-600 px-4 py-2 rounded font-semibold" onClick={() => setMobileMenuOpen(false)}>होम</Link>
            <Link to="/national" className="px-4 py-2 hover:text-red-400" onClick={() => setMobileMenuOpen(false)}>राष्ट्रीय</Link>
            <Link to="/international" className="px-4 py-2 hover:text-red-400" onClick={() => setMobileMenuOpen(false)}>अंतर्राष्ट्रीय</Link>
            <Link to="/business" className="px-4 py-2 hover:text-red-400" onClick={() => setMobileMenuOpen(false)}>कारोबार</Link>
            <Link to="/sports" className="px-4 py-2 hover:text-red-400" onClick={() => setMobileMenuOpen(false)}>खेल</Link>
            <Link to="/entertainment" className="px-4 py-2 hover:text-red-400" onClick={() => setMobileMenuOpen(false)}>मनोरंजन</Link>
            
            {/* Mobile States Dropdown */}
            <div className="px-4 py-2">
              <button 
                className="flex items-center justify-between w-full hover:text-red-400"
                onClick={() => setMobileSubMenuOpen(!mobileSubMenuOpen)}
              >
                <span>राज्य</span>
                {mobileSubMenuOpen ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
              </button>
              {mobileSubMenuOpen && (
                <div className="ml-4 mt-2 space-y-2">
                  <Link 
                    to="/madhya-pradesh" 
                    className="block py-1 hover:text-red-400"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setMobileSubMenuOpen(false);
                    }}
                  >
                    मध्य प्रदेश
                  </Link>
                  <Link 
                    to="/uttar-pradesh" 
                    className="block py-1 hover:text-red-400"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setMobileSubMenuOpen(false);
                    }}
                  >
                    उत्तर प्रदेश
                  </Link>
                  <Link 
                    to="/chhattisgarh" 
                    className="block py-1 hover:text-red-400"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setMobileSubMenuOpen(false);
                    }}
                  >
                    छत्तीसगढ़
                  </Link>
                  <Link 
                    to="/other-states" 
                    className="block py-1 hover:text-red-400"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setMobileSubMenuOpen(false);
                    }}
                  >
                    अन्य राज्य
                  </Link>
                </div>
              )}
            </div>

            <Link to="/horoscope" className="px-4 py-2 hover:text-red-400" onClick={() => setMobileMenuOpen(false)}>राशिफल</Link>
            <Link to="/technology" className="px-4 py-2 hover:text-red-400" onClick={() => setMobileMenuOpen(false)}>टेक्नोलॉजी</Link>
            <Link to="/health" className="px-4 py-2 hover:text-red-400" onClick={() => setMobileMenuOpen(false)}>स्वास्थ्य</Link>
            <Link to="/education" className="px-4 py-2 hover:text-red-400" onClick={() => setMobileMenuOpen(false)}>शिक्षा</Link>
            <Link to="/lifestyle" className="px-4 py-2 hover:text-red-400" onClick={() => setMobileMenuOpen(false)}>लाइफस्टाइल</Link>
            <Link to="/NewsDownload" className="px-4 py-2 hover:text-red-400" onClick={() => setMobileMenuOpen(false)}>NewsDownload</Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;