import React from "react";
import NewsSection from "../../components/NewsSection";

const MadhyaPradesh = () => {
  return <NewsSection title="मध्य प्रदेश" apiUrl={`${process.env.REACT_APP_API_URL}/api/news/madhyapradesh`}/>;
};

export default MadhyaPradesh;
