import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API_KEY = process.env.REACT_APP_API_KEY || 'local-demo-key';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

export const analyzeMedia = async (formData) => {
  const response = await api.post('/analyze', formData, {
    headers: {
      'X-API-Key': API_KEY,
    },
  });
  return response.data;
};

export default api;
