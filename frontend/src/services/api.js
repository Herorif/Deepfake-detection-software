import axios from 'axios';

// Configure base URL - update this when backend is ready
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout for file uploads
});

// Analyze media file
export const analyzeMedia = async (formData) => {
  try {
    const response = await api.post('/api/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Get analysis status (for long-running processes)
export const getAnalysisStatus = async (taskId) => {
  try {
    const response = await api.get(`/api/analysis-status/${taskId}`);
    return response.data;
  } catch (error) {
    console.error('Status check failed:', error);
    throw error;
  }
};

export default api;