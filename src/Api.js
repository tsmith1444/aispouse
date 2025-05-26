import axios from 'axios';

// Get the base URL for API calls
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' // Empty string for same-origin requests in production
  : 'http://localhost:5000'; // Development server

// Get user profile
export const getProfile = async (userId ) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/profile/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

// Create or update user profile
export const createProfile = async (profileData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/profile`, profileData);
    return response.data;
  } catch (error) {
    console.error('Error creating profile:', error);
    throw error;
  }
};

// Send message and get AI response
export const sendMessage = async (userId, message) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/chat/${userId}`, { message });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};
