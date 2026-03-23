import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Verifying your email...');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await axios.get(`/api/auth/verify-email/${token}`);
        if (response.data) {
          let text = response.data.message || 'Email Verified Successfully!';
          if (response.data.approvalStatus) {
            text += '\n\n' + response.data.approvalStatus;
          }
          setStatus(text);
          setIsSuccess(true);
          setIsAdmin(response.data.isAdmin);
        }
      } catch (error) {
        setStatus(error.response?.data?.error || 'Invalid or Expired Link');
        setIsSuccess(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (token) {
      verifyToken();
    }
  }, [token]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', backgroundColor: '#f9fafb' }}>
      <div style={{ padding: '40px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '500px', width: '100%' }}>
        <h2 style={{ color: isLoading ? '#3b82f6' : isSuccess ? '#059669' : '#dc2626', marginBottom: '20px' }}>
          {isLoading ? 'Verifying...' : isSuccess ? 'Verification Successful' : 'Verification Failed'}
        </h2>
        <p style={{ color: '#4b5563', marginBottom: '30px', fontSize: '18px', whiteSpace: 'pre-line' }}>{status}</p>
        
        {!isLoading && (
          <button 
            onClick={() => {
              if (isAdmin) {
                const adminBaseUrl = process.env.REACT_APP_ADMIN_URL || 'https://digdarshanadmin.vercel.app';
                window.location.href = `${adminBaseUrl}/admin/login`;
              } else {
                navigate('/login');
              }
            }}
            style={{
              backgroundColor: '#2563eb', padding: '12px 24px', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', width: '100%'
            }}
          >
            {isAdmin ? 'Go to Admin Login' : 'Go to Login'}
          </button>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
