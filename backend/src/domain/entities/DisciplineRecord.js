/**
 * DOMAIN ENTITY: DisciplineRecord
 * Represents a single discipline entry for a student.
 * Encapsulates business rules for deriving conduct status from remarks.
 */
class DisciplineRecord {
  static VALID_SEVERITIES = ['good', 'warning', 'serious'];

  constructor({ id, studentId, date, remarks, severity, issuedBy, createdAt }) {
    this.id        = id;
    this.studentId = studentId;
    this.date      = date instanceof Date ? date : new Date(date);
    this.remarks   = remarks;
    this.severity  = severity || 'good';
    this.issuedBy  = issuedBy || null;
    this.createdAt = createdAt || new Date();
  }

  /** Returns date as ISO string YYYY-MM-DD */
  getFormattedDate() {
    return this.date.toISOString().split('T')[0];
  }

  /**
   * Derives a UI-friendly status label and CSS class from severity.
   * Returns { label, colorClass, iconPath, iconColor }
   */
  getStatusMeta() {
    switch (this.severity) {
      case 'warning':
        return {
          label:     'Warning Issued',
          colorClass: 'warning',
          iconPath:  'M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z',
          iconColor: '#e6a800',
        };
      case 'serious':
        return {
          label:     'Action Required',
          colorClass: 'danger',
          iconPath:  'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
          iconColor: '#ff5c5c',
        };
      default: // 'good'
        return {
          label:     'Good Standing',
          colorClass: 'good',
          iconPath:  'M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
          iconColor: '#2db87b',
        };
    }
  }
}

module.exports = DisciplineRecord;
