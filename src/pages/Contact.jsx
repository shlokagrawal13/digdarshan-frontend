import React, { useState } from "react";
import { motion } from "framer-motion";
import Breadcrumb from "../components/Breadcrumb";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message sent successfully!");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="bg-white py-16 px-6">
      {/* Contact Us Heading */}
      <motion.h2
        className="text-5xl font-extrabold text-indigo-800 text-center mb-4"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Contact Us
      </motion.h2>

      {/* Breadcrumb Centered */}
      <motion.div
        className="flex justify-center mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
      >
        <Breadcrumb page="Contact Us" />
      </motion.div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
        {/* Contact Details */}
        <motion.div
          className="bg-indigo-50 p-10 rounded-xl shadow-lg"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <h3 className="text-2xl font-bold text-indigo-800 mb-6">Get in Touch</h3>
          <p className="text-gray-700 mb-4 leading-7">
            Digdarshan House 111, First Floor, Pratap Bhawan, Bahadur Shah Zafar Marg,
            ITO, New Rausen – 464551.
          </p>
          <p className="text-gray-700">
            📍 Location: <span className="font-medium">Raisen, India</span>
          </p>
          <p className="text-gray-700">
            📞 Phone: <span className="font-medium">8770887289</span>
          </p>
          <p className="text-gray-700">
            ✉️ Email: <span className="font-medium">Digdarshan@gmail.com</span>
          </p>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          className="bg-white p-10 rounded-xl shadow-lg border border-gray-200"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <h3 className="text-2xl font-bold text-indigo-800 mb-6">Send us a Message</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 transition"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 transition"
              required
            />
            <textarea
              name="message"
              placeholder="Your Message"
              rows="4"
              value={formData.message}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 transition"
              required
            />
            <button
              type="submit"
              className="bg-indigo-700 text-white px-6 py-3 rounded-lg hover:bg-indigo-900 transition duration-300"
            >
              Send Message
            </button>
          </form>
        </motion.div>
      </div>

      {/* Google Map Section */}
      <motion.div
        className="mt-16 overflow-hidden rounded-xl shadow-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <iframe
          title="Google Map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d28033.204388068268!2d77.240146!3d28.630217!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfcd6fb61df3f%3A0x52d9920ddb03f741!2sWebvarta%20News%20Agency!5e0!3m2!1sen!2sin!4v1709001234567!5m2!1sen!2sin"
          width="100%"
          height="400"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </motion.div>
    </div>
  );
};

export default Contact;
