import React from "react";
import NewsSection from "../../components/NewsSection";



const HealthNews = () => {
  return <NewsSection title="स्वास्थ्य" apiUrl={`${process.env.REACT_APP_API_URL}/api/news/health`} />;
};

export default HealthNews;