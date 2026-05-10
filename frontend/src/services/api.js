/**
 * API SERVICE
 * Central fetch wrapper for all backend calls.
 * All admin pages import from here instead of using raw fetch.
 */

import { authHeaders, logout } from './auth';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const handleResponse = async (res) => {
  if (res.status === 401) {
    logout();
    window.location.href = '/';
    return;
  }
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Request failed');
  return data;
};

// ── AUTH ──────────────────────────────────────────────────────────────────
export const apiLogin = (username, password) =>
  fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  }).then(handleResponse);

// ── STUDENTS ──────────────────────────────────────────────────────────────
export const apiGetStudents   = (params = {}) =>
  fetch(`${API_BASE}/students?${new URLSearchParams(params)}`, { headers: authHeaders() }).then(handleResponse);

export const apiGetStudent    = (id) =>
  fetch(`${API_BASE}/students/${id}`, { headers: authHeaders() }).then(handleResponse);

export const apiCreateStudent = (data) =>
  fetch(`${API_BASE}/students`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
  }).then(handleResponse);

export const apiUpdateStudent = (id, data) =>
  fetch(`${API_BASE}/students/${id}`, {
    method: 'PUT', headers: authHeaders(), body: JSON.stringify(data),
  }).then(handleResponse);

export const apiDeleteStudent = (id) =>
  fetch(`${API_BASE}/students/${id}`, {
    method: 'DELETE', headers: authHeaders(),
  }).then(handleResponse);

// ── TEACHERS ──────────────────────────────────────────────────────────────
export const apiGetTeachers   = (params = {}) =>
  fetch(`${API_BASE}/teachers?${new URLSearchParams(params)}`, { headers: authHeaders() }).then(handleResponse);

export const apiGetTeacher    = (id) =>
  fetch(`${API_BASE}/teachers/${id}`, { headers: authHeaders() }).then(handleResponse);

export const apiCreateTeacher = (data) =>
  fetch(`${API_BASE}/teachers`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
  }).then(handleResponse);

export const apiUpdateTeacher = (id, data) =>
  fetch(`${API_BASE}/teachers/${id}`, {
    method: 'PUT', headers: authHeaders(), body: JSON.stringify(data),
  }).then(handleResponse);

export const apiDeleteTeacher = (id) =>
  fetch(`${API_BASE}/teachers/${id}`, {
    method: 'DELETE', headers: authHeaders(),
  }).then(handleResponse);

// ── SECTIONS ──────────────────────────────────────────────────────────────
export const apiGetSections   = (params = {}) =>
  fetch(`${API_BASE}/sections?${new URLSearchParams(params)}`, { headers: authHeaders() }).then(handleResponse);

export const apiCreateSection = (data) =>
  fetch(`${API_BASE}/sections`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
  }).then(handleResponse);

export const apiUpdateSection = (id, data) =>
  fetch(`${API_BASE}/sections/${id}`, {
    method: 'PUT', headers: authHeaders(), body: JSON.stringify(data),
  }).then(handleResponse);

export const apiDeleteSection = (id) =>
  fetch(`${API_BASE}/sections/${id}`, {
    method: 'DELETE', headers: authHeaders(),
  }).then(handleResponse);

// ── FEES ──────────────────────────────────────────────────────────────────
export const apiGetFees           = (params = {}) =>
  fetch(`${API_BASE}/fees?${new URLSearchParams(params)}`, { headers: authHeaders() }).then(handleResponse);

export const apiGetFeeMonths      = () =>
  fetch(`${API_BASE}/fees/months`, { headers: authHeaders() }).then(handleResponse);

export const apiCreateFee         = (data) =>
  fetch(`${API_BASE}/fees`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
  }).then(handleResponse);

export const apiGenerateMonthlyFees = (month, dueDate) =>
  fetch(`${API_BASE}/fees/generate-monthly`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify({ month, dueDate }),
  }).then(handleResponse);

export const apiMarkFeePaid     = (id) =>
  fetch(`${API_BASE}/fees/${id}/mark-paid`, {
    method: 'PATCH', headers: authHeaders(),
  }).then(handleResponse);

export const apiMarkFeeOverdue  = (id) =>
  fetch(`${API_BASE}/fees/${id}/mark-overdue`, {
    method: 'PATCH', headers: authHeaders(),
  }).then(handleResponse);

export const apiDeleteFee       = (id) =>
  fetch(`${API_BASE}/fees/${id}`, {
    method: 'DELETE', headers: authHeaders(),
  }).then(handleResponse);

// ── ANNOUNCEMENTS ─────────────────────────────────────────────────────────
export const apiGetAnnouncements   = (params = {}) =>
  fetch(`${API_BASE}/announcements?${new URLSearchParams(params)}`, { headers: authHeaders() }).then(handleResponse);

export const apiCreateAnnouncement = (data) =>
  fetch(`${API_BASE}/announcements`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
  }).then(handleResponse);

export const apiUpdateAnnouncement = (id, data) =>
  fetch(`${API_BASE}/announcements/${id}`, {
    method: 'PUT', headers: authHeaders(), body: JSON.stringify(data),
  }).then(handleResponse);

export const apiDeleteAnnouncement = (id) =>
  fetch(`${API_BASE}/announcements/${id}`, {
    method: 'DELETE', headers: authHeaders(),
  }).then(handleResponse);

// ── TIMETABLE ─────────────────────────────────────────────────────────────
export const apiGetTimetable        = (classId, section) =>
  fetch(`${API_BASE}/timetable/class/${classId}/section/${section}`, { headers: authHeaders() }).then(handleResponse);

export const apiSaveTimetable       = (classId, section, entries) =>
  fetch(`${API_BASE}/timetable/save`, {
    method: 'POST', headers: authHeaders(),
    body: JSON.stringify({ classId, section, entries }),
  }).then(handleResponse);

export const apiDeleteTimetableEntry = (id) =>
  fetch(`${API_BASE}/timetable/${id}`, {
    method: 'DELETE', headers: authHeaders(),
  }).then(handleResponse);
