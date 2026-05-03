const IActivityRepository = require('../../../application/ports/IActivityRepository');
const ActivityModel = require('../models/ActivityModel');

class MongoActivityRepository extends IActivityRepository {
  async findByStudentId(studentId) {
    const docs = await ActivityModel.find({ studentId: String(studentId) })
      .sort({ createdAt: 1 })
      .lean();
    return docs.map(this._toPlain);
  }

  _toPlain(doc) {
    return {
      id:            doc._id.toString(),
      activity:      doc.activity,
      participation: doc.participation,
      description:   doc.description,
      startDate:     doc.startDate,
      isActive:      doc.isActive,
    };
  }
}

module.exports = MongoActivityRepository;
