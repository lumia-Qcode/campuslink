/**
 * sharedMaterials.js
 * Shared in-memory + localStorage bridge so teacher-uploaded materials
 * are visible to students in real time within the same session.
 *
 * Place this file at:  src/services/sharedMaterials.js
 */

const STORAGE_KEY = "eduportal_shared_materials";

/**
 * Save the full materials list (called by TeacherMaterials after every change).
 */
export function saveTeacherMaterials(materials) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(materials));
  } catch (_) {
    // localStorage unavailable — silently ignore
  }
}

/**
 * Load materials for student view.
 * Falls back to the static teacherMaterials mock if nothing has been saved yet.
 */
export function loadTeacherMaterials(fallback = []) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_) {}
  return fallback;
}