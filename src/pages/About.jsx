import React from "react";
import { motion } from "framer-motion";
import Breadcrumb from "../components/Breadcrumb";

const About = () => {
  const timeline = {
    hidden: { opacity: 0, y: 50 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.3, duration: 1 }
    })
  };

  return (
    <div className="bg-gray-100 py-20 text-center">
      <motion.h2 
        className="text-5xl font-extrabold text-indigo-800 mb-2 capitalize"
        initial="hidden"
        animate="visible"
        custom={0}
        variants={timeline}
      >
        About Us
      </motion.h2>
      <Breadcrumb page="About Us" />
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-10 text-left">
        {[
          "The National News Agency DIG DARSHAN having nationwide network, is the largest serving news agency in India. It was established in 2009.",
          "DIG DARSHAN News Agency is registered under TM Act, 1999, Ministry of Commerce & Industrial Policy & Promotion Government of India. DIG DARSHAN is accredited by Press Information Bureau (PIB), Ministry of Information and Broadcasting Government of India.",
          "Subscribers of DIG DARSHAN have so far reached a large number of newspapers, magazines, and online media. A pool of reporters scattered throughout the country contributes to the news service and photo file every day.",
          "DIG DARSHAN correspondents are based in major capitals and important business centers worldwide, serving news and photos with speed, accuracy, and objectivity."
        ].map((text, i) => (
          <motion.p
            key={i}
            className="text-lg text-gray-700 leading-relaxed mb-6"
            initial="hidden"
            animate="visible"
            custom={i + 1}
            variants={timeline}
          >
            {text}
          </motion.p>
        ))}
        <motion.div 
          className="bg-indigo-100 p-6 rounded-lg shadow-md mt-8"
          initial="hidden"
          animate="visible"
          custom={5}
          variants={timeline}
        >
          <h3 className="text-xl font-semibold text-indigo-800 mb-4">Contact Us</h3>
          <p className="text-gray-700">Address: 111, First Floor, Pratap Bhawan, Bahadur Shah Zafar Marg, ITO, Raisen-464551, India</p>
          <p className="text-gray-700">E-mail: Digdarshan@gmail.com</p>
          <p className="text-gray-700">Phone: 8770887289</p>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
