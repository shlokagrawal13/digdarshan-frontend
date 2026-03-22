import React from "react";
import NewsSection from "../../components/NewsSection";



const LifestyleNews = () => {
  return <NewsSection title="लाइफस्टाइल" apiUrl={`${process.env.REACT_APP_API_URL}/api/news/lifestyle`} />;
};

export default LifestyleNews;