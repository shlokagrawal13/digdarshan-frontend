import React from "react";
import NewsSection from "../../components/NewsSection";



const HoroscopeNews = () => {
  return <NewsSection title="राशिफल" apiUrl={`${process.env.REACT_APP_API_URL}/api/news/horoscope`} />;
};

export default HoroscopeNews;