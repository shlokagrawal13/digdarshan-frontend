import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../config/firebase';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.email || !formData.password) {
        setError('कृपया सभी फील्ड भरें');
        setLoading(false);
        return;
      }

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        email: formData.email,
        password: formData.password,
      });

      if (response.data.token && response.data.user) {
        await login(response.data.user, response.data.token);
        
        // Redirect based on user role
        const intendedPath = localStorage.getItem('intendedPath');
        if (intendedPath) {
          localStorage.removeItem('intendedPath');
          navigate(intendedPath);
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'लॉगिन विफल रहा। कृपया दोबारा कोशिश करें।';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // भेजें Google user data को backend को
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/google-login`, {
        name: user.displayName || 'User',
        email: user.email,
        profilePic: user.photoURL || null,
      });

      if (response.data.token && response.data.user) {
        await login(response.data.user, response.data.token);
        
        const intendedPath = localStorage.getItem('intendedPath');
        if (intendedPath) {
          localStorage.removeItem('intendedPath');
          navigate(intendedPath);
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      console.error('Google login error:', err);
      const errorMessage = err.response?.data?.message || 'Google login विफल रहा।';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">वेबवार्ता</h1>
          <p className="text-gray-600">अपने खाते में लॉगिन करें</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              ईमेल एड्रेस
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="आपका ईमेल दर्ज करें"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition"
              disabled={loading}
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              पासवर्ड
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="अपना पासवर्ड दर्ज करें"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition"
              disabled={loading}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                लॉगिन हो रहा है...
              </>
            ) : (
              'लॉगिन करें'
            )}
          </button>

          {/* Google Login Button */}
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleLogin}
            className="w-full bg-white hover:bg-gray-50 disabled:bg-gray-100 border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 2c3.872 0 7.215 2.613 8.202 6.13h-3.463a3.537 3.537 0 0 0-4.739-3.592A3.568 3.568 0 0 0 8.534 7.6h3.268a7.047 7.047 0 0 1 2.464 5.4H2a7.077 7.077 0 0 1 3.266-3.235z"/>
              <path fill="#34A853" d="M12 22c3.872 0 7.215-2.613 8.202-6.13h-3.463a3.537 3.537 0 0 1-4.739 3.592 3.568 3.568 0 0 1-3.464-2.422H2c.713 2.386 2.917 4.471 5.602 5.282A7.096 7.096 0 0 0 12 22z"/>
              <path fill="#4285F4" d="M21.202 15.87h3.464c-.713 2.386-2.917 4.471-5.602 5.282A7.096 7.096 0 0 1 12 22v-7.13h9.202z"/>
              <path fill="#FBBC05" d="M5.266 9.765h3.268a3.537 3.537 0 0 1 4.739-3.592 3.568 3.568 0 0 1 3.464 2.422h3.463a7.077 7.077 0 0 0-8.202-6.13A7.047 7.047 0 0 0 2 12c0 1.3.264 2.536.765 3.765z"/>
            </svg>
            Google से लॉगिन करें
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-sm text-gray-600">या</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            खाता नहीं है?{' '}
            <Link
              to="/signup"
              className="text-red-600 hover:text-red-700 font-semibold transition"
            >
              साइन अप करें
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-sm text-gray-600 hover:text-gray-800 transition"
          >
            ← होम पर वापस जाएं
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
