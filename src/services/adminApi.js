/**
 * ADMIN API SERVICE
 * All admin portal API calls. Reads JWT from localStorage.
 */

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function getToken() {
  try { return localStorage.getItem('campuslink_token') || null; } catch { return null; }
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch(path, opts = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(opts.headers || {}),
    },
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    const err = new Error(json.message || `API error ${res.status}`);
    err.statusCode = res.status;
    err.data = json;
    throw err;
  }
  return json.data;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const getDashboard = () => apiFetch('/admin/dashboard');

// ── Students ──────────────────────────────────────────────────────────────────
export const listStudents  = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return apiFetch(`/admin/students${q ? `?${q}` : ''}`);
};
export const getStudent    = (id) => apiFetch(`/admin/students/${id}`);
export const createStudent = (data) => apiFetch('/admin/students', { method: 'POST', body: JSON.stringify(data) });
export const updateStudent = (id, data) => apiFetch(`/admin/students/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteStudent = (id) => apiFetch(`/admin/students/${id}`, { method: 'DELETE' });

// ── Teachers ──────────────────────────────────────────────────────────────────
export const listTeachers   = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return apiFetch(`/admin/teachers${q ? `?${q}` : ''}`);
};
export const getTeacher     = (id) => apiFetch(`/admin/teachers/${id}`);
export const createTeacher  = (data) => apiFetch('/admin/teachers', { method: 'POST', body: JSON.stringify(data) });
export const updateTeacher  = (id, data) => apiFetch(`/admin/teachers/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteTeacher  = (id) => apiFetch(`/admin/teachers/${id}`, { method: 'DELETE' });
export const assignSection  = (teacherId, sectionId) =>
  apiFetch(`/admin/teachers/${teacherId}/assign-section`, { method: 'POST', body: JSON.stringify({ sectionId }) });
export const unassignSection = (teacherId, sectionId) =>
  apiFetch(`/admin/teachers/${teacherId}/unassign-section`, { method: 'POST', body: JSON.stringify({ sectionId }) });

// ── Sections ──────────────────────────────────────────────────────────────────
export const listSections   = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return apiFetch(`/admin/sections${q ? `?${q}` : ''}`);
};
export const createSection  = (data) => apiFetch('/admin/sections', { method: 'POST', body: JSON.stringify(data) });
export const updateSection  = (id, data) => apiFetch(`/admin/sections/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteSection  = (id) => apiFetch(`/admin/sections/${id}`, { method: 'DELETE' });

// ── Timetable ─────────────────────────────────────────────────────────────────
export const getTimetable          = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return apiFetch(`/admin/timetable${q ? `?${q}` : ''}`);
};
export const saveTimetableEntry    = (data) => apiFetch('/admin/timetable', { method: 'POST', body: JSON.stringify(data) });
export const saveBulkTimetable     = (data) => apiFetch('/admin/timetable/bulk', { method: 'POST', body: JSON.stringify(data) });
export const deleteTimetableEntry  = (id) => apiFetch(`/admin/timetable/${id}`, { method: 'DELETE' });

// ── Fees ──────────────────────────────────────────────────────────────────────
export const listFees          = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return apiFetch(`/admin/fees${q ? `?${q}` : ''}`);
};
export const markFeePaid       = (id) => apiFetch(`/admin/fees/${id}/mark-paid`, { method: 'PATCH' });
export const generateFees      = (month) => apiFetch('/admin/fees/generate', { method: 'POST', body: JSON.stringify({ month }) });

// ── Announcements ─────────────────────────────────────────────────────────────
export const listAnnouncements   = () => apiFetch('/admin/announcements');
export const createAnnouncement  = (data) => apiFetch('/admin/announcements', { method: 'POST', body: JSON.stringify(data) });
export const updateAnnouncement  = (id, data) => apiFetch(`/admin/announcements/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteAnnouncement  = (id) => apiFetch(`/admin/announcements/${id}`, { method: 'DELETE' });

// ── Financial Aid ─────────────────────────────────────────────────────────────
export const listFinancialAid   = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return apiFetch(`/admin/financial-aid${q ? `?${q}` : ''}`);
};
export const createFinancialAid = (data) => apiFetch('/admin/financial-aid', { method: 'POST', body: JSON.stringify(data) });
export const reviewFinancialAid = (id, data) => apiFetch(`/admin/financial-aid/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteFinancialAid = (id) => apiFetch(`/admin/financial-aid/${id}`, { method: 'DELETE' });