import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';

const INACTIVITY_TIMEOUT = 20 * 60 * 1000; // 20 minutes in milliseconds
const CHECK_INTERVAL = 60 * 1000; // Check every minute

export function useInactivityLogout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const lastActivityRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!user) return;

    // Update last activity time
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    // Activity event listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Check inactivity periodically
    const checkInactivity = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;

      if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
        console.log('Auto logout due to inactivity');
        signOut();
        navigate('/auth');
      }
    };

    timerRef.current = setInterval(checkInactivity, CHECK_INTERVAL);

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [user, signOut, navigate]);
}
