const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Universal fetch wrapper for the Task Manager REST API.
 * Automatically injects JWT Bearer tokens and parses responses.
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  let response;
  try {
    response = await fetch(url, config);
  } catch (networkError) {
    const error = new Error('Unable to connect to server. Please ensure the backend is running.');
    error.status = 0;
    throw error;
  }

  // Parse JSON response safely
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = (data && data.message) || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.errors = (data && data.errors) || null;
    error.data = data;

    // If 401 Unauthorized occurs on an authenticated route, clear stale token
    if (response.status === 401 && token) {
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }

    throw error;
  }

  return data;
}
