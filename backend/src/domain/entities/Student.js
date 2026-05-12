/**
 * DOMAIN LAYER — Student Entity
 */
class Student {
  constructor({
    id, userId, studentId,
    name, username, email, cnic, dob, gender, phone, address,
    fatherName, fatherCnic, fatherPhone, fatherOccupation,
    motherName, motherPhone,
    classId, section, rollNo,
    admissionDate, feeStatus, createdAt
  }) {
    this.id            = id;
    this.userId        = userId;        // linked User account
    this.studentId     = studentId;     // e.g. STU-001
    this.name          = name;
    this.username      = username;
    this.email         = email;
    this.cnic          = cnic;
    this.dob           = dob;
    this.gender        = gender;
    this.phone         = phone;
    this.address       = address;
    this.fatherName    = fatherName;
    this.fatherCnic    = fatherCnic;
    this.fatherPhone   = fatherPhone;
    this.fatherOccupation = fatherOccupation;
    this.motherName    = motherName;
    this.motherPhone   = motherPhone;
    this.classId       = classId;
    this.section       = section;
    this.rollNo        = rollNo;
    this.admissionDate = admissionDate || new Date();
    this.feeStatus     = feeStatus || 'Pending';
    this.createdAt     = createdAt || new Date();
  }
}

module.exports = Student;
