import React from "react";
import NewsSection from "../../components/NewsSection";



const EntertainmentNews = () => {
  return <NewsSection title="मनोरंजन" apiUrl={`${process.env.REACT_APP_API_URL}/api/news/entertainment`}/>;
};

export default EntertainmentNews;