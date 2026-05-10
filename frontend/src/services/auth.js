/**
 * AUTH SERVICE — connects to backend API
 * Uses username + password (not email).
 * JWT stored in localStorage.
 */

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const login = async (username, password) => {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim().toLowerCase(), password }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return { success: false, message: data.message || 'Invalid username or password' };
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    return { success: true, role: data.user.role, user: data.user };
  } catch (err) {
    return { success: false, message: 'Cannot connect to server. Make sure the backend is running.' };
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const getUser = () => {
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
};

export const getUserRole = () => {
  const user = getUser();
  return user ? user.role : null;
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});
