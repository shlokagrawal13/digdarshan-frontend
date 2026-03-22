import React from "react";
import NewsSection from "../../components/NewsSection";



const EducationNews = () => {
  return <NewsSection title="शिक्षा " apiUrl={`${process.env.REACT_APP_API_URL}/api/news/education`} />;
};

export default EducationNews;