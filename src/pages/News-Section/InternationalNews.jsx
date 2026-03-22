import React from "react";
import NewsSection from "../../components/NewsSection";



const  InternationalNews = () => {
  return <NewsSection title="अंतर्राष्ट्रीय" apiUrl={`${process.env.REACT_APP_API_URL}/api/news/international`} />;
};

export default  InternationalNews;