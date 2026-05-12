/**
 * API SERVICE
 * Central fetch wrapper for all backend calls.
 * Includes student-portal endpoints added at the bottom.
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

// ── AUTH ──────────────────────────────────────────────────────────────────────
export const apiLogin = (username, password) =>
  fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  }).then(handleResponse);

// ── STUDENTS (admin/teacher) ──────────────────────────────────────────────────
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

// ── TEACHERS ──────────────────────────────────────────────────────────────────
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

// ── SECTIONS ──────────────────────────────────────────────────────────────────
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

// ── FEES (admin) ──────────────────────────────────────────────────────────────
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

export const apiUpdateFee = (id, data) =>
  fetch(`${API_BASE}/fees/${id}`, {
    method: 'PUT', headers: authHeaders(), body: JSON.stringify(data),
  }).then(handleResponse);

// ── ANNOUNCEMENTS ─────────────────────────────────────────────────────────────
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

// ── TIMETABLE ─────────────────────────────────────────────────────────────────
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

// ── TEACHER PROFILE ───────────────────────────────────────────────────────────
export const apiGetMyTeacherProfile = () =>
  fetch(`${API_BASE}/teachers/me`, { headers: authHeaders() }).then(handleResponse);

// ── ATTENDANCE (teacher) ──────────────────────────────────────────────────────
export const apiSaveAttendance = (data) =>
  fetch(`${API_BASE}/attendance`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
  }).then(handleResponse);

export const apiGetAttendanceForDate = (classId, section, date) =>
  fetch(`${API_BASE}/attendance?classId=${classId}&section=${section}&date=${date}`, { headers: authHeaders() }).then(handleResponse);

export const apiGetAttendanceDates = (classId, section) =>
  fetch(`${API_BASE}/attendance/dates?classId=${classId}&section=${section}`, { headers: authHeaders() }).then(handleResponse);

export const apiGetAttendanceReport = (classId, section, from, to) =>
  fetch(`${API_BASE}/attendance/report?classId=${classId}&section=${section}&from=${from}&to=${to}`, { headers: authHeaders() }).then(handleResponse);

export const apiGetStudentAttendance = (studentId) =>
  fetch(`${API_BASE}/attendance/student/${studentId}`, { headers: authHeaders() }).then(handleResponse);

// ── MARKS (teacher) ───────────────────────────────────────────────────────────
export const apiSaveMarks = (data) =>
  fetch(`${API_BASE}/marks`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
  }).then(handleResponse);

export const apiGetMarks = (classId, section, subject, component) =>
  fetch(`${API_BASE}/marks?classId=${classId}&section=${section}&subject=${encodeURIComponent(subject)}&component=${encodeURIComponent(component)}`, { headers: authHeaders() }).then(handleResponse);

export const apiGetMarksForClass = (classId, section) =>
  fetch(`${API_BASE}/marks/class?classId=${classId}&section=${section}`, { headers: authHeaders() }).then(handleResponse);

export const apiGetStudentMarks = (studentId) =>
  fetch(`${API_BASE}/marks/student/${studentId}`, { headers: authHeaders() }).then(handleResponse);

// ── MATERIALS (teacher/admin) ─────────────────────────────────────────────────
export const apiGetMaterials = (params = {}) =>
  fetch(`${API_BASE}/materials?${new URLSearchParams(params)}`, { headers: authHeaders() }).then(handleResponse);

export const apiGetMaterialsBySection = (classId, section) =>
  fetch(`${API_BASE}/materials/section?classId=${classId}&section=${section}`, { headers: authHeaders() }).then(handleResponse);

export const apiUploadMaterial = (data) =>
  fetch(`${API_BASE}/materials`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
  }).then(handleResponse);

export const apiDeleteMaterial = (id) =>
  fetch(`${API_BASE}/materials/${id}`, {
    method: 'DELETE', headers: authHeaders(),
  }).then(handleResponse);

// ── CALENDAR EVENTS (teacher/admin) ──────────────────────────────────────────
export const apiGetCalendarEvents = () =>
  fetch(`${API_BASE}/calendar-events`, { headers: authHeaders() }).then(handleResponse);

export const apiCreateCalendarEvent = (data) =>
  fetch(`${API_BASE}/calendar-events`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
  }).then(handleResponse);

export const apiDeleteCalendarEvent = (id) =>
  fetch(`${API_BASE}/calendar-events/${id}`, {
    method: 'DELETE', headers: authHeaders(),
  }).then(handleResponse);

export const apiGetTeacherTimetable = (teacherId) =>
  fetch(`${API_BASE}/timetable/teacher/${teacherId}`, { headers: authHeaders() }).then(handleResponse);

// ═════════════════════════════════════════════════════════════════════════════
// STUDENT PORTAL ENDPOINTS  (all hit /api/student-portal/*)
// These use the logged-in student's JWT — no explicit studentId needed.
// ═════════════════════════════════════════════════════════════════════════════

/** Own profile */
export const apiStudentGetMe = () =>
  fetch(`${API_BASE}/student-portal/me`, { headers: authHeaders() }).then(handleResponse);

/** All attendance records for the logged-in student */
export const apiStudentGetAttendance = () =>
  fetch(`${API_BASE}/student-portal/attendance`, { headers: authHeaders() }).then(handleResponse);

/** All marks for the logged-in student */
export const apiStudentGetMarks = () =>
  fetch(`${API_BASE}/student-portal/marks`, { headers: authHeaders() }).then(handleResponse);

/** All fee challans for the logged-in student */
export const apiStudentGetFees = () =>
  fetch(`${API_BASE}/student-portal/fees`, { headers: authHeaders() }).then(handleResponse);

/** Timetable for the student's class/section */
export const apiStudentGetTimetable = () =>
  fetch(`${API_BASE}/student-portal/timetable`, { headers: authHeaders() }).then(handleResponse);

/** Materials uploaded by teachers for the student's section */
export const apiStudentGetMaterials = () =>
  fetch(`${API_BASE}/student-portal/materials`, { headers: authHeaders() }).then(handleResponse);

/** Announcements visible to the student */
export const apiStudentGetAnnouncements = () =>
  fetch(`${API_BASE}/student-portal/announcements`, { headers: authHeaders() }).then(handleResponse);

/** Calendar events (teacher/admin + own personal) */
export const apiStudentGetCalendar = () =>
  fetch(`${API_BASE}/student-portal/calendar`, { headers: authHeaders() }).then(handleResponse);

/** Add a personal calendar event */
export const apiStudentAddCalendarEvent = (data) =>
  fetch(`${API_BASE}/student-portal/calendar`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
  }).then(handleResponse);

/** Delete a personal calendar event (only own events) */
export const apiStudentDeleteCalendarEvent = (id) =>
  fetch(`${API_BASE}/student-portal/calendar/${id}`, {
    method: 'DELETE', headers: authHeaders(),
  }).then(handleResponse);
