import React from 'react'
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Breadcrumb = ({ page }) => {
  return (
    <motion.div 
      className="text-base text-gray-600 mb-10"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 1 }}
    >
      <Link to="/" className="text-indigo-800 hover:underline">Home</Link> &nbsp;/&nbsp; {page}
    </motion.div>
  );
};

export default Breadcrumb