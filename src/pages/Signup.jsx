import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../config/firebase';

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Preview image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setProfileImage(file);
    }
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('कृपया सभी फील्ड भरें');
      return false;
    }

    if (formData.password.length < 6) {
      setError('पासवर्ड कम से कम 6 वर्ण लंबा होना चाहिए');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('पासवर्ड मेल नहीं खा रहे हैं');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('कृपया एक मान्य ईमेल एड्रेस दर्ज करें');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
        name: formData.fullName,  // 👈 fullName को name में convert
        email: formData.email,
        password: formData.password,
      });

      if (response.status === 201 || response.status === 200) {
        setSuccessMessage('साइन अप सफल! कृपया अपनी ईमेल को सत्यापित करें और लॉगिन करें।');
        setFormData({
          fullName: '',
          email: '',
          password: '',
          confirmPassword: '',
        });
        setProfileImage(null);
        setImagePreview(null);

        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'साइन अप विफल रहा। कृपया दोबारा कोशिश करें।';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
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
        navigate('/');
      }
    } catch (err) {
      console.error('Google signup error:', err);
      const errorMessage = err.response?.data?.message || 'Google signup विफल रहा।';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8" >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">वेबवार्ता</h1>
          <p className="text-gray-600">नया खाता बनाएं</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name Field */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
              पूरा नाम
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="अपना पूरा नाम दर्ज करें"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition"
              disabled={loading}
            />
          </div>

          {/* Profile Image Field (Optional) */}
          <div>
            <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700 mb-2">
              प्रोफाइल फोटो (वैकल्पिक)
            </label>
            <div className="flex items-center gap-4">
              <label 
                htmlFor="profileImage"
                className="flex-1 cursor-pointer"
              >
                <div className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-600 transition text-center">
                  <p className="text-sm text-gray-600">अपनी फोटो चुनें</p>
                </div>
              </label>
              <input
                type="file"
                id="profileImage"
                name="profileImage"
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
                disabled={loading}
              />
              {imagePreview && (
                <img 
                  src={imagePreview} 
                  alt="Profile preview" 
                  className="w-16 h-16 rounded-full object-cover border-2 border-red-600"
                />
              )}
            </div>
          </div>

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
              placeholder="एक मजबूत पासवर्ड दर्ज करें"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">कम से कम 6 वर्ण</p>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              पासवर्ड की पुष्टि करें
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="पासवर्ड दोबारा दर्ज करें"
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
                साइन अप हो रहा है...
              </>
            ) : (
              'साइन अप करें'
            )}
          </button>

          {/* Google Signup Button */}
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleSignup}
            className="w-full bg-white hover:bg-gray-50 disabled:bg-gray-100 border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 2c3.872 0 7.215 2.613 8.202 6.13h-3.463a3.537 3.537 0 0 0-4.739-3.592A3.568 3.568 0 0 0 8.534 7.6h3.268a7.047 7.047 0 0 1 2.464 5.4H2a7.077 7.077 0 0 1 3.266-3.235z" />
              <path fill="#34A853" d="M12 22c3.872 0 7.215-2.613 8.202-6.13h-3.463a3.537 3.537 0 0 1-4.739 3.592 3.568 3.568 0 0 1-3.464-2.422H2c.713 2.386 2.917 4.471 5.602 5.282A7.096 7.096 0 0 0 12 22z" />
              <path fill="#4285F4" d="M21.202 15.87h3.464c-.713 2.386-2.917 4.471-5.602 5.282A7.096 7.096 0 0 1 12 22v-7.13h9.202z" />
              <path fill="#FBBC05" d="M5.266 9.765h3.268a3.537 3.537 0 0 1 4.739-3.592 3.568 3.568 0 0 1 3.464 2.422h3.463a7.077 7.077 0 0 0-8.202-6.13A7.047 7.047 0 0 0 2 12c0 1.3.264 2.536.765 3.765z" />
            </svg>
            Google से साइन अप करें
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-gray-300" />
          <span className="px-4 text-sm text-gray-600">या</span>
          <div className="flex-1 border-t border-gray-300" />
        </div>

        <div className="text-center">
          <p className="text-gray-600 mb-4">
            पहले से खाता है?{' '}
            <Link
              to="/login"
              className="text-red-600 hover:text-red-700 font-semibold transition"
            >
              लॉगिन करें
            </Link>
          </p>
        </div>

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
}

export default Signup;
