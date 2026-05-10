/**
 * DOMAIN LAYER — Teacher Entity
 */
class Teacher {
  constructor({
    id, userId, teacherId,
    name, username, email, cnic, dob, gender, phone, address,
    qualification, department, joinDate,
    assignedSections, createdAt
  }) {
    this.id               = id;
    this.userId           = userId;
    this.teacherId        = teacherId;  // e.g. T-001
    this.name             = name;
    this.username         = username;
    this.email            = email;
    this.cnic             = cnic;
    this.dob              = dob;
    this.gender           = gender;
    this.phone            = phone;
    this.address          = address;
    this.qualification    = qualification;
    this.department       = department;
    this.joinDate         = joinDate || new Date();
    this.assignedSections = assignedSections || [];
    this.createdAt        = createdAt || new Date();
  }
}

module.exports = Teacher;
