import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="bg-blue-900 text-white py-8">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
        <img src="\images\LOGO\LOGO.jpg" alt="वेब वार्ता" className="h-24 w-auto" />

        <ul className="space-y-2 text-lg font-semibold text-center md:text-left">
          {['राज्य', 'राष्ट्रीय', 'उत्तर प्रदेश', 'अन्य राज्य', 'अंतर्राष्ट्रीय'].map((category, index) => (
            <li key={category}>{category} <span className="font-bold">{800 - index * 100}</span></li>
          ))}
        </ul>

        <div className="text-center md:text-left">
          <h3 className="text-lg font-bold">Digdarshan House</h3>
          <p className="font-semibold">111, First Floor, Pratap Bhawan</p>
          <p className="font-semibold">Bahadur Shah Zafar Marg, New Raisen – 464551</p>
          <p className="font-semibold">Phone: +91-8770887289</p>
          <p className="font-semibold">Email: Digdarshan@gmail.com</p>

        </div>
      </div>

      <div className="bg-black text-white text-center text-sm py-3 mt-6">
<p>© {new Date().getFullYear()} Digdarshan News Agency. All Rights Reserved. | Designed & Developed by Shlok Agrawal</p>        <div className="flex justify-center space-x-4 mt-2">
          {['About Us', 'Contact Us', 'Privacy Policy', 'Terms and Conditions'].map((link, index) => (
            <Link key={index} to={`/${link.toLowerCase().replace(/ /g, '-')}`} className="hover:text-gray-400">
              {link}
            </Link>
          ))}
        </div>
      </div>

      <button onClick={scrollToTop} className="fixed bottom-5 right-5 bg-blue-500 hover:bg-blue-700 text-white p-3 rounded-full shadow-md">
        ⬆
      </button>
    </footer>
  );
};

export default Footer;
