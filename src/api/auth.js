import { apiRequest } from './client.js';

/**
 * Log in an existing user. Resolves to `{ token, user }`.
 * @param {{ email: string, password: string }} credentials
 */
export async function loginUser(credentials) {
  return await apiRequest('/auth/login', {
    method: 'POST',
    body: credentials
  });
}

/**
 * Register a new user.
 * @param {{ name: string, email: string, password: string }} credentials
 */
export async function registerUser(credentials) {
  return await apiRequest('/auth/register', {
    method: 'POST',
    body: credentials
  });
}

/**
 * Check whether the backend API is reachable.
 */
export async function checkApiHealth() {
  return await apiRequest('/health', { method: 'GET' });
}
