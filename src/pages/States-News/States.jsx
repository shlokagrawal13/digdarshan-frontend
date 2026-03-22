import React from "react";
import NewsSection from "../../components/NewsSection";


const States = () => {
  return <NewsSection title="राज्य" apiUrl={`${process.env.REACT_APP_API_URL}/api/news/state`} />;
};

export default States;
