import React from "react";
import NewsSection from "../../components/NewsSection";



const TechnologyNews = () => {
  return <NewsSection title="टेक्नोलॉजी" apiUrl={`${process.env.REACT_APP_API_URL}/api/news/technology`} />;
};

export default TechnologyNews;