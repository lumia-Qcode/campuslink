/**
 * APPLICATION LAYER — Teacher Use Cases
 */
class TeacherUseCases {
  constructor(teacherRepository, userRepository, sectionRepository) {
    this.teacherRepository  = teacherRepository;
    this.userRepository     = userRepository;
    this.sectionRepository  = sectionRepository;  // NEW injection
  }

  /**
   * GET /api/teachers/me
   * Returns the teacher's profile with assignedSections derived LIVE from the
   * Section collection (where Section.teacherId == teacher._id).
   * This is reliable even if the teacher.assignedSections array is out of sync
   * due to manual DB inserts or failed previous syncs.
   */
  async getTeacherByUserId(userId) {
    const teacher = await this.teacherRepository.findByUserId(userId);
    if (!teacher) throw new Error('Teacher not found');

    // Always derive sections live — never trust the cached array alone
    const liveSections = await this.sectionRepository.findByTeacherId(teacher._id);
    teacher.assignedSections = liveSections;

    return teacher;
  }

  async getAllTeachers(filters = {}) {
    return this.teacherRepository.findAll(filters);
  }

  async getTeacherById(id) {
    const teacher = await this.teacherRepository.findById(id);
    if (!teacher) throw new Error('Teacher not found');
    return teacher;
  }

  async createTeacher(data) {
    const { username, password, ...teacherData } = data;

    const existingUser = await this.userRepository.findByUsername(username);
    if (existingUser) throw new Error('Username already taken');

    const lastNum = await this.teacherRepository.getLastTeacherNumber();
    const teacherId = `T-${String(lastNum + 1).padStart(3, '0')}`;

    const user = await this.userRepository.create({
      username: username.toLowerCase().trim(),
      password,
      role: 'teacher',
      name: teacherData.name,
    });

    const teacher = await this.teacherRepository.create({
      ...teacherData,
      userId:    user._id,
      teacherId,
      username:  username.toLowerCase().trim(),
    });

    return { teacher, credentials: { username: user.username, password: '(as set)' } };
  }

  async updateTeacher(id, data) {
    const teacher = await this.teacherRepository.findById(id);
    if (!teacher) throw new Error('Teacher not found');

    if (data.name && teacher.userId) {
      await this.userRepository.update(teacher.userId, { name: data.name });
    }

    return this.teacherRepository.update(id, data);
  }

  async deleteTeacher(id) {
    const teacher = await this.teacherRepository.findById(id);
    if (!teacher) throw new Error('Teacher not found');

    if (teacher.userId) {
      await this.userRepository.delete(teacher.userId);
    }

    return this.teacherRepository.delete(id);
  }

  async getTeacherCount() {
    return this.teacherRepository.count();
  }
}

module.exports = TeacherUseCases;
