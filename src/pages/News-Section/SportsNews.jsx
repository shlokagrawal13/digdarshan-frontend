import React from "react";
import NewsSection from "../../components/NewsSection";



const SportsNews = () => {
  return <NewsSection title="खेल" apiUrl={`${process.env.REACT_APP_API_URL}/api/news/sports`}/>;
};

export default SportsNews;