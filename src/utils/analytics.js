// src/utils/analytics.js - CooliMate Analytics Tracking

// Use window global or fallback to localhost
const API_BASE_URL = typeof window !== 'undefined' && window.REACT_APP_API_URL 
  ? window.REACT_APP_API_URL 
  : 'https://cooliemate.onrender.com/api';

/**
 * Generate or retrieve session ID
 * Session ID persists for the duration of the browser session
 */
export const getSessionId = () => {
  let sessionId = sessionStorage.getItem('coolimate_session');
  
  if (!sessionId) {
    // Generate unique session ID
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('coolimate_session', sessionId);
    console.log('📊 New session created:', sessionId);
  }
  
  return sessionId;
};

/**
 * Detect device type from user agent
 */
const detectDevice = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/mobile|android|iphone|ipod|blackberry|windows phone/i.test(userAgent)) {
    return 'mobile';
  } else if (/ipad|tablet|playbook|silk/i.test(userAgent)) {
    return 'tablet';
  } else {
    return 'desktop';
  }
};

/**
 * Detect browser from user agent
 */
const detectBrowser = () => {
  const userAgent = navigator.userAgent;
  
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('SamsungBrowser')) return 'Samsung Browser';
  if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera';
  if (userAgent.includes('Trident') || userAgent.includes('MSIE')) return 'Internet Explorer';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari')) return 'Safari';
  
  return 'Other';
};

/**
 * Detect operating system from user agent
 */
const detectOS = () => {
  const userAgent = navigator.userAgent;
  
  if (userAgent.includes('Windows NT 10.0')) return 'Windows 10';
  if (userAgent.includes('Windows NT 6.3')) return 'Windows 8.1';
  if (userAgent.includes('Windows NT 6.2')) return 'Windows 8';
  if (userAgent.includes('Windows NT 6.1')) return 'Windows 7';
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac OS X')) return 'MacOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
  
  return 'Other';
};

/**
 * Track page visit
 * Call this function when a user visits any page
 * 
 * @param {string} page - The page path (e.g., '/', '/book', '/about')
 */
export const trackPageVisit = async (page) => {
  try {
    const sessionId = getSessionId();
    const userAgent = navigator.userAgent;
    const device = detectDevice();
    const browser = detectBrowser();
    const os = detectOS();

    const visitData = {
      sessionId,
      userAgent,
      page,
      device,
      browser,
      os
    };

    console.log('📊 Tracking page visit:', page);

    const response = await fetch(`${API_BASE_URL}/analytics/visit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(visitData)
    });

    if (!response.ok) {
      throw new Error('Failed to track visit');
    }

    const data = await response.json();
    console.log('✅ Visit tracked successfully');
    return data;
  } catch (error) {
    console.error('❌ Analytics tracking error:', error);
    // Don't throw error - analytics should fail silently
  }
};

/**
 * Link visit to booking
 * Call this function when a user successfully creates a booking
 * 
 * @param {string} bookingId - The booking ID
 */
export const linkVisitToBooking = async (bookingId) => {
  try {
    const sessionId = getSessionId();

    console.log('📊 Linking visit to booking:', bookingId);

    const response = await fetch(`${API_BASE_URL}/analytics/visit/${sessionId}/booking`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bookingId })
    });

    if (!response.ok) {
      throw new Error('Failed to link booking');
    }

    const data = await response.json();
    console.log('✅ Booking linked to visit successfully');
    return data;
  } catch (error) {
    console.error('❌ Error linking booking:', error);
    // Don't throw error - analytics should fail silently
  }
};

/**
 * Track custom event (optional - for future use)
 * 
 * @param {string} eventName - Name of the event
 * @param {object} eventData - Additional data for the event
 */
export const trackEvent = async (eventName, eventData = {}) => {
  try {
    const sessionId = getSessionId();
    
    console.log('📊 Tracking event:', eventName, eventData);

    // You can add a custom events endpoint in the backend if needed
    // For now, this is a placeholder for future implementation
    
    console.log('Event tracked:', { sessionId, eventName, eventData });
  } catch (error) {
    console.error('❌ Event tracking error:', error);
  }
};

/**
 * Get analytics summary for current session (optional)
 */
export const getSessionAnalytics = () => {
  const sessionId = getSessionId();
  const device = detectDevice();
  const browser = detectBrowser();
  const os = detectOS();
  
  return {
    sessionId,
    device,
    browser,
    os,
    userAgent: navigator.userAgent
  };
};

// Export all functions
export default {
  getSessionId,
  trackPageVisit,
  linkVisitToBooking,
  trackEvent,
  getSessionAnalytics
};