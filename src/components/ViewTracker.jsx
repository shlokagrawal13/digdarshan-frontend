import { useEffect, useRef } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const ViewTracker = ({ postId, onViewCountUpdate }) => {
  const viewRecorded = useRef(false);
  const sessionId = useRef(null);
  const viewStartTime = useRef(null);
  const timerRef = useRef(null); // Track the timer reference

  useEffect(() => {
    if (!postId || viewRecorded.current) return;

    // Generate or retrieve session ID
    if (!sessionId.current) {
      const savedSessionId = sessionStorage.getItem('viewSessionId');
      sessionId.current = savedSessionId || uuidv4();
      sessionStorage.setItem('viewSessionId', sessionId.current);
    }

    viewStartTime.current = Date.now();

    const recordView = async () => {
      if (viewRecorded.current) return; // Prevent duplicate recording

      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/social/${postId}/view`,
          {
            sessionId: sessionId.current,
            viewDuration: Math.floor((Date.now() - viewStartTime.current) / 1000)
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          viewRecorded.current = true;
          onViewCountUpdate?.(response.data.totalViews);
        }
      } catch (err) {
        console.error('View recording failed:', err);
      }
    };

    // Record view after 3 seconds to ensure genuine views
    timerRef.current = setTimeout(recordView, 3000);

    // Cleanup and prevent duplicate recording
    return () => {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    };
  }, [postId, onViewCountUpdate]);

  return null;
};

export default ViewTracker;
