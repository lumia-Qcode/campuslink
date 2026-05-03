/**
 * DOMAIN ENTITY: Announcement
 *
 * Pure business object — no framework dependencies.
 * Encapsulates validation rules for an announcement.
 */

const VALID_TAGS   = ['urgent', 'event', 'info', 'notice'];
const VALID_ROLES  = ['student', 'teacher', 'admin'];

class Announcement {
  /**
   * @param {{
   *   id:          string,
   *   title:       string,
   *   description: string,
   *   tag:         string,
   *   targetRoles: string[],
   *   createdBy:   string | null,
   *   createdAt:   Date,
   * }} props
   */
  constructor({ id, title, description, tag, targetRoles, createdBy, createdAt }) {
    this._validate({ title, description, tag, targetRoles });

    this.id          = id;
    this.title       = title.trim();
    this.description = description.trim();
    this.tag         = tag;
    this.targetRoles = targetRoles;
    this.createdBy   = createdBy || null;
    this.createdAt   = createdAt || new Date();
  }

  // ── Domain validation ────────────────────────────────────────────────────

  _validate({ title, description, tag, targetRoles }) {
    if (!title || title.trim().length === 0) {
      throw new Error('Announcement title is required');
    }
    if (title.trim().length > 200) {
      throw new Error('Announcement title must not exceed 200 characters');
    }
    if (!description || description.trim().length === 0) {
      throw new Error('Announcement description is required');
    }
    if (description.trim().length > 2000) {
      throw new Error('Announcement description must not exceed 2000 characters');
    }
    if (!VALID_TAGS.includes(tag)) {
      throw new Error(`Invalid tag. Must be one of: ${VALID_TAGS.join(', ')}`);
    }
    if (!Array.isArray(targetRoles) || targetRoles.length === 0) {
      throw new Error('targetRoles must be a non-empty array');
    }
    const invalidRoles = targetRoles.filter(r => !VALID_ROLES.includes(r));
    if (invalidRoles.length > 0) {
      throw new Error(`Invalid roles: ${invalidRoles.join(', ')}`);
    }
  }

  // ── Domain helpers ───────────────────────────────────────────────────────

  /** Returns true if this announcement targets the given role */
  isVisibleTo(role) {
    return this.targetRoles.includes(role);
  }

  /** Formats the date as a readable string e.g. "Mar 15, 2026" */
  get formattedDate() {
    return this.createdAt.toLocaleDateString('en-US', {
      year:  'numeric',
      month: 'short',
      day:   'numeric',
    });
  }

  /** Plain object representation (safe to serialise) */
  toJSON() {
    return {
      id:          this.id,
      title:       this.title,
      description: this.description,
      tag:         this.tag,
      targetRoles: this.targetRoles,
      createdBy:   this.createdBy,
      date:        this.formattedDate,
      createdAt:   this.createdAt,
    };
  }
}

module.exports = Announcement;
