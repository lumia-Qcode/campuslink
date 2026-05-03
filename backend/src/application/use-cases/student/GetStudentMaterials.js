/**
 * USE CASE: GetStudentMaterials
 * Returns learning materials visible to the authenticated student.
 * Supports optional subject filter.
 */
class GetStudentMaterials {
  constructor(studentRepository, materialRepository) {
    this.studentRepository  = studentRepository;
    this.materialRepository = materialRepository;
  }

  /**
   * @param {string} userId  – JWT sub (User ObjectId)
   * @param {{ subject?: string }} [filters]
   */
  async execute(userId, filters = {}) {
    // 1. Resolve student profile
    const student = await this.studentRepository.findByUserId(userId);
    if (!student) {
      const err = new Error('Student profile not found');
      err.statusCode = 404;
      throw err;
    }

    // 2. Fetch all materials visible to this student's class/section
    const materials = await this.materialRepository.findForStudent({
      classLevel: student.classLevel,
      section:    student.section,
    });

    // 3. Optional subject filter (case-insensitive)
    const { subject } = filters;
    const filtered = subject && subject !== 'All'
      ? materials.filter(m => m.subject.toLowerCase() === subject.toLowerCase())
      : materials;

    // 4. Build unique subject list for filter chips
    const subjectSet = new Set(filtered.map(m => m.subject));
    const subjects   = ['All', ...subjectSet];

    return {
      total:    filtered.length,
      subjects,
      materials: filtered,
    };
  }
}

module.exports = GetStudentMaterials;
