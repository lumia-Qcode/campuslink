/**
 * STUDENT API SERVICE
 * Centralised module for all student-facing API calls.
 *
 * Every function:
 *  - reads the JWT from localStorage (set by the auth login flow)
 *  - attaches it as a Bearer token
 *  - throws a descriptive Error on non-2xx responses
 *  - returns the `data` field from { success: true, data: ... }
 *
 * BASE_URL is read from the REACT_APP_API_URL env variable so you can
 * point to different environments without touching source code.
 */

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ── Auth helper ───────────────────────────────────────────────────────────────

/** Returns the stored JWT token or null */
function getToken() {
  try {
    const raw = localStorage.getItem('campuslink_token');
    return raw || null;
  } catch {
    return null;
  }
}

/** Builds the Authorization header object */
function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Core fetch wrapper.
 * @param {string} path   – e.g. '/student/calendar'
 * @param {object} [opts] – additional fetch options
 * @returns {Promise<any>} – the `data` field from the API response
 */
export async function apiFetch(path, opts = {}) {
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

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Serialises a plain object into a query string, omitting nullish values */
function toQueryString(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      qs.set(k, String(v));
    }
  });
  const s = qs.toString();
  return s ? `?${s}` : '';
}

// ── Auth ──────────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/login
 * Stores the JWT in localStorage under 'campuslink_token'.
 */
export async function loginStudent({ email, password }) {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.message || 'Login failed');
  }

  // Store token so subsequent calls can use it
  localStorage.setItem('campuslink_token', json.data.token);
  return json.data;
}

/** Clears the stored token */
export function logoutStudent() {
  localStorage.removeItem('campuslink_token');
}

// ── Student endpoints ─────────────────────────────────────────────────────────

/**
 * GET /api/student/dashboard
 */
export async function fetchDashboard() {
  return apiFetch('/student/dashboard');
}

/**
 * GET /api/student/profile
 */
export async function fetchProfile() {
  return apiFetch('/student/profile');
}

/**
 * GET /api/student/marks?component=MidTerm+-+I
 * @param {{ component?: string }} [filters]
 */
export async function fetchMarks(filters = {}) {
  return apiFetch(`/student/marks${toQueryString(filters)}`);
}

/**
 * GET /api/student/attendance?status=Present&month=March+2026
 * @param {{ status?: string, month?: string }} [filters]
 */
export async function fetchAttendance(filters = {}) {
  return apiFetch(`/student/attendance${toQueryString(filters)}`);
}

/**
 * GET /api/student/timetable?day=Monday
 * @param {{ day?: string }} [filters]
 */
export async function fetchTimetable(filters = {}) {
  return apiFetch(`/student/timetable${toQueryString(filters)}`);
}

/**
 * GET /api/student/calendar?month=April+2026&type=exam
 *
 * Returns:
 *  {
 *    totalEvents: number,
 *    upcomingCount: number,
 *    pastCount: number,
 *    months: string[],          // e.g. ["January 2026", "April 2026", ...]
 *    events: Array<{
 *      id: string,
 *      date: string,            // YYYY-MM-DD
 *      title: string,
 *      type: string,            // 'exam' | 'holiday' | 'event' | ...
 *      description: string|null,
 *      isUpcoming: boolean,
 *      monthLabel: string,
 *    }>,
 *    totalFiltered: number,
 *  }
 *
 * @param {{ month?: string, type?: string }} [filters]
 */
export async function fetchCalendar(filters = {}) {
  return apiFetch(`/student/calendar${toQueryString(filters)}`);
}

/**
 * GET /api/student/discipline
 *
 * Returns:
 *  {
 *    student: { id, name, studentId, class, section },
 *    hasRecords: boolean,
 *    overallSeverity: 'good' | 'warning' | 'serious',
 *    statusMeta: { label, colorClass, iconPath, iconColor },
 *    latestRecord: {
 *      id, date, remarks, severity, issuedBy,
 *      statusMeta: { label, colorClass, iconPath, iconColor }
 *    } | null,
 *    records: Array<{ id, date, remarks, severity, issuedBy, statusMeta }>,
 *    totalRecords: number,
 *  }
 */
export async function fetchDiscipline() {
  return apiFetch('/student/discipline');
}

// ── Announcements ─────────────────────────────────────────────────────────────

/**
 * GET /api/student/announcements?tag=urgent
 * @param {{ tag?: string }} [filters]
 */
export async function fetchAnnouncements(filters = {}) {
  return apiFetch(`/student/announcements${toQueryString(filters)}`);
}

// ── Fees ──────────────────────────────────────────────────────────────────────

/**
 * GET /api/student/fees
 */
export async function fetchFees() {
  return apiFetch('/student/fees');
}

// ── Materials ─────────────────────────────────────────────────────────────────

/**
 * GET /api/student/materials?subject=Mathematics
 * @param {{ subject?: string }} [filters]
 */
export async function fetchMaterials(filters = {}) {
  return apiFetch(`/student/materials${toQueryString(filters)}`);
}

// ── Activities ────────────────────────────────────────────────────────────────

/**
 * GET /api/student/activities
 */
export async function fetchActivities() {
  return apiFetch('/student/activities');
}
