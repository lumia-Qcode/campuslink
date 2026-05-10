/**
 * APPLICATION LAYER — Teacher Use Cases
 */
class TeacherUseCases {
  constructor(teacherRepository, userRepository) {
    this.teacherRepository = teacherRepository;
    this.userRepository    = userRepository;
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
