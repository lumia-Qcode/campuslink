/**
 * TEACHER API SERVICE
 * Centralised module for all teacher-facing API calls.
 *
 * Every function:
 *  - reads the JWT from localStorage (set by the login flow)
 *  - attaches it as a Bearer token
 *  - throws a descriptive Error on non-2xx responses
 *  - returns the `data` field from { success: true, data: ... }
 *
 * BASE_URL is read from REACT_APP_API_URL env variable.
 */

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ── Auth helper ───────────────────────────────────────────────────────────────

function getToken() {
  try {
    return localStorage.getItem('campuslink_token') || null;
  } catch {
    return null;
  }
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Core fetch wrapper.
 * @param {string} path   – e.g. '/teacher/dashboard'
 * @param {object} [opts] – additional fetch options (method, body, etc.)
 * @returns {Promise<any>} – the `data` field from the API response
 */
export async function teacherFetch(path, opts = {}) {
  const url = `${BASE_URL}${path}`;

  const response = await fetch(url, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(opts.headers || {}),
    },
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    const message = json.message || `API error: ${response.status}`;
    const err = new Error(message);
    err.statusCode = response.status;
    err.data = json;
    throw err;
  }

  return json.data;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

/**
 * GET /api/teacher/dashboard
 * Returns teacher info, class stats, and recent announcements.
 */
export async function getTeacherDashboard() {
  return teacherFetch('/teacher/dashboard');
}

// ── Profile ───────────────────────────────────────────────────────────────────

/**
 * GET /api/teacher/profile
 */
export async function getTeacherProfile() {
  return teacherFetch('/teacher/profile');
}

// ── Students ──────────────────────────────────────────────────────────────────

/**
 * GET /api/teacher/students?class=10-A
 * Returns student list for the given class.
 * @param {string} classLabel – e.g. "10-A"
 */
export async function getTeacherStudents(classLabel) {
  const params = new URLSearchParams({ class: classLabel });
  return teacherFetch(`/teacher/students?${params}`);
}

// ── Attendance ────────────────────────────────────────────────────────────────

/**
 * GET /api/teacher/attendance?class=10-A&date=2026-05-01
 * Returns attendance rows for a class on a given date.
 * @param {string} classLabel
 * @param {string} [dateStr] – YYYY-MM-DD (defaults to today on server)
 */
export async function getTeacherAttendance(classLabel, dateStr) {
  const params = new URLSearchParams({ class: classLabel });
  if (dateStr) params.append('date', dateStr);
  return teacherFetch(`/teacher/attendance?${params}`);
}

/**
 * POST /api/teacher/attendance
 * Saves/overwrites attendance for a class on a date.
 * @param {string} classLabel
 * @param {string} dateStr  – YYYY-MM-DD
 * @param {Array}  records  – [{ studentId, status, note? }]
 */
export async function saveTeacherAttendance(classLabel, dateStr, records) {
  return teacherFetch('/teacher/attendance', {
    method: 'POST',
    body: JSON.stringify({ class: classLabel, date: dateStr, records }),
  });
}

// ── Marks ─────────────────────────────────────────────────────────────────────

/**
 * GET /api/teacher/marks?class=10-A&subject=Mathematics&component=MidTerm - I
 * Returns a class mark-sheet for a subject + component.
 * @param {string} classLabel
 * @param {string} subject
 * @param {string} component  – 'MidTerm - I' | 'MidTerm - II' | 'Final' | 'Quiz' | 'Assignment'
 */
export async function getTeacherMarks(classLabel, subject, component) {
  const params = new URLSearchParams({ class: classLabel, subject, component });
  return teacherFetch(`/teacher/marks?${params}`);
}

/**
 * POST /api/teacher/marks
 * Saves/overwrites marks for a class / subject / component.
 * @param {string} classLabel
 * @param {string} subject
 * @param {string} component
 * @param {Array}  entries  – [{ studentId, marks, total?, examDate? }]
 */
export async function saveTeacherMarks(classLabel, subject, component, entries) {
  return teacherFetch('/teacher/marks', {
    method: 'POST',
    body: JSON.stringify({ class: classLabel, subject, component, entries }),
  });
}

// ── Materials ─────────────────────────────────────────────────────────────────

/**
 * GET /api/teacher/materials
 * Returns all materials uploaded by the logged-in teacher.
 */
export async function getTeacherMaterials() {
  return teacherFetch('/teacher/materials');
}

/**
 * POST /api/teacher/materials
 * Uploads a new material record.
 * @param {object} payload  – { title, subject, type, fileUrl, downloadUrl, size, targetClass?, targetSection? }
 */
export async function uploadTeacherMaterial(payload) {
  return teacherFetch('/teacher/materials', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * DELETE /api/teacher/materials/:id
 * Deletes a material (only works if the teacher owns it).
 * @param {string} materialId
 */
export async function deleteTeacherMaterial(materialId) {
  return teacherFetch(`/teacher/materials/${materialId}`, { method: 'DELETE' });
}

// ── Timetable ─────────────────────────────────────────────────────────────────

/**
 * GET /api/teacher/timetable?day=Monday
 * Returns the teacher's timetable, optionally filtered by day.
 * @param {string} [day] – 'Monday' | 'Tuesday' | …
 */
export async function getTeacherTimetable(day) {
  const params = day ? `?day=${encodeURIComponent(day)}` : '';
  return teacherFetch(`/teacher/timetable${params}`);
}

// ── Announcements ─────────────────────────────────────────────────────────────

/**
 * GET /api/teacher/announcements?tag=urgent
 * Returns announcements, optionally filtered by tag.
 * @param {string} [tag] – 'urgent' | 'event' | 'info' | 'notice'
 */
export async function getTeacherAnnouncements(tag) {
  const params = tag ? `?tag=${encodeURIComponent(tag)}` : '';
  return teacherFetch(`/teacher/announcements${params}`);
}

// ── Calendar ──────────────────────────────────────────────────────────────────

/**
 * GET /api/teacher/calendar?month=May 2026&type=exam
 * Returns calendar events.
 * @param {string} [month] – e.g. "May 2026"
 * @param {string} [type]  – 'exam' | 'holiday' | 'event' | 'meeting' | 'activity' | 'other'
 */
export async function getTeacherCalendar(month, type) {
  const params = new URLSearchParams();
  if (month) params.append('month', month);
  if (type)  params.append('type', type);
  const qs = params.toString();
  return teacherFetch(`/teacher/calendar${qs ? `?${qs}` : ''}`);
}
