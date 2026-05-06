/**
 * ADMIN CONTROLLER
 * Handles all admin portal operations:
 *  - Dashboard stats
 *  - Student CRUD
 *  - Teacher CRUD + section assignment
 *  - Section CRUD
 *  - Timetable CRUD
 *  - Fee management
 *  - Announcements CRUD
 *  - Financial aid review
 */

const bcrypt = require('bcryptjs');

const UserModel          = require('../../database/models/UserModel');
const StudentModel       = require('../../database/models/StudentModel');
const TeacherModel       = require('../../database/models/TeacherModel');
const SectionModel       = require('../../database/models/SectionModel');
const FeeRecordModel     = require('../../database/models/FeeRecordModel');
const FinancialAidModel  = require('../../database/models/FinancialAidModel');
const AnnouncementModel  = require('../../database/models/AnnouncementModel');
const TimetableEntryModel = require('../../database/models/TimetableEntryModel');

// ── Fee lookup by classId ─────────────────────────────────────────────────────
const FEE_BY_CLASS = {
  playgroup: 4500, prenursery: 4500, nursery: 4500,
  '1': 5000, '2': 5000, '3': 5000,
  '4': 5500, '5': 5500, '6': 6500,
  '7': 6500, '8': 7000,
  '9': 7500, 'X': 8500,
};

const getFee = (classId) => FEE_BY_CLASS[String(classId)] || 5000;

// Numeric classLevel for models that need it (null for early-ed)
const CLASS_LEVEL_MAP = {
  '1':1,'2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'X':10,
};

// ── Counter helpers ───────────────────────────────────────────────────────────
async function nextStudentId() {
  const last = await StudentModel.findOne().sort({ createdAt: -1 }).select('studentId').lean();
  if (!last) return 'STU-001';
  const num = parseInt((last.studentId || '').replace('STU-', ''), 10) || 0;
  return `STU-${String(num + 1).padStart(3, '0')}`;
}

async function nextTeacherId() {
  const last = await TeacherModel.findOne().sort({ createdAt: -1 }).select('teacherId').lean();
  if (!last) return 'T-001';
  const num = parseInt((last.teacherId || '').replace('T-', ''), 10) || 0;
  return `T-${String(num + 1).padStart(3, '0')}`;
}

// ── Current month label ───────────────────────────────────────────────────────
function currentMonthLabel() {
  const d = new Date();
  return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

function currentDueDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-10`;
}

// =============================================================================
// DASHBOARD
// =============================================================================
exports.getDashboard = async (req, res, next) => {
  try {
    const [totalStudents, totalTeachers, totalSections, feeStats] = await Promise.all([
      StudentModel.countDocuments(),
      TeacherModel.countDocuments(),
      SectionModel.countDocuments(),
      FeeRecordModel.aggregate([
        { $match: { month: currentMonthLabel() } },
        { $group: {
            _id: '$status',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          }
        },
      ]),
    ]);

    const feeSummary = { paid: 0, pending: 0, overdue: 0 };
    feeStats.forEach(s => {
      if (s._id === 'Paid')    feeSummary.paid    = s.total;
      if (s._id === 'Pending') feeSummary.pending = s.total;
      if (s._id === 'Overdue') feeSummary.overdue = s.total;
    });

    const pendingAid = await FinancialAidModel.countDocuments({ status: 'pending' });

    res.json({
      success: true,
      data: { totalStudents, totalTeachers, totalSections, feeSummary, pendingAid },
    });
  } catch (err) { next(err); }
};

// =============================================================================
// STUDENTS
// =============================================================================
exports.listStudents = async (req, res, next) => {
  try {
    const { search, classId, section } = req.query;
    const filter = {};
    if (classId && classId !== 'all') filter.classId = classId;
    if (section && section !== 'all') filter.section = section.toUpperCase();
    if (search) {
      const re = new RegExp(String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: re }, { email: re }, { studentId: re }];
    }
    const students = await StudentModel.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: students });
  } catch (err) { next(err); }
};

exports.getStudent = async (req, res, next) => {
  try {
    const student = await StudentModel.findById(req.params.id).lean();
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data: student });
  } catch (err) { next(err); }
};

exports.createStudent = async (req, res, next) => {
  try {
    const {
      name, email, password, cnic, dob, gender, phone, address,
      fatherName, fatherCnic, fatherPhone, fatherOccupation,
      motherName, motherPhone,
      classId, section, rollNo,
    } = req.body;

    // Duplicate email check
    const existingUser = await UserModel.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password || 'Student@123', 12);
    const user = await UserModel.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'student',
    });

    const studentId  = await nextStudentId();
    const monthlyFee = getFee(classId);
    const classLevel = CLASS_LEVEL_MAP[classId] || null;

    const student = await StudentModel.create({
      userId: user._id,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      studentId,
      cnic, dob, gender, phone, address,
      fatherName, fatherCnic, fatherPhone, fatherOccupation,
      motherName, motherPhone,
      classId: String(classId),
      classLevel,
      section: String(section).toUpperCase(),
      rollNo: rollNo ? parseInt(rollNo, 10) : null,
      admissionDate: new Date().toISOString().split('T')[0],
      feeStatus: 'Pending',
      monthlyFee,
      session: '2025-2026',
    });

    // Auto-create fee record for current month
    try {
      await FeeRecordModel.create({
        studentId:   student._id,
        studentName: student.name,
        studentCode: student.studentId,
        classId:     student.classId,
        section:     student.section,
        month:       currentMonthLabel(),
        amount:      monthlyFee,
        status:      'Pending',
        dueDate:     currentDueDate(),
      });
    } catch (_) { /* ignore duplicate fee */ }

    // Increment section studentCount
    await SectionModel.updateOne(
      { classId: student.classId, section: student.section },
      { $inc: { studentCount: 1 } }
    );

    res.status(201).json({ success: true, data: student, message: 'Student created successfully' });
  } catch (err) { next(err); }
};

exports.updateStudent = async (req, res, next) => {
  try {
    const allowed = [
      'name','cnic','dob','gender','phone','address',
      'fatherName','fatherCnic','fatherPhone','fatherOccupation',
      'motherName','motherPhone',
      'classId','section','rollNo','feeStatus',
    ];
    const update = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
    if (update.section) update.section = String(update.section).toUpperCase();
    if (update.classId) {
      update.classLevel = CLASS_LEVEL_MAP[update.classId] || null;
      update.monthlyFee = getFee(update.classId);
    }

    const student = await StudentModel.findByIdAndUpdate(req.params.id, update, { new: true }).lean();
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    // Sync name on User too
    if (update.name) await UserModel.findByIdAndUpdate(student.userId, { name: update.name });

    res.json({ success: true, data: student, message: 'Student updated' });
  } catch (err) { next(err); }
};

exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await StudentModel.findById(req.params.id).lean();
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    await Promise.all([
      UserModel.findByIdAndDelete(student.userId),
      StudentModel.findByIdAndDelete(student._id),
      FeeRecordModel.deleteMany({ studentId: student._id }),
    ]);

    // Decrement section count
    await SectionModel.updateOne(
      { classId: student.classId, section: student.section },
      { $inc: { studentCount: -1 } }
    );

    res.json({ success: true, message: 'Student deleted' });
  } catch (err) { next(err); }
};

// =============================================================================
// TEACHERS
// =============================================================================
exports.listTeachers = async (req, res, next) => {
  try {
    const { search, department } = req.query;
    const filter = {};
    if (department && department !== 'all') filter.department = department;
    if (search) {
      const re = new RegExp(String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: re }, { email: re }, { department: re }, { teacherId: re }];
    }
    const teachers = await TeacherModel.find(filter)
      .populate('assignedSections', 'classId section subject')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: teachers });
  } catch (err) { next(err); }
};

exports.getTeacher = async (req, res, next) => {
  try {
    const teacher = await TeacherModel.findById(req.params.id)
      .populate('assignedSections')
      .lean();
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });
    res.json({ success: true, data: teacher });
  } catch (err) { next(err); }
};

exports.createTeacher = async (req, res, next) => {
  try {
    const {
      name, email, password, cnic, dob, gender, phone, address,
      qualification, department, joinDate,
    } = req.body;

    const existingUser = await UserModel.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password || 'Teacher@123', 12);
    const user = await UserModel.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'teacher',
    });

    const teacherId = await nextTeacherId();

    const teacher = await TeacherModel.create({
      userId: user._id,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      teacherId,
      cnic, dob, gender, phone, address,
      qualification,
      department,
      joinDate,
      joined: joinDate ? joinDate.split('-')[0] : String(new Date().getFullYear()),
      subjects: [],
      classes: [],
      assignedSections: [],
    });

    res.status(201).json({ success: true, data: teacher, message: 'Teacher created successfully' });
  } catch (err) { next(err); }
};

exports.updateTeacher = async (req, res, next) => {
  try {
    const allowed = [
      'name','cnic','dob','gender','phone','address',
      'qualification','department','joinDate',
    ];
    const update = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
    if (update.joinDate) update.joined = update.joinDate.split('-')[0];

    const teacher = await TeacherModel.findByIdAndUpdate(req.params.id, update, { new: true }).lean();
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

    if (update.name) await UserModel.findByIdAndUpdate(teacher.userId, { name: update.name });

    res.json({ success: true, data: teacher, message: 'Teacher updated' });
  } catch (err) { next(err); }
};

exports.deleteTeacher = async (req, res, next) => {
  try {
    const teacher = await TeacherModel.findById(req.params.id).lean();
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

    // Unassign teacher from sections
    await SectionModel.updateMany(
      { teacherId: teacher._id },
      { $set: { teacherId: null, teacherName: null } }
    );

    await Promise.all([
      UserModel.findByIdAndDelete(teacher.userId),
      TeacherModel.findByIdAndDelete(teacher._id),
    ]);

    res.json({ success: true, message: 'Teacher deleted' });
  } catch (err) { next(err); }
};

exports.assignSection = async (req, res, next) => {
  try {
    const teacher = await TeacherModel.findById(req.params.id);
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

    const section = await SectionModel.findById(req.body.sectionId);
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });

    // Set teacher on section
    section.teacherId   = teacher._id;
    section.teacherName = teacher.name;
    await section.save();

    // Add section to teacher's list (if not already there)
    if (!teacher.assignedSections.map(String).includes(String(section._id))) {
      teacher.assignedSections.push(section._id);
    }
    // Keep subjects/classes denormalised
    if (!teacher.subjects.includes(section.subject)) teacher.subjects.push(section.subject);
    const classLabel = `${section.classId}-${section.section}`;
    if (!teacher.classes.includes(classLabel)) teacher.classes.push(classLabel);
    await teacher.save();

    res.json({ success: true, message: 'Section assigned to teacher', data: section });
  } catch (err) { next(err); }
};

exports.unassignSection = async (req, res, next) => {
  try {
    const teacher = await TeacherModel.findById(req.params.id);
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

    const { sectionId } = req.body;
    teacher.assignedSections = teacher.assignedSections.filter(s => String(s) !== String(sectionId));
    await teacher.save();

    await SectionModel.findByIdAndUpdate(sectionId, { teacherId: null, teacherName: null });

    res.json({ success: true, message: 'Section unassigned' });
  } catch (err) { next(err); }
};

// =============================================================================
// SECTIONS
// =============================================================================
exports.listSections = async (req, res, next) => {
  try {
    const { classId, search } = req.query;
    const filter = {};
    if (classId && classId !== 'all') filter.classId = classId;
    if (search) {
      const re = new RegExp(String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ subject: re }, { teacherName: re }];
    }
    const sections = await SectionModel.find(filter)
      .populate('teacherId', 'name teacherId department')
      .sort({ classId: 1, section: 1 })
      .lean();
    res.json({ success: true, data: sections });
  } catch (err) { next(err); }
};

exports.createSection = async (req, res, next) => {
  try {
    const { classId, section, subject, teacherId } = req.body;

    // Check duplicate
    const exists = await SectionModel.findOne({
      classId: String(classId),
      section: String(section).toUpperCase(),
      subject: String(subject),
      session: '2025-2026',
    });
    if (exists) {
      return res.status(409).json({ success: false, message: 'This class-section-subject combination already exists' });
    }

    let teacherDoc = null;
    if (teacherId) {
      teacherDoc = await TeacherModel.findById(teacherId).lean();
    }

    const newSection = await SectionModel.create({
      classId:     String(classId),
      classLevel:  CLASS_LEVEL_MAP[classId] || null,
      section:     String(section).toUpperCase(),
      subject:     String(subject),
      teacherId:   teacherDoc ? teacherDoc._id : null,
      teacherName: teacherDoc ? teacherDoc.name : null,
      studentCount: 0,
      session: '2025-2026',
    });

    // Add section to teacher's assignedSections
    if (teacherDoc) {
      await TeacherModel.findByIdAndUpdate(teacherDoc._id, {
        $addToSet: {
          assignedSections: newSection._id,
          subjects: subject,
          classes: `${classId}-${section}`,
        },
      });
    }

    res.status(201).json({ success: true, data: newSection, message: 'Section created' });
  } catch (err) { next(err); }
};

exports.updateSection = async (req, res, next) => {
  try {
    const { teacherId } = req.body;
    const update = {};

    if (teacherId !== undefined) {
      if (teacherId) {
        const t = await TeacherModel.findById(teacherId).lean();
        update.teacherId   = t ? t._id : null;
        update.teacherName = t ? t.name : null;
      } else {
        update.teacherId   = null;
        update.teacherName = null;
      }
    }

    const section = await SectionModel.findByIdAndUpdate(req.params.id, update, { new: true }).lean();
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });
    res.json({ success: true, data: section, message: 'Section updated' });
  } catch (err) { next(err); }
};

exports.deleteSection = async (req, res, next) => {
  try {
    const section = await SectionModel.findById(req.params.id).lean();
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });

    // Remove from teacher's assigned list
    if (section.teacherId) {
      await TeacherModel.findByIdAndUpdate(section.teacherId, {
        $pull: { assignedSections: section._id },
      });
    }

    await SectionModel.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Section deleted' });
  } catch (err) { next(err); }
};

// =============================================================================
// TIMETABLE
// =============================================================================
exports.getTimetable = async (req, res, next) => {
  try {
    const { classId, section } = req.query;
    const filter = {};
    if (classId) filter.classLevel = CLASS_LEVEL_MAP[classId] || parseInt(classId, 10);
    if (section) filter.section = String(section).toUpperCase();

    const entries = await TimetableEntryModel.find(filter)
      .sort({ day: 1, time: 1 })
      .lean();
    res.json({ success: true, data: entries });
  } catch (err) { next(err); }
};

exports.saveTimetableEntry = async (req, res, next) => {
  try {
    const { classId, section, day, period, time, subject, teacher, room } = req.body;
    const classLevel = CLASS_LEVEL_MAP[classId] || parseInt(classId, 10);
    const sec = String(section).toUpperCase();

    // Upsert: if same classLevel+section+day+period exists, update it
    const entry = await TimetableEntryModel.findOneAndUpdate(
      { classLevel, section: sec, day: String(day), period: String(period) },
      { time, subject, teacher, room, session: '2025-2026' },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    res.status(201).json({ success: true, data: entry, message: 'Timetable entry saved' });
  } catch (err) { next(err); }
};

exports.deleteTimetableEntry = async (req, res, next) => {
  try {
    await TimetableEntryModel.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Entry deleted' });
  } catch (err) { next(err); }
};

exports.saveBulkTimetable = async (req, res, next) => {
  try {
    const { classId, section, timetable } = req.body;
    // timetable: { Monday: [{period, time, subject, teacher, room},...], ... }
    const classLevel = CLASS_LEVEL_MAP[classId] || parseInt(classId, 10);
    const sec = String(section).toUpperCase();

    // Delete existing entries for this class+section first
    await TimetableEntryModel.deleteMany({ classLevel, section: sec, session: '2025-2026' });

    const entries = [];
    for (const [day, periods] of Object.entries(timetable)) {
      for (const slot of periods) {
        entries.push({
          classLevel, section: sec,
          day, period: slot.period || slot.time,
          time: slot.time, subject: slot.subject,
          teacher: slot.teacher, room: slot.room || null,
          session: '2025-2026',
        });
      }
    }

    const saved = await TimetableEntryModel.insertMany(entries, { ordered: false });
    res.json({ success: true, data: saved, message: 'Timetable saved' });
  } catch (err) { next(err); }
};

// =============================================================================
// FEES
// =============================================================================
exports.listFees = async (req, res, next) => {
  try {
    const { month, classId, status, search } = req.query;
    const filter = {};
    if (month && month !== 'all') filter.month = month;
    if (classId && classId !== 'all') filter.classId = classId;
    if (status && status !== 'all') filter.status = status;
    if (search) {
      const re = new RegExp(String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ studentName: re }, { studentCode: re }];
    }
    const records = await FeeRecordModel.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: records });
  } catch (err) { next(err); }
};

exports.markFeePaid = async (req, res, next) => {
  try {
    const record = await FeeRecordModel.findByIdAndUpdate(
      req.params.id,
      {
        status:   'Paid',
        paidDate: new Date().toISOString().split('T')[0],
        paidBy:   req.user?.sub || null,
      },
      { new: true }
    ).lean();
    if (!record) return res.status(404).json({ success: false, message: 'Fee record not found' });

    // Update student feeStatus
    await StudentModel.findOneAndUpdate(
      { studentId: record.studentCode },
      { feeStatus: 'Paid' }
    );

    res.json({ success: true, data: record, message: 'Fee marked as paid' });
  } catch (err) { next(err); }
};

exports.generateMonthlyFees = async (req, res, next) => {
  try {
    const { month } = req.body;
    const students = await StudentModel.find().lean();
    const existing = await FeeRecordModel.find({ month }).select('studentId').lean();
    const existingIds = new Set(existing.map(r => String(r.studentId)));

    const toCreate = students
      .filter(s => !existingIds.has(String(s._id)))
      .map(s => ({
        studentId:   s._id,
        studentName: s.name,
        studentCode: s.studentId,
        classId:     s.classId,
        section:     s.section,
        month,
        amount:      s.monthlyFee || getFee(s.classId),
        status:      'Pending',
        dueDate:     `${month.split(' ')[1]}-${String(['January','February','March','April','May','June','July','August','September','October','November','December'].indexOf(month.split(' ')[0]) + 1).padStart(2,'0')}-10`,
      }));

    if (toCreate.length === 0) {
      return res.json({ success: true, message: 'Fees already generated for this month', created: 0 });
    }

    await FeeRecordModel.insertMany(toCreate, { ordered: false });
    res.json({ success: true, message: `Generated ${toCreate.length} fee records`, created: toCreate.length });
  } catch (err) { next(err); }
};

// =============================================================================
// ANNOUNCEMENTS
// =============================================================================
exports.listAnnouncements = async (req, res, next) => {
  try {
    const announcements = await AnnouncementModel.find()
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: announcements });
  } catch (err) { next(err); }
};

exports.createAnnouncement = async (req, res, next) => {
  try {
    const { title, description, tag, targetRoles } = req.body;
    const announcement = await AnnouncementModel.create({
      title: title.trim(),
      description: description.trim(),
      tag: tag || 'info',
      targetRoles: targetRoles || ['student', 'teacher', 'admin'],
      createdBy: req.user?.sub || null,
    });
    res.status(201).json({ success: true, data: announcement, message: 'Announcement created' });
  } catch (err) { next(err); }
};

exports.updateAnnouncement = async (req, res, next) => {
  try {
    const { title, description, tag, targetRoles } = req.body;
    const update = {};
    if (title)       update.title       = title.trim();
    if (description) update.description = description.trim();
    if (tag)         update.tag         = tag;
    if (targetRoles) update.targetRoles = targetRoles;

    const a = await AnnouncementModel.findByIdAndUpdate(req.params.id, update, { new: true }).lean();
    if (!a) return res.status(404).json({ success: false, message: 'Announcement not found' });
    res.json({ success: true, data: a, message: 'Announcement updated' });
  } catch (err) { next(err); }
};

exports.deleteAnnouncement = async (req, res, next) => {
  try {
    await AnnouncementModel.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Announcement deleted' });
  } catch (err) { next(err); }
};

// =============================================================================
// FINANCIAL AID
// =============================================================================
exports.listFinancialAid = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    const applications = await FinancialAidModel.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: applications });
  } catch (err) { next(err); }
};

exports.createFinancialAid = async (req, res, next) => {
  try {
    const {
      studentCode, type, requestedAmount, reason, documents,
    } = req.body;

    const student = await StudentModel.findOne({ studentId: String(studentCode) }).lean();
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const aid = await FinancialAidModel.create({
      studentId:       student._id,
      studentName:     student.name,
      studentCode:     student.studentId,
      classId:         student.classId,
      section:         student.section,
      type,
      appliedDate:     new Date().toISOString().split('T')[0],
      requestedAmount: Number(requestedAmount),
      reason,
      documents: documents || [],
      status: 'pending',
    });
    res.status(201).json({ success: true, data: aid, message: 'Application created' });
  } catch (err) { next(err); }
};

exports.reviewFinancialAid = async (req, res, next) => {
  try {
    const { status, approvedAmount, reviewNote } = req.body;
    const update = {
      status,
      reviewNote: reviewNote || '',
      reviewedBy: req.user?.sub || null,
      reviewedAt: new Date(),
    };
    if (approvedAmount !== undefined) update.approvedAmount = Number(approvedAmount);

    const aid = await FinancialAidModel.findByIdAndUpdate(req.params.id, update, { new: true }).lean();
    if (!aid) return res.status(404).json({ success: false, message: 'Application not found' });

    // If approved, apply discount to student's fee for current month
    if (status === 'approved' && aid.approvedAmount) {
      await FeeRecordModel.updateOne(
        { studentId: aid.studentId, month: currentMonthLabel() },
        { $inc: { amount: -aid.approvedAmount } }
      );
    }

    res.json({ success: true, data: aid, message: `Application ${status}` });
  } catch (err) { next(err); }
};

exports.deleteFinancialAid = async (req, res, next) => {
  try {
    await FinancialAidModel.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Application deleted' });
  } catch (err) { next(err); }
};