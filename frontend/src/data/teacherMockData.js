// ================= TEACHER DATA =================

export const teacherProfile = {
  id: "T-001",
  name: "Ms. Nadia Hussain",
  email: "teacher@test.com",
  password: "1234",
  role: "teacher",
  subjects: ["Mathematics", "Computer Science"],
  classes: ["10-A", "10-B", "9-A"],
  department: "Science & Technology",
  qualification: "M.Sc Mathematics",
  joined: "2019",
};

// ================= TEACHER TIMETABLE =================
export const teacherTimetable = [
  { day: "Monday",    time: "8:00 - 8:45",   subject: "Mathematics",       class: "10-A", room: "R-101" },
  { day: "Monday",    time: "9:30 - 10:15",  subject: "Computer Science",  class: "9-A",  room: "Lab-1" },
  { day: "Monday",    time: "10:30 - 11:15", subject: "Mathematics",       class: "10-B", room: "R-103" },
  { day: "Tuesday",   time: "8:00 - 8:45",   subject: "Mathematics",       class: "9-A",  room: "R-101" },
  { day: "Tuesday",   time: "8:45 - 9:30",   subject: "Computer Science",  class: "10-A", room: "Lab-1" },
  { day: "Tuesday",   time: "11:15 - 12:00", subject: "Mathematics",       class: "10-B", room: "R-103" },
  { day: "Wednesday", time: "8:00 - 8:45",   subject: "Computer Science",  class: "10-B", room: "Lab-1" },
  { day: "Wednesday", time: "9:30 - 10:15",  subject: "Mathematics",       class: "10-A", room: "R-101" },
  { day: "Wednesday", time: "10:30 - 11:15", subject: "Computer Science",  class: "9-A",  room: "Lab-1" },
  { day: "Thursday",  time: "8:45 - 9:30",   subject: "Mathematics",       class: "10-A", room: "R-101" },
  { day: "Thursday",  time: "9:30 - 10:15",  subject: "Mathematics",       class: "9-A",  room: "R-102" },
  { day: "Thursday",  time: "11:15 - 12:00", subject: "Computer Science",  class: "10-B", room: "Lab-1" },
  { day: "Friday",    time: "8:00 - 8:45",   subject: "Computer Science",  class: "10-A", room: "Lab-1" },
  { day: "Friday",    time: "8:45 - 9:30",   subject: "Mathematics",       class: "10-B", room: "R-103" },
  { day: "Friday",    time: "10:30 - 11:15", subject: "Computer Science",  class: "9-A",  room: "Lab-1" },
];

// ================= STUDENTS PER CLASS =================
export const classStudents = {
  "10-A": [
    { id: 1,  name: "Ali Ahmed",      rollNo: 12, gender: "Male"   },
    { id: 2,  name: "Sara Khan",      rollNo: 5,  gender: "Female" },
    { id: 3,  name: "Bilal Raza",     rollNo: 7,  gender: "Male"   },
    { id: 4,  name: "Hina Malik",     rollNo: 9,  gender: "Female" },
    { id: 5,  name: "Usman Tariq",    rollNo: 15, gender: "Male"   },
    { id: 6,  name: "Ayesha Noor",    rollNo: 3,  gender: "Female" },
    { id: 7,  name: "Hamza Sheikh",   rollNo: 21, gender: "Male"   },
    { id: 8,  name: "Zara Butt",      rollNo: 18, gender: "Female" },
  ],
  "10-B": [
    { id: 9,  name: "Kamran Iqbal",   rollNo: 4,  gender: "Male"   },
    { id: 10, name: "Fatima Siddiq",  rollNo: 11, gender: "Female" },
    { id: 11, name: "Omar Cheema",    rollNo: 8,  gender: "Male"   },
    { id: 12, name: "Maryam Zahid",   rollNo: 2,  gender: "Female" },
    { id: 13, name: "Saad Farooq",    rollNo: 17, gender: "Male"   },
    { id: 14, name: "Nimra Javed",    rollNo: 6,  gender: "Female" },
  ],
  "9-A": [
    { id: 15, name: "Talha Nawaz",    rollNo: 1,  gender: "Male"   },
    { id: 16, name: "Sana Akram",     rollNo: 10, gender: "Female" },
    { id: 17, name: "Zain ul Abdin",  rollNo: 14, gender: "Male"   },
    { id: 18, name: "Maham Ashraf",   rollNo: 7,  gender: "Female" },
    { id: 19, name: "Faisal Riaz",    rollNo: 20, gender: "Male"   },
    { id: 20, name: "Rabia Qamar",    rollNo: 3,  gender: "Female" },
  ],
};

// ================= ATTENDANCE RECORDS =================
export const teacherAttendanceRecords = {
  "10-A": {
    "2026-03-28": { 1: "Present", 2: "Present", 3: "Absent",  4: "Present", 5: "Present", 6: "Present", 7: "Late",    8: "Present" },
    "2026-03-27": { 1: "Present", 2: "Absent",  3: "Present", 4: "Present", 5: "Present", 6: "Absent",  7: "Present", 8: "Present" },
    "2026-03-26": { 1: "Absent",  2: "Present", 3: "Present", 4: "Present", 5: "Late",    6: "Present", 7: "Present", 8: "Present" },
    "2026-03-25": { 1: "Present", 2: "Present", 3: "Present", 4: "Absent",  5: "Present", 6: "Present", 7: "Present", 8: "Late"    },
  },
  "10-B": {
    "2026-03-28": { 9: "Present", 10: "Present", 11: "Present", 12: "Late",    13: "Absent",  14: "Present" },
    "2026-03-27": { 9: "Absent",  10: "Present", 11: "Present", 12: "Present", 13: "Present", 14: "Present" },
    "2026-03-26": { 9: "Present", 10: "Absent",  11: "Present", 12: "Present", 13: "Present", 14: "Present" },
  },
  "9-A": {
    "2026-03-28": { 15: "Present", 16: "Present", 17: "Absent",  18: "Present", 19: "Present", 20: "Present" },
    "2026-03-27": { 15: "Present", 16: "Present", 17: "Present", 18: "Present", 19: "Late",    20: "Absent"  },
  },
};

// ================= MARKS =================
export const teacherMarks = {
  "10-A": {
    "Mathematics": [
      { studentId: 1,  name: "Ali Ahmed",    marks: 92, total: 100, component: "MidTerm - I" },
      { studentId: 2,  name: "Sara Khan",    marks: 78, total: 100, component: "MidTerm - I" },
      { studentId: 3,  name: "Bilal Raza",   marks: 65, total: 100, component: "MidTerm - I" },
      { studentId: 4,  name: "Hina Malik",   marks: 85, total: 100, component: "MidTerm - I" },
      { studentId: 5,  name: "Usman Tariq",  marks: 70, total: 100, component: "MidTerm - I" },
      { studentId: 6,  name: "Ayesha Noor",  marks: 88, total: 100, component: "MidTerm - I" },
      { studentId: 7,  name: "Hamza Sheikh", marks: 55, total: 100, component: "MidTerm - I" },
      { studentId: 8,  name: "Zara Butt",    marks: 91, total: 100, component: "MidTerm - I" },
    ],
    "Computer Science": [
      { studentId: 1,  name: "Ali Ahmed",    marks: 87, total: 100, component: "MidTerm - I" },
      { studentId: 2,  name: "Sara Khan",    marks: 94, total: 100, component: "MidTerm - I" },
      { studentId: 3,  name: "Bilal Raza",   marks: 72, total: 100, component: "MidTerm - I" },
      { studentId: 4,  name: "Hina Malik",   marks: 61, total: 100, component: "MidTerm - I" },
      { studentId: 5,  name: "Usman Tariq",  marks: 79, total: 100, component: "MidTerm - I" },
      { studentId: 6,  name: "Ayesha Noor",  marks: 83, total: 100, component: "MidTerm - I" },
      { studentId: 7,  name: "Hamza Sheikh", marks: 67, total: 100, component: "MidTerm - I" },
      { studentId: 8,  name: "Zara Butt",    marks: 76, total: 100, component: "MidTerm - I" },
    ],
  },
  "10-B": {
    "Mathematics": [
      { studentId: 9,  name: "Kamran Iqbal",  marks: 74, total: 100, component: "MidTerm - I" },
      { studentId: 10, name: "Fatima Siddiq", marks: 89, total: 100, component: "MidTerm - I" },
      { studentId: 11, name: "Omar Cheema",   marks: 63, total: 100, component: "MidTerm - I" },
      { studentId: 12, name: "Maryam Zahid",  marks: 95, total: 100, component: "MidTerm - I" },
      { studentId: 13, name: "Saad Farooq",   marks: 58, total: 100, component: "MidTerm - I" },
      { studentId: 14, name: "Nimra Javed",   marks: 82, total: 100, component: "MidTerm - I" },
    ],
  },
  "9-A": {
    "Computer Science": [
      { studentId: 15, name: "Talha Nawaz",   marks: 77, total: 100, component: "MidTerm - I" },
      { studentId: 16, name: "Sana Akram",    marks: 91, total: 100, component: "MidTerm - I" },
      { studentId: 17, name: "Zain ul Abdin", marks: 68, total: 100, component: "MidTerm - I" },
      { studentId: 18, name: "Maham Ashraf",  marks: 84, total: 100, component: "MidTerm - I" },
      { studentId: 19, name: "Faisal Riaz",   marks: 72, total: 100, component: "MidTerm - I" },
      { studentId: 20, name: "Rabia Qamar",   marks: 88, total: 100, component: "MidTerm - I" },
    ],
  },
};

// ================= UPLOADED MATERIALS =================
// All fileUrl values are direct PDF links — browsers can embed them in <iframe> natively.
// downloadUrl is the same link (browser will prompt save-as for PDFs).
// Students see and download exactly what the teacher has uploaded.
export const teacherMaterials = [
  {
    id: 1,
    title: "Chapter 1 - Algebra Foundations",
    subject: "Mathematics",
    class: "10-A",
    date: "2026-03-25",
    type: "PDF",
    size: "1.2 MB",
    fileUrl: "https://pbte.edu.pk/text%20books/dae/math_123/Chapter_01.pdf",
    downloadUrl: "https://pbte.edu.pk/text%20books/dae/math_123/Chapter_01.pdf",
  },
  {
    id: 2,
    title: "OOP Concepts - Lecture Notes",
    subject: "Computer Science",
    class: "10-A",
    date: "2026-03-22",
    type: "PDF",
    size: "3.4 MB",
    fileUrl: "https://mrcet.com/downloads/digital_notes/HS/OOP_10122018.pdf",
    downloadUrl: "https://mrcet.com/downloads/digital_notes/HS/OOP_10122018.pdf",
  },
  {
    id: 3,
    title: "Trigonometry Practice Sheet",
    subject: "Mathematics",
    class: "10-B",
    date: "2026-03-20",
    type: "PDF",
    size: "0.8 MB",
    fileUrl: "https://www.cimt.org.uk/projects/mepres/book9/bk9_15.pdf",
    downloadUrl: "https://www.cimt.org.uk/projects/mepres/book9/bk9_15.pdf",
  },
  {
    id: 4,
    title: "Introduction to Databases",
    subject: "Computer Science",
    class: "9-A",
    date: "2026-03-18",
    type: "PDF",
    size: "2.5 MB",
    fileUrl: "https://dbdmg.polito.it/dbdmg_web/wp-content/uploads/2024/03/01.-Introduction-to-databases.pdf",
    downloadUrl: "https://dbdmg.polito.it/dbdmg_web/wp-content/uploads/2024/03/01.-Introduction-to-databases.pdf",
  },
  {
    id: 5,
    title: "Algebra Equations & Inequalities - Practice",
    subject: "Mathematics",
    class: "9-A",
    date: "2026-03-15",
    type: "PDF",
    size: "0.6 MB",
    fileUrl: "https://vrkmathsaid.weebly.com/uploads/5/1/2/1/5121151/algebraequationsinequalitiesquestionsandsolutions_final.pdf",
    downloadUrl: "https://vrkmathsaid.weebly.com/uploads/5/1/2/1/5121151/algebraequationsinequalitiesquestionsandsolutions_final.pdf",
  },
  {
    id: 6,
    title: "Python Programming - Complete Notes",
    subject: "Computer Science",
    class: "10-B",
    date: "2026-03-12",
    type: "PDF",
    size: "4.1 MB",
    fileUrl: "https://mrcet.com/downloads/digital_notes/CSE/III%20Year/PYTHON%20PROGRAMMING%20NOTES.pdf",
    downloadUrl: "https://mrcet.com/downloads/digital_notes/CSE/III%20Year/PYTHON%20PROGRAMMING%20NOTES.pdf",
  },
];

// ================= ANNOUNCEMENTS =================
export const teacherAnnouncements = [
  { id: 1, title: "MidTerm Exam Schedule Released",  description: "MidTerm II will begin on April 5. Please ensure all topics are covered.", tag: "urgent", date: "2026-03-28", target: "All Classes" },
  { id: 2, title: "Lab Assignment Due — 10A & 10B",  description: "OOP assignment submission deadline is March 30. Late submissions won't be accepted.", tag: "event", date: "2026-03-26", target: "10-A, 10-B" },
  { id: 3, title: "Extra Class on Saturday",         description: "An extra revision class for Math is scheduled this Saturday at 9 AM.", tag: "info",  date: "2026-03-24", target: "10-A" },
];

// ================= STATS SUMMARY =================
export const teacherStats = {
  totalStudents: 20,
  classesToday: 3,
  materialsUploaded: 6,
  averageAttendance: 88,
  averageMarks: 79,
};

// ================= ACADEMIC CALENDAR =================
export const teacherCalendar = [
  { date: "2026-04-01", event: "Final Exams Begin" },
  { date: "2026-04-05", event: "MidTerm II — Mathematics (10-A & 10-B)" },
  { date: "2026-04-08", event: "OOP Lab Assignment Deadline" },
  { date: "2026-04-13", event: "Award Ceremony — Deans Hall" },
  { date: "2026-04-20", event: "Spring Break Starts" },
  { date: "2026-05-01", event: "Labour Day Holiday" },
  { date: "2026-05-10", event: "Staff Development Day" },
  { date: "2026-05-18", event: "Parent-Teacher Meeting" },
  { date: "2026-06-01", event: "Annual Sports Day" },
  { date: "2026-06-15", event: "End of Term — Result Day" },
];