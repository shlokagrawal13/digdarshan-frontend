import React from 'react';
import { Navigate } from 'react-router-dom';

// This component redirects to the main login page
const SubscriberLogin = () => {
  return <Navigate to="/login" replace />;
};

export default SubscriberLogin;
