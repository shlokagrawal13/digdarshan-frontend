import React from "react";
import NewsSection from "../../components/NewsSection";


const UttarPradesh = () => {
  return <NewsSection title="उत्तर प्रदेश" apiUrl={`${process.env.REACT_APP_API_URL}/api/news/uttarpradesh`} />;
};

export default UttarPradesh;

