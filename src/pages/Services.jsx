import React from "react";
import { motion } from "framer-motion";
import Breadcrumb from "../components/Breadcrumb";

const services = [
  {
    title: "Hindi News Feed",
    description: [
      "Detailed coverage of all events from around the country and the world.",
      "Daily production of 400+ stories.",
      "Coverage across all categories – national, political, regional and states, international, business, sports, legal, entertainment, lifestyle, science and technology, and features."
    ],
  },
  {
    title: "Photos Feed",
    description: [
      "Eye-catching and high-resolution images from our extensive photo network across the country.",
      "Coverage of major political events, emergency situations, natural calamities and disasters, business, sports, and entertainment.",
      "Daily production of 90–100 photos."
    ],
  },
];

const Services = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 50 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.3, duration: 0.8 }
    })
  };

  return (
    <div className="py-20 bg-white text-center">
      <motion.h2 
        className="text-5xl font-extrabold text-indigo-800 mb-2 capitalize"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        custom={0}
      >
        Services
      </motion.h2>
      <Breadcrumb page="Services" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 px-10">
        {services.map((service, index) => (
          <motion.div
            key={index}
            initial="hidden"
            whileInView="visible"
            variants={fadeIn}
            custom={index + 1}
            viewport={{ once: true }}
            className="bg-indigo-700 text-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
            <ul className="text-left space-y-3">
              {service.description.map((point, i) => (
                <motion.li 
                  key={i} 
                  variants={fadeIn} 
                  custom={index + i + 2} 
                  initial="hidden" 
                  whileInView="visible" 
                  viewport={{ once: true }}
                  className="flex items-start gap-2"
                >
                  <span className="text-lg">✔️</span>
                  <span>{point}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Services;