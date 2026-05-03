/**
 * AUTH SERVICE
 * Real API login for student + teacher roles.
 * Admin stays local-only (no admin backend yet).
 *
 * Token is stored as 'campuslink_token' (same key studentApi.js reads).
 * User object is stored as 'campuslink_user'.
 */

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ── Local-only admin demo account ─────────────────────────────────────────────
const ADMIN_DEMO = {
  email: 'admin@test.com',
  password: '1234',
  role: 'admin',
  name: 'Mr. Tariq Mehmood',
  adminId: 'A-001',
};

// ── Real API login (student + teacher) ───────────────────────────────────────

async function apiLogin(email, password) {
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) return null;

    // Store token + user for the rest of the app
    localStorage.setItem('campuslink_token', json.data.token);
    localStorage.setItem('campuslink_user', JSON.stringify(json.data.user));
    // Legacy key some pages still read
    localStorage.setItem('user', JSON.stringify(json.data.user));

    return json.data.user;
  } catch {
    return null;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export const login = async (email, password) => {
  // 1. Admin demo stays local
  if (email === ADMIN_DEMO.email && password === ADMIN_DEMO.password) {
    localStorage.setItem('user', JSON.stringify(ADMIN_DEMO));
    localStorage.setItem('campuslink_user', JSON.stringify(ADMIN_DEMO));
    return { success: true, role: 'admin' };
  }

  // 2. Try real API for student / teacher
  const user = await apiLogin(email, password);
  if (user) return { success: true, role: user.role };

  // 3. Fallback: check any registered users stored locally
  const storedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  const stored = storedUsers.find(u => u.email === email && u.password === password);
  if (stored) {
    localStorage.setItem('user', JSON.stringify(stored));
    localStorage.setItem('campuslink_user', JSON.stringify(stored));
    return { success: true, role: stored.role };
  }

  return { success: false };
};

export const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('campuslink_user');
  localStorage.removeItem('campuslink_token');
};

export const isAuthenticated = () => localStorage.getItem('campuslink_token') !== null || localStorage.getItem('user') !== null;

export const getUser = () => {
  try {
    const raw = localStorage.getItem('campuslink_user') || localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

export const getUserRole = () => {
  const user = getUser();
  return user ? user.role : null;
};

// ── Legacy signup (kept for signup page compatibility) ────────────────────────

export const signup = (email, password, role = 'student', name = '') => {
  const user = {
    email, password, role,
    name: name || (role === 'teacher' ? 'New Teacher' : role === 'admin' ? 'Admin User' : 'Student User'),
    ...(role === 'student' && { class: '1', section: 'A', studentId: `S-${Date.now()}` }),
    ...(role === 'teacher' && { teacherId: `T-${Date.now()}`, department: 'General', subjects: [], classes: [] }),
    ...(role === 'admin'   && { adminId: `A-${Date.now()}` }),
  };
  const existing = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  existing.push(user);
  localStorage.setItem('registeredUsers', JSON.stringify(existing));
  return user;
};