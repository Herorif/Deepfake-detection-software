const API_URL = 'http://localhost:8000';
const API_KEY = 'local-demo-key'; // Keep in sync with backend/app/config.py (DEEPFAKE_API_KEY).

const authHeaders = API_KEY ? { 'X-API-Key': API_KEY } : {};

export async function analyzeMedia(file, context) {
  const formData = new FormData();
  formData.append('file', file);
  if (context) {
    formData.append('context', context);
  }

  const response = await fetch(`${API_URL}/analyze`, {
    method: 'POST',
    body: formData,
    headers: authHeaders,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Backend error: ${text}`);
  }

  return response.json();
}

export async function fetchStats() {
  const response = await fetch(`${API_URL}/stats`, {
    headers: authHeaders,
  });
  if (!response.ok) {
    throw new Error('Failed to load stats');
  }
  return response.json();
}

export async function fetchThreats() {
  const response = await fetch(`${API_URL}/threats`, {
    headers: authHeaders,
  });
  if (!response.ok) {
    throw new Error('Failed to load threat definitions');
  }
  return response.json();
}
