/**
 * APPLICATION LAYER — Student Use Cases
 */
class StudentUseCases {
  constructor(studentRepository, userRepository) {
    this.studentRepository = studentRepository;
    this.userRepository    = userRepository;
  }

  async getAllStudents(filters = {}) {
    return this.studentRepository.findAll(filters);
  }

  async getStudentById(id) {
    const student = await this.studentRepository.findById(id);
    if (!student) throw new Error('Student not found');
    return student;
  }

  /**
   * Admin creates a student: also creates a User account with username/password.
   */
  async createStudent(data) {
    const { username, password, ...studentData } = data;

    // Check username unique
    const existingUser = await this.userRepository.findByUsername(username);
    if (existingUser) throw new Error('Username already taken');

    // Auto-generate studentId
    const lastNum = await this.studentRepository.getLastStudentNumber();
    const studentId = `STU-${String(lastNum + 1).padStart(3, '0')}`;

    // Create user account
    const user = await this.userRepository.create({
      username: username.toLowerCase().trim(),
      password,
      role: 'student',
      name: studentData.name,
    });

    // Create student profile
    const student = await this.studentRepository.create({
      ...studentData,
      userId:    user._id,
      studentId,
      username:  username.toLowerCase().trim(),
    });

    return { student, credentials: { username: user.username, password: '(as set)' } };
  }

  async updateStudent(id, data) {
    const student = await this.studentRepository.findById(id);
    if (!student) throw new Error('Student not found');

    // If name changed, sync user account name too
    if (data.name && student.userId) {
      await this.userRepository.update(student.userId, { name: data.name });
    }

    return this.studentRepository.update(id, data);
  }

  async deleteStudent(id) {
    const student = await this.studentRepository.findById(id);
    if (!student) throw new Error('Student not found');

    // Delete associated user account
    if (student.userId) {
      await this.userRepository.delete(student.userId);
    }

    return this.studentRepository.delete(id);
  }

  async getStudentCount() {
    return this.studentRepository.count();
  }
}

module.exports = StudentUseCases;
