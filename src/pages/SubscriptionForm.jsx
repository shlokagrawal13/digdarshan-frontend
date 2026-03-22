import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SubscriptionForm = () => {
  const [formData, setFormData] = useState({
    dateTime: '',
    newspaperName: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    designation: '',
    website: '',
    serviceAddress: '',
    purpose: '',
    frequency: 'Daily दैनिक',
    circulation: '',
    rniNo: '',
    abcCertificate: '',
    contactPerson: {
      firstName: '',
      lastName: '',
      designation: '',
      phone: '',
      email: ''
    }
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [touchEnabled, setTouchEnabled] = useState(false);

  // Touch event handlers
  const handleTouchStart = (e) => {
    setTouchEnabled(true);
  };

  const handleTouchEnd = () => {
    setTouchEnabled(false);
  };

  // Validation
  const validate = () => {
    const newErrors = {};
    
    if (!formData.dateTime) newErrors.dateTime = 'Date and time are required';
    if (!formData.newspaperName) newErrors.newspaperName = 'Newspaper name is required';
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';    if (!formData.email) newErrors.email = 'Email is required';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.serviceAddress) newErrors.serviceAddress = 'Service address is required';
    if (!formData.purpose) newErrors.purpose = 'Purpose is required';
    if (!formData.circulation) newErrors.circulation = 'Circulation is required';
    if (!formData.contactPerson.firstName) newErrors['contactPerson.firstName'] = 'Contact person first name is required';
    if (!formData.contactPerson.lastName) newErrors['contactPerson.lastName'] = 'Contact person last name is required';
    if (!formData.contactPerson.designation) newErrors['contactPerson.designation'] = 'Contact person designation is required';
    if (!formData.contactPerson.phone) newErrors['contactPerson.phone'] = 'Contact person phone is required';    if (!formData.contactPerson.email) newErrors['contactPerson.email'] = 'Contact person email is required';
    if (formData.contactPerson.email && !/\S+@\S+\.\S+/.test(formData.contactPerson.email)) {
      newErrors['contactPerson.email'] = 'Invalid contact person email format';
    }

    return newErrors;
  };

  // Change handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('contactPerson.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contactPerson: {
          ...prev.contactPerson,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fill in all required fields correctly');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/subscriptions`, formData);
      toast.success('Subscription submitted successfully!');
      setFormData({
        dateTime: '',
        newspaperName: '',
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        designation: '',
        website: '',
        serviceAddress: '',
        purpose: '',
        frequency: 'Daily दैनिक',
        circulation: '',
        rniNo: '',
        abcCertificate: '',
        contactPerson: {
          firstName: '',
          lastName: '',
          designation: '',
          phone: '',
          email: ''
        }
      });
      setErrors({});
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error.response?.data?.error || 'Failed to submit subscription');
    } finally {
      setLoading(false);
    }
  };

  // Input style with error states
  const inputStyle = (fieldName) => {
    return `w-full border ${
      errors[fieldName] ? 'border-red-500' : 'border-gray-300'
    } p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`;
  };

  const labelStyle = "block mb-2 font-medium text-gray-700";

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={5000} />
      
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-center mb-8 text-gray-800"
        >
          Subscription Form
        </motion.h2>

        <form 
          onSubmit={handleSubmit}
          className="space-y-6"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Date and Time */}
          <div>
            <label htmlFor="dateTime" className={labelStyle}>
              Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              id="dateTime"
              name="dateTime"
              value={formData.dateTime}
              onChange={handleChange}
              className={inputStyle('dateTime')}
            />
            {errors.dateTime && (
              <p className="mt-1 text-sm text-red-500">{errors.dateTime}</p>
            )}
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="newspaperName" className={labelStyle}>
                Newspaper Name/Organization <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="newspaperName"
                name="newspaperName"
                value={formData.newspaperName}
                onChange={handleChange}
                className={inputStyle('newspaperName')}
              />
              {errors.newspaperName && (
                <p className="mt-1 text-sm text-red-500">{errors.newspaperName}</p>
              )}
            </div>
            <div>
              <label htmlFor="frequency" className={labelStyle}>
                Frequency of Publication <span className="text-red-500">*</span>
              </label>
              <select
                id="frequency"
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                className={inputStyle('frequency')}
              >
                <option>Daily दैनिक</option>
                <option>Weekly साप्ताहिक</option>
                <option>Monthly मासिक</option>
              </select>
            </div>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className={labelStyle}>
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={inputStyle('firstName')}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
              )}
            </div>
            <div>
              <label htmlFor="lastName" className={labelStyle}>
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={inputStyle('lastName')}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="phone" className={labelStyle}>
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={inputStyle('phone')}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
              )}
            </div>
            <div>
              <label htmlFor="email" className={labelStyle}>
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={inputStyle('email')}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="designation" className={labelStyle}>Designation</label>
              <input
                type="text"
                id="designation"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded-md"
              />
            </div>
            <div>
              <label htmlFor="website" className={labelStyle}>Website/URL</label>
              <input
                type="text"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded-md"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label htmlFor="serviceAddress" className={labelStyle}>
              Address Where Service Is To be Provided <span className="text-red-500">*</span>
            </label>
            <textarea
              id="serviceAddress"
              name="serviceAddress"
              value={formData.serviceAddress}
              onChange={handleChange}
              className={inputStyle('serviceAddress')}
              rows="3"
            ></textarea>
            {errors.serviceAddress && (
              <p className="mt-1 text-sm text-red-500">{errors.serviceAddress}</p>
            )}
          </div>

          {/* Purpose */}
          <div>
            <label htmlFor="purpose" className={labelStyle}>
              Purpose of Subscription <span className="text-red-500">*</span>
            </label>
            <textarea
              id="purpose"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              className={inputStyle('purpose')}
              rows="2"
            ></textarea>
            {errors.purpose && (
              <p className="mt-1 text-sm text-red-500">{errors.purpose}</p>
            )}
          </div>

          {/* Publication Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="circulation" className={labelStyle}>
                Circulation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="circulation"
                name="circulation"
                value={formData.circulation}
                onChange={handleChange}
                className={inputStyle('circulation')}
              />
              {errors.circulation && (
                <p className="mt-1 text-sm text-red-500">{errors.circulation}</p>
              )}
            </div>
            <div>
              <label htmlFor="rniNo" className={labelStyle}>RNI No</label>
              <input
                type="text"
                id="rniNo"
                name="rniNo"
                value={formData.rniNo}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded-md"
              />
            </div>
            <div>
              <label htmlFor="abcCertificate" className={labelStyle}>ABC Certificate</label>
              <input
                type="text"
                id="abcCertificate"
                name="abcCertificate"
                value={formData.abcCertificate}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded-md"
              />
            </div>
          </div>

          {/* Contact Person Details */}
          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Contact Person Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="contactPerson.firstName" className={labelStyle}>
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="contactPerson.firstName"
                  name="contactPerson.firstName"
                  value={formData.contactPerson.firstName}
                  onChange={handleChange}
                  className={inputStyle('contactPerson.firstName')}
                />
                {errors['contactPerson.firstName'] && (
                  <p className="mt-1 text-sm text-red-500">{errors['contactPerson.firstName']}</p>
                )}
              </div>
              <div>
                <label htmlFor="contactPerson.lastName" className={labelStyle}>
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="contactPerson.lastName"
                  name="contactPerson.lastName"
                  value={formData.contactPerson.lastName}
                  onChange={handleChange}
                  className={inputStyle('contactPerson.lastName')}
                />
                {errors['contactPerson.lastName'] && (
                  <p className="mt-1 text-sm text-red-500">{errors['contactPerson.lastName']}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <div>
                <label htmlFor="contactPerson.designation" className={labelStyle}>
                  Designation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="contactPerson.designation"
                  name="contactPerson.designation"
                  value={formData.contactPerson.designation}
                  onChange={handleChange}
                  className={inputStyle('contactPerson.designation')}
                />
                {errors['contactPerson.designation'] && (
                  <p className="mt-1 text-sm text-red-500">{errors['contactPerson.designation']}</p>
                )}
              </div>
              <div>
                <label htmlFor="contactPerson.phone" className={labelStyle}>
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="contactPerson.phone"
                  name="contactPerson.phone"
                  value={formData.contactPerson.phone}
                  onChange={handleChange}
                  className={inputStyle('contactPerson.phone')}
                />
                {errors['contactPerson.phone'] && (
                  <p className="mt-1 text-sm text-red-500">{errors['contactPerson.phone']}</p>
                )}
              </div>
              <div>
                <label htmlFor="contactPerson.email" className={labelStyle}>
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="contactPerson.email"
                  name="contactPerson.email"
                  value={formData.contactPerson.email}
                  onChange={handleChange}
                  className={inputStyle('contactPerson.email')}
                />
                {errors['contactPerson.email'] && (
                  <p className="mt-1 text-sm text-red-500">{errors['contactPerson.email']}</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8">
            <motion.button
              type="submit"
              disabled={loading}
              className={`w-full bg-blue-600 text-white py-3 px-6 rounded-md font-medium ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
              } transition duration-200`}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? 'Submitting...' : 'Submit Subscription'}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubscriptionForm;