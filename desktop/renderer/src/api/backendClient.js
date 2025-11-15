const API_URL = 'http://localhost:8000';

export async function analyzeMedia(file, context) {
  const formData = new FormData();
  formData.append('file', file);
  if (context) {
    formData.append('context', context);
  }

  const response = await fetch(`${API_URL}/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Backend error: ${text}`);
  }

  return response.json();
}
