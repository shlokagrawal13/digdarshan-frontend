import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const AuthPrompt = ({ onClose = () => window.history.back() }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Store current path for redirect after login
  const handleAuthClick = () => {
    localStorage.setItem('intendedPath', location.pathname);
  };

  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    } else {
      navigate(-1); // Go back if no onClose provided
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-4">Login Required</h2>
        <p className="text-gray-600 mb-6 text-center">
          Please login or create an account to read the full article
        </p>
        <div className="flex flex-col gap-4">
          <Link
            to="/login"
            onClick={handleAuthClick}
            className="bg-blue-600 text-white py-2 px-4 rounded text-center hover:bg-blue-700"
          >
            Login
          </Link>
          <Link
            to="/signup"
            onClick={handleAuthClick}
            className="border border-blue-600 text-blue-600 py-2 px-4 rounded text-center hover:bg-blue-50"
          >
            Create Account
          </Link>
          <button
            onClick={handleClose}
            className="text-gray-600 hover:text-gray-800 py-2 px-4 rounded text-center"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPrompt;
