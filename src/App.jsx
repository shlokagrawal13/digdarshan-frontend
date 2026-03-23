import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import SubscriptionForm from "./pages/SubscriptionForm";
import MadhyaPradesh from "./pages/States-News/MadhyaPradeshNews";
import States from "./pages/States-News/States";
import UttarPradesh from "./pages/States-News/UttarPradeshNews";
import Chhattisgarh from "./pages/States-News/ChhattisgarhNews";
import OtherStates from "./pages/States-News/OtherStatesNews";
import NationalNews from "./pages/News-Section/NationalNews";
import InternationalNews from "./pages/News-Section/InternationalNews";
import BusinessNews from "./pages/News-Section/BusinessNews";
import SportsNews from "./pages/News-Section/SportsNews";
import EntertainmentNews from "./pages/News-Section/EntertainmentNews";
import HoroscopeNews from "./pages/News-Section/HoroscopeNews";
import TechnologyNews from "./pages/News-Section/TechnologyNews";
import HealthNews from "./pages/News-Section/HealthNews";
import EducationNews from "./pages/News-Section/EducationNews";
import LifestyleNews from "./pages/News-Section/LifestyleNews";
import NewsDetail from "./pages/NewsDetail";
import { UserProvider } from './contexts/UserContext';
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";

import axios from 'axios';
import SearchResults from "./pages/SearchResults";
import NewsDownloadSection from "./components/NewsDownloadSection";

// Add axios interceptor for auth
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Add base URL
    if (!config.url.includes('http')) {
      config.url = `${process.env.REACT_APP_API_URL}${config.url}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 429) {
      // Wait for 1 second and retry
      await new Promise(resolve => setTimeout(resolve, 1000));
      return axios(error.config);
    }
    return Promise.reject(error);
  }
);

const App = () => {
  return (
    <UserProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/subscription" element={<SubscriptionForm />} />
          <Route path="/about-us" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact-us" element={<Contact />} />
          <Route path="/national" element={<NationalNews />} />
          <Route path="/international" element={<InternationalNews />} />
          <Route path="/business" element={<BusinessNews />} />
          <Route path="/sports" element={<SportsNews />} />
          <Route path="/entertainment" element={<EntertainmentNews />} />
          <Route path="/horoscope" element={<HoroscopeNews />} />
          <Route path="/technology" element={<TechnologyNews />} />
          <Route path="/health" element={<HealthNews />} />
          <Route path="/education" element={<EducationNews />} />
          <Route path="/lifestyle" element={<LifestyleNews />} />
          <Route path="/States" element={<States />} />
          <Route path="/madhya-pradesh" element={<MadhyaPradesh />} />
          <Route path="/uttar-pradesh" element={<UttarPradesh />} />
          <Route path="/chhattisgarh" element={<Chhattisgarh />} />
          <Route path="/other-states" element={<OtherStates />} />
          <Route
            path="/news-detail/:id"
            element={

              <NewsDetail />

            }
          />

          <Route path="/search" element={<SearchResults />} />
          <Route path="/NewsDownload" element={<NewsDownloadSection />} />
          {/* <Route path="/national" element={<Rastriya />} /> */}
        </Routes>
        <Footer />
      </Router>
    </UserProvider>
  );
};

export default App;
