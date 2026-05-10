/**
 * DOMAIN LAYER — Fee Entity
 * Fee formula: classId numeric > 5 => PKR 50,000, else PKR 40,000.
 * Early childhood classes (playgroup/nursery/prenursery) => 40,000.
 */

const HIGH_GRADE_CLASSES = ['6', '7', '8', '9', 'X'];

class Fee {
  constructor({
    id, studentId, studentName, classId, section,
    month, amount, dueDate, status, paidDate, createdAt
  }) {
    this.id          = id;
    this.studentId   = studentId;
    this.studentName = studentName;
    this.classId     = classId;
    this.section     = section;
    this.month       = month;
    this.amount      = amount;
    this.dueDate     = dueDate;
    this.status      = status || 'Pending'; // 'Paid' | 'Pending' | 'Overdue'
    this.paidDate    = paidDate || null;
    this.createdAt   = createdAt || new Date();
  }

  static calculateAmount(classId) {
    return HIGH_GRADE_CLASSES.includes(classId) ? 50000 : 40000;
  }
}

module.exports = Fee;
