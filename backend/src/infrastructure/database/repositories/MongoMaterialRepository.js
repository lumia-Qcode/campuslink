const IMaterialRepository = require('../../../application/ports/IMaterialRepository');
const MaterialModel = require('../models/MaterialModel');

class MongoMaterialRepository extends IMaterialRepository {
  /**
   * Return all published materials visible to the given class/section.
   * Visibility rules (OR):
   *   - targetClass is null (all classes)
   *   - targetClass matches AND (targetSection is null OR targetSection matches)
   */
  async findForStudent({ classLevel, section }) {
    const query = {
      isPublished: true,
      $or: [
        { targetClass: null },
        {
          targetClass: classLevel,
          $or: [
            { targetSection: null },
            { targetSection: section },
          ],
        },
      ],
    };

    const docs = await MaterialModel.find(query).sort({ createdAt: -1 }).lean();
    return docs.map(this._toPlain);
  }

  async findById(id) {
    const doc = await MaterialModel.findById(id).lean();
    return doc ? this._toPlain(doc) : null;
  }

  _toPlain(doc) {
    return {
      id:            doc._id.toString(),
      title:         doc.title,
      subject:       doc.subject,
      type:          doc.type,
      fileUrl:       doc.fileUrl,
      downloadUrl:   doc.downloadUrl,
      size:          doc.size,
      targetClass:   doc.targetClass,
      targetSection: doc.targetSection,
      uploadedBy:    doc.uploadedBy,
      date:          doc.createdAt,
    };
  }
}

module.exports = MongoMaterialRepository;
