import React from "react";
import NewsSection from "../../components/NewsSection";


const OtherStates = () => {
  return <NewsSection title="अन्य राज्य" apiUrl={`${process.env.REACT_APP_API_URL}/api/news/otherstates`} />;
};

export default OtherStates;
