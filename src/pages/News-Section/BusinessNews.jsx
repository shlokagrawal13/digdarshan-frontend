import React from "react";
import NewsSection from "../../components/NewsSection";



const BusinessNews = () => {
  return <NewsSection title="कारोबार" apiUrl={`${process.env.REACT_APP_API_URL}/api/news/business`}  />;
};

export default BusinessNews;