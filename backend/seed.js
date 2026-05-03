/**
 * SEED SCRIPT
 * Populates the database with realistic default data for development/testing.
 *
 * Run: node seed.js
 *
 * What it seeds (idempotent – skips collections that already have data):
 *  1. Users             – 1 student account
 *  2. Students          – matching profile for the student user
 *  3. Marks             – past exam marks for the student
 *  4. Announcements     – 3 sample school announcements
 *  5. AttendanceRecord  – 3 months of daily attendance records
 *  6. TimetableEntry    – full weekly schedule for Class 10-A
 *  7. CalendarEvent     – academic year events (exams, holidays, ceremonies)
 *  8. DisciplineRecord  – sample conduct history for the student
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');

// ── Models ────────────────────────────────────────────────────────────────────
const UserModel              = require('./src/infrastructure/database/models/UserModel');
const StudentModel           = require('./src/infrastructure/database/models/StudentModel');
const TeacherModel           = require('./src/infrastructure/database/models/TeacherModel');
const MarkModel              = require('./src/infrastructure/database/models/MarkModel');
const AnnouncementModel      = require('./src/infrastructure/database/models/AnnouncementModel');
const AttendanceRecordModel  = require('./src/infrastructure/database/models/AttendanceRecordModel');
const TimetableEntryModel    = require('./src/infrastructure/database/models/TimetableEntryModel');
const CalendarEventModel     = require('./src/infrastructure/database/models/CalendarEventModel');
const DisciplineRecordModel  = require('./src/infrastructure/database/models/DisciplineRecordModel');
const MaterialModel          = require('./src/infrastructure/database/models/MaterialModel');
const ActivityModel          = require('./src/infrastructure/database/models/ActivityModel');

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Generate daily attendance records between two dates (skipping Sundays). */
function generateAttendanceRecords(studentId, fromDate, toDate) {
  const records = [];
  const current = new Date(fromDate);

  // Bias: ~85% present, ~7% absent, ~5% late, ~3% leave
  const STATUS_POOL = [
    ...Array(85).fill('Present'),
    ...Array(7).fill('Absent'),
    ...Array(5).fill('Late'),
    ...Array(3).fill('Leave'),
  ];

  let seed = 42; // deterministic pseudo-random
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };

  while (current <= toDate) {
    const dow = current.getDay(); // 0 = Sunday
    if (dow !== 0) {              // skip Sundays
      const status = STATUS_POOL[Math.floor(rand() * STATUS_POOL.length)];
      records.push({
        studentId,
        date:   new Date(current),
        status,
        note:   status === 'Absent' ? 'Unexplained absence' : null,
      });
    }
    current.setDate(current.getDate() + 1);
  }

  return records;
}

// ─────────────────────────────────────────────────────────────────────────────
// SEED DATA DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

const TIMETABLE_CLASS   = 10;
const TIMETABLE_SECTION = 'A';
const SESSION           = '2025-2026';

/** Full weekly schedule for Class 10-A — mirrors the frontend mockData */
const TIMETABLE_SCHEDULE = [
  // Monday
  { day: 'Monday',    period: 'P1', time: '8:00 - 8:45',   subject: 'Mathematics',     teacher: 'Ms. Nadia',   room: '101' },
  { day: 'Monday',    period: 'P2', time: '8:45 - 9:30',   subject: 'English',          teacher: 'Mr. Khalid',  room: '102' },
  { day: 'Monday',    period: 'P3', time: '9:30 - 10:15',  subject: 'Science',          teacher: 'Ms. Aisha',   room: '103' },
  { day: 'Monday',    period: 'P4', time: '10:30 - 11:15', subject: 'Computer Science', teacher: 'Mr. Farhan',  room: 'Lab 1' },
  { day: 'Monday',    period: 'P5', time: '11:15 - 12:00', subject: 'Islamiyat',        teacher: 'Ms. Sana',    room: '104' },

  // Tuesday
  { day: 'Tuesday',   period: 'P1', time: '8:00 - 8:45',   subject: 'English',          teacher: 'Mr. Khalid',  room: '102' },
  { day: 'Tuesday',   period: 'P2', time: '8:45 - 9:30',   subject: 'Computer Science', teacher: 'Mr. Farhan',  room: 'Lab 1' },
  { day: 'Tuesday',   period: 'P3', time: '9:30 - 10:15',  subject: 'Mathematics',      teacher: 'Ms. Nadia',   room: '101' },
  { day: 'Tuesday',   period: 'P4', time: '10:30 - 11:15', subject: 'Science',          teacher: 'Ms. Aisha',   room: '103' },
  { day: 'Tuesday',   period: 'P5', time: '11:15 - 12:00', subject: 'Urdu',             teacher: 'Ms. Zara',    room: '105' },

  // Wednesday
  { day: 'Wednesday', period: 'P1', time: '8:00 - 8:45',   subject: 'Science',          teacher: 'Ms. Aisha',   room: '103' },
  { day: 'Wednesday', period: 'P2', time: '8:45 - 9:30',   subject: 'Urdu',             teacher: 'Ms. Zara',    room: '105' },
  { day: 'Wednesday', period: 'P3', time: '9:30 - 10:15',  subject: 'English',          teacher: 'Mr. Khalid',  room: '102' },
  { day: 'Wednesday', period: 'P4', time: '10:30 - 11:15', subject: 'Mathematics',      teacher: 'Ms. Nadia',   room: '101' },
  { day: 'Wednesday', period: 'P5', time: '11:15 - 12:00', subject: 'Computer Science', teacher: 'Mr. Farhan',  room: 'Lab 1' },

  // Thursday
  { day: 'Thursday',  period: 'P1', time: '8:00 - 8:45',   subject: 'Science',          teacher: 'Ms. Aisha',   room: '103' },
  { day: 'Thursday',  period: 'P2', time: '8:45 - 9:30',   subject: 'Urdu',             teacher: 'Ms. Zara',    room: '105' },
  { day: 'Thursday',  period: 'P3', time: '9:30 - 10:15',  subject: 'English',          teacher: 'Mr. Khalid',  room: '102' },
  { day: 'Thursday',  period: 'P4', time: '10:30 - 11:15', subject: 'Mathematics',      teacher: 'Ms. Nadia',   room: '101' },
  { day: 'Thursday',  period: 'P5', time: '11:15 - 12:00', subject: 'Computer Science', teacher: 'Mr. Farhan',  room: 'Lab 1' },

  // Friday
  { day: 'Friday',    period: 'P1', time: '8:00 - 8:45',   subject: 'Islamiyat',        teacher: 'Ms. Sana',    room: '104' },
  { day: 'Friday',    period: 'P2', time: '8:45 - 9:30',   subject: 'Mathematics',      teacher: 'Ms. Nadia',   room: '101' },
  { day: 'Friday',    period: 'P3', time: '9:30 - 10:15',  subject: 'Urdu',             teacher: 'Ms. Zara',    room: '105' },
  { day: 'Friday',    period: 'P4', time: '10:30 - 11:15', subject: 'English',          teacher: 'Mr. Khalid',  room: '102' },
  { day: 'Friday',    period: 'P5', time: '11:15 - 12:00', subject: 'Science',          teacher: 'Ms. Aisha',   room: '103' },

  // Saturday (half-day)
  { day: 'Saturday',  period: 'P1', time: '8:00 - 8:45',   subject: 'Computer Science', teacher: 'Mr. Farhan',  room: 'Lab 1' },
  { day: 'Saturday',  period: 'P2', time: '8:45 - 9:30',   subject: 'Mathematics',      teacher: 'Ms. Nadia',   room: '101' },
  { day: 'Saturday',  period: 'P3', time: '9:30 - 10:15',  subject: 'Pakistan Studies', teacher: 'Mr. Imran',   room: '106' },
];

/** Academic calendar events for the 2025-2026 session */
const CALENDAR_EVENTS = [
  // ── Already-past events (give the UI historical data to show) ──
  { title: 'Winter Break Ends',         date: new Date('2026-01-06'), type: 'holiday',  description: 'School resumes after winter break.', targetRoles: ['student', 'teacher', 'admin'] },
  { title: 'MidTerm - II Exams Begin',  date: new Date('2026-01-12'), type: 'exam',     description: 'Mid-term II examinations for all classes.', targetRoles: ['student', 'teacher', 'admin'] },
  { title: 'MidTerm - II Exams End',    date: new Date('2026-01-17'), type: 'exam',     description: 'End of Mid-term II examination week.', targetRoles: ['student', 'teacher', 'admin'] },
  { title: 'Result Day — MidTerm II',   date: new Date('2026-02-03'), type: 'event',    description: 'Distribution of MidTerm II result cards.', targetRoles: ['student', 'teacher', 'admin'] },
  { title: 'Pakistan Day Holiday',      date: new Date('2026-03-23'), type: 'holiday',  description: 'National holiday — school closed.', targetRoles: ['student', 'teacher', 'admin'] },
  // ── Upcoming events ──
  { title: 'Final Exams Begin',         date: new Date('2026-04-01'), type: 'exam',     description: 'Annual final examinations commence for all classes.', targetRoles: ['student', 'teacher', 'admin'] },
  { title: 'Award Ceremony',            date: new Date('2026-04-13'), type: 'event',    description: 'Award ceremony for class 8 will be held in Deans Hall.', targetRoles: ['student', 'teacher', 'admin'] },
  { title: 'Spring Break Starts',       date: new Date('2026-04-20'), type: 'holiday',  description: 'Spring break begins. School resumes 4th May.', targetRoles: ['student', 'teacher', 'admin'] },
  { title: 'Labour Day Holiday',        date: new Date('2026-05-01'), type: 'holiday',  description: 'National holiday — school closed.', targetRoles: ['student', 'teacher', 'admin'] },
  { title: 'School Reopens',            date: new Date('2026-05-04'), type: 'event',    description: 'School reopens after spring break.', targetRoles: ['student', 'teacher', 'admin'] },
  { title: 'Science Fair',              date: new Date('2026-05-15'), type: 'activity', description: 'Annual inter-class science and technology fair.', targetRoles: ['student', 'teacher', 'admin'] },
  { title: 'Parent-Teacher Meeting',    date: new Date('2026-05-22'), type: 'meeting',  description: 'PTM for Classes 9 and 10. Parents are requested to attend.', targetRoles: ['student', 'teacher', 'admin'] },
  { title: 'Final Results Distribution',date: new Date('2026-06-01'), type: 'event',    description: 'Annual result cards distributed to students.', targetRoles: ['student', 'teacher', 'admin'] },
  { title: 'Summer Vacation Begins',    date: new Date('2026-06-10'), type: 'holiday',  description: 'Summer vacations start. School reopens in September.', targetRoles: ['student', 'teacher', 'admin'] },
];

// ─────────────────────────────────────────────────────────────────────────────
// MATERIALS & ACTIVITIES SEED DATA
// ─────────────────────────────────────────────────────────────────────────────

const MATERIALS_DATA = [
  {
    title:       'Mathematics Mid-Term Notes — Chapter 1–4',
    subject:     'Mathematics',
    type:        'PDF',
    fileUrl:     null,
    downloadUrl: null,
    size:        '1.2 MB',
    targetClass: 10,
    targetSection: null,
    uploadedBy:  'Ms. Nadia',
  },
  {
    title:       'English Grammar Workbook — Unit 5',
    subject:     'English',
    type:        'PDF',
    fileUrl:     null,
    downloadUrl: null,
    size:        '860 KB',
    targetClass: 10,
    targetSection: null,
    uploadedBy:  'Mr. Khalid',
  },
  {
    title:       'Computer Science — Data Structures Slides',
    subject:     'Computer Science',
    type:        'PPT',
    fileUrl:     null,
    downloadUrl: null,
    size:        '3.4 MB',
    targetClass: 10,
    targetSection: null,
    uploadedBy:  'Mr. Farhan',
  },
  {
    title:       'Science — Periodic Table Quick Reference',
    subject:     'Science',
    type:        'PDF',
    fileUrl:     null,
    downloadUrl: null,
    size:        '420 KB',
    targetClass: null,
    targetSection: null,
    uploadedBy:  'Ms. Aisha',
  },
  {
    title:       'Urdu — Ghazal Collection for Analysis',
    subject:     'Urdu',
    type:        'PDF',
    fileUrl:     null,
    downloadUrl: null,
    size:        '580 KB',
    targetClass: 10,
    targetSection: null,
    uploadedBy:  'Ms. Zara',
  },
  {
    title:       'Islamiyat — Final Exam Revision Guide',
    subject:     'Islamiyat',
    type:        'PDF',
    fileUrl:     null,
    downloadUrl: null,
    size:        '720 KB',
    targetClass: 10,
    targetSection: null,
    uploadedBy:  'Ms. Sana',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('  Connected to MongoDB');

    // ── 1. Users ─────────────────────────────────────────────────────────────
    const existingUser = await UserModel.findOne({ email: 'ali.ahmed@student.campuslink.pk' });
    let user;
    if (existingUser) {
      console.log('  Student user already exists — skipping');
      user = existingUser;
    } else {
      const hashed = await bcrypt.hash('student123', 10);
      user = await UserModel.create({
        name:         'Ali Ahmed',
        email:        'ali.ahmed@student.campuslink.pk',
        passwordHash: hashed,
        role:         'student',
      });
      console.log(`  Created user: ${user.email}`);
    }

    // ── 2. Students ──────────────────────────────────────────────────────────
    const existingStudent = await StudentModel.findOne({ userId: user._id });
    let student;
    if (existingStudent) {
      console.log('  Student profile already exists — skipping');
      student = existingStudent;
    } else {
      student = await StudentModel.create({
        userId:      user._id,
        name:        'Ali Ahmed',
        email:       'ali.ahmed@student.campuslink.pk',
        studentId:   'STU-10A-001',
        classLevel:  TIMETABLE_CLASS,
        section:     TIMETABLE_SECTION,
        rollNo:      12,
        session:     SESSION,
        feeStatus:   'Paid',
        attendanceOverall:   85,
        attendanceBySubject: [
          { name: 'Computer Science', percentage: 92, color: '#4f8ef7' },
          { name: 'English',          percentage: 72, color: '#9b6dff' },
          { name: 'Mathematics',      percentage: 85, color: '#2db87b' },
          { name: 'Science',          percentage: 98, color: '#f5c842' },
          { name: 'Urdu',             percentage: 80, color: '#ff6b6b' },
          { name: 'Islamiyat',        percentage: 90, color: '#0ea5e9' },
        ],
        progress: [
          { category: 'Behavior',  rating: 'Excellent',    level: 'pb-excellent'    },
          { category: 'Academics', rating: 'Satisfactory', level: 'pb-satisfactory' },
          { category: 'Uniform',   rating: 'Good',         level: 'pb-good'         },
          { category: 'Arts',      rating: 'Unsatisfied',  level: 'pb-unsatisfied'  },
        ],
      });
      console.log(` Created student profile: ${student.studentId}`);
    }

    // ── 3. Marks ─────────────────────────────────────────────────────────────
    const existingMarks = await MarkModel.countDocuments({ studentId: student._id });
    if (existingMarks > 0) {
      console.log(`  Marks already seeded (${existingMarks} records) — skipping`);
    } else {
      const marksData = [
        // MidTerm - I
        { subject: 'Mathematics',     component: 'MidTerm - I',  marks: 78,  total: 100, examDate: new Date('2025-10-15') },
        { subject: 'English',         component: 'MidTerm - I',  marks: 95,  total: 100, examDate: new Date('2025-10-16') },
        { subject: 'Science',         component: 'MidTerm - I',  marks: 91,  total: 100, examDate: new Date('2025-10-17') },
        { subject: 'Computer Science',component: 'MidTerm - I',  marks: 87,  total: 100, examDate: new Date('2025-10-18') },
        { subject: 'Urdu',            component: 'MidTerm - I',  marks: 74,  total: 100, examDate: new Date('2025-10-19') },
        { subject: 'Islamiyat',       component: 'MidTerm - I',  marks: 89,  total: 100, examDate: new Date('2025-10-20') },
        // MidTerm - II
        { subject: 'Mathematics',     component: 'MidTerm - II', marks: 82,  total: 100, examDate: new Date('2026-01-12') },
        { subject: 'English',         component: 'MidTerm - II', marks: 90,  total: 100, examDate: new Date('2026-01-13') },
        { subject: 'Science',         component: 'MidTerm - II', marks: 88,  total: 100, examDate: new Date('2026-01-14') },
        { subject: 'Computer Science',component: 'MidTerm - II', marks: 92,  total: 100, examDate: new Date('2026-01-15') },
        { subject: 'Urdu',            component: 'MidTerm - II', marks: 70,  total: 100, examDate: new Date('2026-01-16') },
        { subject: 'Islamiyat',       component: 'MidTerm - II', marks: 85,  total: 100, examDate: new Date('2026-01-17') },
        // Quizzes
        { subject: 'Mathematics',     component: 'Quiz',          marks: 18,  total: 20,  examDate: new Date('2025-11-05') },
        { subject: 'English',         component: 'Quiz',          marks: 19,  total: 20,  examDate: new Date('2025-11-06') },
        { subject: 'Computer Science',component: 'Quiz',          marks: 20,  total: 20,  examDate: new Date('2025-11-07') },
        // Assignments
        { subject: 'Science',         component: 'Assignment',    marks: 9,   total: 10,  examDate: new Date('2025-12-01') },
        { subject: 'Mathematics',     component: 'Assignment',    marks: 8,   total: 10,  examDate: new Date('2025-12-02') },
      ].map(m => ({ ...m, studentId: student._id }));

      await MarkModel.insertMany(marksData);
      console.log(`  Seeded ${marksData.length} mark records`);
    }

    // ── 4. Announcements ─────────────────────────────────────────────────────
    const announcementCount = await AnnouncementModel.countDocuments();
    if (announcementCount > 0) {
      console.log(`   Announcements already seeded (${announcementCount}) — skipping`);
    } else {
      await AnnouncementModel.insertMany([
        { title: 'Final Exam Postponed',    description: 'Exams postponed till 1st April due to online classes.',                                      tag: 'urgent', targetRoles: ['student', 'teacher', 'admin'] },
        { title: 'Award Ceremony',          description: 'Dear Students, the award ceremony for class 8 will be held on 13th April in Deans Hall.',    tag: 'event',  targetRoles: ['student', 'teacher', 'admin'] },
        { title: 'Library Extended Hours',  description: 'The library will be open until 7 PM during exam preparation week.',                          tag: 'info',   targetRoles: ['student', 'teacher', 'admin'] },
      ]);
      console.log('  Seeded 3 announcements');
    }

    // ── 5. Attendance Records ─────────────────────────────────────────────────
    const attCount = await AttendanceRecordModel.countDocuments({ studentId: student._id });
    if (attCount > 0) {
      console.log(`  Attendance records already seeded (${attCount} records) — skipping`);
    } else {
      const records = generateAttendanceRecords(
        student._id,
        new Date('2026-01-06'),
        new Date('2026-03-28'),
      );
      await AttendanceRecordModel.insertMany(records);
      console.log(` Seeded ${records.length} attendance records`);
    }

    // ── 6. Timetable Entries ──────────────────────────────────────────────────
    const ttCount = await TimetableEntryModel.countDocuments({
      classLevel: TIMETABLE_CLASS,
      section:    TIMETABLE_SECTION,
    });
    if (ttCount > 0) {
      console.log(` Timetable already seeded (${ttCount} entries) — skipping`);
    } else {
      const entries = TIMETABLE_SCHEDULE.map(e => ({
        ...e,
        classLevel: TIMETABLE_CLASS,
        section:    TIMETABLE_SECTION,
        session:    SESSION,
      }));
      await TimetableEntryModel.insertMany(entries);
      console.log(`  Seeded ${entries.length} timetable entries for Class ${TIMETABLE_CLASS}-${TIMETABLE_SECTION}`);
    }

    // ── 7. Calendar Events ────────────────────────────────────────────────────
    const calCount = await CalendarEventModel.countDocuments();
    if (calCount > 0) {
      console.log(`  Calendar events already seeded (${calCount} events) — skipping`);
    } else {
      await CalendarEventModel.insertMany(CALENDAR_EVENTS);
      console.log(`  Seeded ${CALENDAR_EVENTS.length} calendar events`);
    }

    // ── 8. Discipline Records ─────────────────────────────────────────────────
    const discCount = await DisciplineRecordModel.countDocuments({ studentId: student._id });
    if (discCount > 0) {
      console.log(`  Discipline records already seeded (${discCount} records) — skipping`);
    } else {
      await DisciplineRecordModel.insertMany([
        {
          studentId: student._id,
          date:      new Date('2026-01-20'),
          remarks:   'Excellent behaviour during the science lab session. Helped peers and followed all safety protocols.',
          severity:  'good',
          issuedBy:  'Ms. Aisha (Science Teacher)',
        },
        {
          studentId: student._id,
          date:      new Date('2026-02-10'),
          remarks:   'Caution issued for repeated late arrival during first period. Student has been advised to improve punctuality.',
          severity:  'warning',
          issuedBy:  'Mr. Khalid (Class Teacher)',
        },
        {
          studentId: student._id,
          date:      new Date('2026-03-05'),
          remarks:   'Outstanding performance and conduct during the inter-school quiz competition. Represented the school with distinction.',
          severity:  'good',
          issuedBy:  'Mr. Farhan (Computer Science Teacher)',
        },
      ]);
      console.log(' Seeded 3 discipline records');
    }

    // ── 9. Materials ─────────────────────────────────────────────────────────
    const matCount = await MaterialModel.countDocuments();
    if (matCount > 0) {
      console.log();
    } else {
      await MaterialModel.insertMany(MATERIALS_DATA);
      console.log();
    }

    // ── 10. Activities ───────────────────────────────────────────────────────
    const actCount = await ActivityModel.countDocuments({ studentId: student._id });
    if (actCount > 0) {
      console.log();
    } else {
      await ActivityModel.insertMany([
        { studentId: student._id, activity: 'Cricket Team',  participation: 'Active Member',  description: 'Represents school in inter-school cricket tournaments.' },
        { studentId: student._id, activity: 'Science Club',  participation: 'Vice President', description: 'Organises science fairs and lab demonstrations.' },
        { studentId: student._id, activity: 'Art Society',   participation: 'Member',         description: 'Participates in school art exhibitions.' },
      ]);
      console.log('  Seeded 3 activity records');
    }

    // ── 11. Teacher User + Profile ────────────────────────────────────────────
    const existingTeacherUser = await UserModel.findOne({ email: 'nadia.hussain@teacher.campuslink.pk' });
    let teacherUser;
    if (existingTeacherUser) {
      console.log('  Teacher user already exists — skipping');
      teacherUser = existingTeacherUser;
    } else {
      const hashedTeacher = await bcrypt.hash('teacher123', 10);
      teacherUser = await UserModel.create({
        name:         'Ms. Nadia Hussain',
        email:        'nadia.hussain@teacher.campuslink.pk',
        passwordHash: hashedTeacher,
        role:         'teacher',
      });
      console.log(`  Created teacher user: ${teacherUser.email}`);
    }

    const existingTeacherProfile = await TeacherModel.findOne({ userId: teacherUser._id });
    if (existingTeacherProfile) {
      console.log('  Teacher profile already exists — skipping');
    } else {
      await TeacherModel.create({
        userId:        teacherUser._id,
        name:          'Ms. Nadia Hussain',
        email:         'nadia.hussain@teacher.campuslink.pk',
        teacherId:     'T-001',
        subjects:      ['Mathematics', 'Computer Science'],
        classes:       ['10-A', '10-B', '9-A'],
        department:    'Science & Technology',
        qualification: 'M.Sc Mathematics',
        joined:        '2019',
      });
      console.log('  Created teacher profile: T-001');
    }

    // ─────────────────────────────────────────────────────────────────────────
    console.log('  Seed complete!\n');
    console.log('   Student login credentials:');
    console.log('   Email:    ali.ahmed@student.campuslink.pk');
    console.log('   Password: student123\n');
    console.log('   Teacher login credentials:');
    console.log('   Email:    nadia.hussain@teacher.campuslink.pk');
    console.log('   Password: teacher123\n');

  } catch (err) {
    console.error('  Seed failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
