import React from "react";
import NewsSection from "../../components/NewsSection";



const Chhattisgarh = () => {
  return <NewsSection title="छत्तीसगढ़" apiUrl={`${process.env.REACT_APP_API_URL}/api/news/chhattisgarh`} />;
};

export default Chhattisgarh;
