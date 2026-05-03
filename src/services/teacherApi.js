/**
 * TEACHER API SERVICE (FINAL CLEAN VERSION)
 * Centralised API layer for teacher portal
 */

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ─────────────────────────────────────────────────────────────
// AUTH HELPERS
// ─────────────────────────────────────────────────────────────

function getToken() {
  return localStorage.getItem('campuslink_token') || null;
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─────────────────────────────────────────────────────────────
// CORE FETCH WRAPPER
// ─────────────────────────────────────────────────────────────

export async function teacherFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || `API Error: ${res.status}`);
  }

  return data.data;
}

// ─────────────────────────────────────────────────────────────
// AUTH (Teacher Login)
// ─────────────────────────────────────────────────────────────

export async function loginTeacher(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Login failed');
  }

  localStorage.setItem('campuslink_token', data.data.token);
  localStorage.setItem('user', JSON.stringify(data.data.user));

  return data.data;
}

export function logoutTeacher() {
  localStorage.removeItem('campuslink_token');
  localStorage.removeItem('user');
}

// ─────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────

export function fetchTeacherDashboard() {
  return teacherFetch('/teacher/dashboard');
}

// ─────────────────────────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────────────────────────

export function fetchTeacherProfile() {
  return teacherFetch('/teacher/profile');
}

// ─────────────────────────────────────────────────────────────
// STUDENTS
// ─────────────────────────────────────────────────────────────

export function fetchTeacherStudents(classLabel) {
  const qs = classLabel ? `?class=${encodeURIComponent(classLabel)}` : '';
  return teacherFetch(`/teacher/students${qs}`);
}

// ─────────────────────────────────────────────────────────────
// ATTENDANCE
// ─────────────────────────────────────────────────────────────

export function fetchTeacherAttendance(classLabel, date) {
  const params = new URLSearchParams({ class: classLabel });
  if (date) params.append('date', date);
  return teacherFetch(`/teacher/attendance?${params}`);
}

export function saveTeacherAttendance(classLabel, date, records) {
  return teacherFetch('/teacher/attendance', {
    method: 'POST',
    body: JSON.stringify({ class: classLabel, date, records }),
  });
}

// ─────────────────────────────────────────────────────────────
// MARKS
// ─────────────────────────────────────────────────────────────

export function fetchTeacherMarks(classLabel, subject, component) {
  const params = new URLSearchParams({ class: classLabel, subject, component });
  return teacherFetch(`/teacher/marks?${params}`);
}

export function saveTeacherMarks(classLabel, subject, component, entries) {
  return teacherFetch('/teacher/marks', {
    method: 'POST',
    body: JSON.stringify({ class: classLabel, subject, component, entries }),
  });
}

// ─────────────────────────────────────────────────────────────
// MATERIALS
// ─────────────────────────────────────────────────────────────

export function fetchTeacherMaterials() {
  return teacherFetch('/teacher/materials');
}

export function uploadTeacherMaterial(payload) {
  return teacherFetch('/teacher/materials', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function deleteTeacherMaterial(id) {
  return teacherFetch(`/teacher/materials/${id}`, {
    method: 'DELETE',
  });
}

// ─────────────────────────────────────────────────────────────
// TIMETABLE
// ─────────────────────────────────────────────────────────────

export function fetchTeacherTimetable(day) {
  const qs = day ? `?day=${encodeURIComponent(day)}` : '';
  return teacherFetch(`/teacher/timetable${qs}`);
}

// ─────────────────────────────────────────────────────────────
// ANNOUNCEMENTS (FIXED EXPORT ISSUE)
// ─────────────────────────────────────────────────────────────

export function fetchTeacherAnnouncements(tag) {
  const qs = tag ? `?tag=${encodeURIComponent(tag)}` : '';
  return teacherFetch(`/teacher/announcements${qs}`);
}

// ─────────────────────────────────────────────────────────────
// CALENDAR
// ─────────────────────────────────────────────────────────────

export function fetchTeacherCalendar(month, type) {
  const params = new URLSearchParams();
  if (month) params.append('month', month);
  if (type) params.append('type', type);

  const qs = params.toString();
  return teacherFetch(`/teacher/calendar${qs ? `?${qs}` : ''}`);
}