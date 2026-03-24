import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaChevronUp } from 'react-icons/fa';

const Footer = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="bg-blue-900 text-white mt-10 shadow-inner">
      {/* Top Footer Section */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Column 1: Brand & About */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            <Link to="/" onClick={scrollToTop}>
              <img 
                src="\images\LOGO\LOGO.jpg" 
                alt="Digdarshan News" 
                className="h-16 w-auto bg-white p-1 rounded shadow-md hover:opacity-90 transition-opacity" 
              />
            </Link>
            <p className="text-gray-300 text-sm text-center md:text-left leading-relaxed">
              दिग्दर्शन न्यूज़ (Digdarshan News) - देश और दुनिया की ताज़ा, निष्पक्ष और प्रामाणिक ख़बरों का सबसे भरोसेमंद मंच।
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="bg-blue-800 p-2 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm">
                <FaFacebookF size={16} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="bg-blue-800 p-2 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm">
                <FaTwitter size={16} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="bg-blue-800 p-2 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm">
                <FaInstagram size={16} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="bg-blue-800 p-2 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm">
                <FaYoutube size={16} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-xl font-bold mb-4 border-b-2 border-red-600 pb-1 w-max">त्वरित लिंक</h3>
            <ul className="space-y-3 text-gray-300 text-sm font-medium">
              <li><Link to="/" className="hover:text-red-400 transition-colors" onClick={scrollToTop}>होम (Home)</Link></li>
              <li><Link to="/about-us" className="hover:text-red-400 transition-colors" onClick={scrollToTop}>हमारे बारे में (About Us)</Link></li>
              <li><Link to="/services" className="hover:text-red-400 transition-colors" onClick={scrollToTop}>सेवाएं (Services)</Link></li>
              <li><Link to="/subscription" className="hover:text-red-400 transition-colors" onClick={scrollToTop}>सदस्यता (Subscription)</Link></li>
              <li><Link to="/contact-us" className="hover:text-red-400 transition-colors" onClick={scrollToTop}>संपर्क करें (Contact Us)</Link></li>
            </ul>
          </div>

          {/* Column 3: Categories */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-xl font-bold mb-4 border-b-2 border-red-600 pb-1 w-max">प्रमुख खबरें</h3>
            <ul className="space-y-3 text-gray-300 text-sm font-medium">
              <li><Link to="/national" className="hover:text-red-400 transition-colors" onClick={scrollToTop}>राष्ट्रीय (National)</Link></li>
              <li><Link to="/international" className="hover:text-red-400 transition-colors" onClick={scrollToTop}>अंतर्राष्ट्रीय (International)</Link></li>
              <li><Link to="/business" className="hover:text-red-400 transition-colors" onClick={scrollToTop}>कारोबार (Business)</Link></li>
              <li><Link to="/sports" className="hover:text-red-400 transition-colors" onClick={scrollToTop}>खेल (Sports)</Link></li>
              <li><Link to="/entertainment" className="hover:text-red-400 transition-colors" onClick={scrollToTop}>मनोरंजन (Entertainment)</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div className="flex flex-col items-center md:items-start text-sm">
            <h3 className="text-xl font-bold mb-4 border-b-2 border-red-600 pb-1 w-max">हमसे जुड़ें</h3>
            <ul className="space-y-4 text-gray-300">
              <li className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left">
                <FaMapMarkerAlt className="text-red-500 mb-2 md:mb-0 md:mt-1 md:mr-3 flex-shrink-0" size={16} />
                <span>
                  <strong className="text-white">Digdarshan House</strong><br />
                  111, First Floor, Pratap Bhawan,<br />
                  Bahadur Shah Zafar Marg,<br /> New Raisen – 464551
                </span>
              </li>
              <li className="flex flex-col md:flex-row items-center text-center">
                <FaPhoneAlt className="text-red-500 mb-2 md:mb-0 md:mr-3 flex-shrink-0" size={14} />
                <a href="tel:+918770887289" className="hover:text-white font-medium transition-colors">+91 87708 87289</a>
              </li>
              <li className="flex flex-col md:flex-row items-center text-center">
                <FaEnvelope className="text-red-500 mb-2 md:mb-0 md:mr-3 flex-shrink-0" size={14} />
                <a href="mailto:Digdarshan@gmail.com" className="hover:text-white font-medium transition-colors">Digdarshan@gmail.com</a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Legal Bar */}
      <div className="bg-blue-950 text-gray-400 text-sm py-4 border-t border-blue-800 shadow-inner">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          
          <div className="text-center md:text-left">
            <p>© {new Date().getFullYear()} <strong className="text-white">Digdarshan News Agency</strong>. All Rights Reserved.</p>
            <p className="mt-1 text-xs">Designed & Developed by <span className="text-red-400 font-semibold tracking-wide">Shlok Agrawal</span></p>
          </div>
          
          <div className="flex space-x-4 font-medium">
            <Link to="/privacy-policy" className="hover:text-red-400 transition-colors" onClick={scrollToTop}>Privacy Policy</Link>
            <span className="text-gray-600">|</span>
            <Link to="/terms-and-conditions" className="hover:text-red-400 transition-colors" onClick={scrollToTop}>Terms & Conditions</Link>
          </div>
          
        </div>
      </div>

      {/* Modern Scroll To Top Button */}
      <button 
        onClick={scrollToTop} 
        aria-label="Scroll to top"
        title="ऊपर जाएं"
        className="fixed bottom-6 right-6 bg-red-600 hover:bg-red-500 text-white p-3 rounded-full shadow-lg shadow-red-900/50 transition-all duration-300 hover:-translate-y-1 z-50 group border border-red-500/20"
      >
        <FaChevronUp className="group-hover:animate-bounce" size={18} />
      </button>

    </footer>
  );
};

export default Footer;
