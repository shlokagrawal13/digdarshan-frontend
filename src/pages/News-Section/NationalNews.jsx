import React from "react";
import NewsSection from "../../components/NewsSection";



const NationalNews = () => {
  return <NewsSection title="राष्ट्रीय " apiUrl={`${process.env.REACT_APP_API_URL}/api/news/national`} />;
};

export default NationalNews;