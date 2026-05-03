/**
 * USE CASE: UploadTeacherMaterial
 * Creates a new material record.
 * The teacher can target a specific class/section or all classes.
 */
class UploadTeacherMaterial {
  constructor(teacherRepository, materialRepository) {
    this.teacherRepo  = teacherRepository;
    this.materialRepo = materialRepository;
  }

  /**
   * @param {string}  userId
   * @param {object}  payload
   * @param {string}  payload.title
   * @param {string}  payload.subject
   * @param {string}  [payload.type]          – 'PDF'|'DOC'|'PPT'|'VIDEO'|'LINK'|'OTHER'
   * @param {string}  [payload.fileUrl]
   * @param {string}  [payload.downloadUrl]
   * @param {string}  [payload.size]
   * @param {number}  [payload.targetClass]   – null = all classes
   * @param {string}  [payload.targetSection] – null = all sections
   */
  async execute(userId, payload) {
    const teacher = await this.teacherRepo.findByUserId(userId);
    if (!teacher) {
      const err = new Error('Teacher profile not found');
      err.statusCode = 404;
      throw err;
    }

    const VALID_TYPES = ['PDF', 'DOC', 'PPT', 'VIDEO', 'LINK', 'OTHER'];
    const type = VALID_TYPES.includes(payload.type) ? payload.type : 'OTHER';

    const material = await this.materialRepo.create({
      title:            String(payload.title).slice(0, 300),
      subject:          String(payload.subject).slice(0, 100),
      type,
      fileUrl:          payload.fileUrl    ? String(payload.fileUrl).slice(0, 1000)    : null,
      downloadUrl:      payload.downloadUrl ? String(payload.downloadUrl).slice(0, 1000) : null,
      size:             payload.size        ? String(payload.size).slice(0, 20)         : null,
      targetClass:      payload.targetClass    != null ? Number(payload.targetClass)    : null,
      targetSection:    payload.targetSection  != null ? String(payload.targetSection).slice(0, 5) : null,
      uploadedBy:       teacher.name,
      uploadedByUserId: userId,
      isPublished:      true,
    });

    return material;
  }
}

module.exports = UploadTeacherMaterial;
