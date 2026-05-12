/**
 * DOMAIN LAYER — Announcement Entity
 * Posted by admin, visible to all roles (students, teachers, and admin).
 * Future portals simply query by targetRoles.
 */
class Announcement {
  constructor({ id, title, content, postedBy, targetRoles, createdAt, updatedAt }) {
    this.id          = id;
    this.title       = title;
    this.content     = content;
    this.postedBy    = postedBy;   // admin user id
    this.targetRoles = targetRoles || ['student', 'teacher', 'admin']; // broadcast to all
    this.createdAt   = createdAt || new Date();
    this.updatedAt   = updatedAt || new Date();
  }
}

module.exports = Announcement;
