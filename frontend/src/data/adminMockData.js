// ================= ADMIN MOCK DATA =================

// ── CLASS DEFINITIONS ──
export const CLASS_LEVELS = [
  { id: "playgroup", label: "Play Group", short: "PG" },
  { id: "nursery",   label: "Nursery",    short: "NRS" },
  { id: "prenursery",label: "Pre-Nursery",short: "PRE" },
  { id: "1",  label: "Class 1",  short: "1" },
  { id: "2",  label: "Class 2",  short: "2" },
  { id: "3",  label: "Class 3",  short: "3" },
  { id: "4",  label: "Class 4",  short: "4" },
  { id: "5",  label: "Class 5",  short: "5" },
  { id: "6",  label: "Class 6",  short: "6" },
  { id: "7",  label: "Class 7",  short: "7" },
  { id: "8",  label: "Class 8",  short: "8" },
  { id: "9",  label: "Class 9",  short: "9" },
  { id: "X",  label: "Class X",  short: "X" },
];

// ── SUBJECTS BY CLASS GROUP ──
export const SUBJECTS_BY_GROUP = {
  early: ["English", "Urdu", "Mathematics", "Arts & Crafts", "Physical Education", "Moral Studies"],
  primary: ["English", "Urdu", "Mathematics", "Science", "Social Studies", "Islamiyat"],
  secondary: ["English", "Urdu", "Mathematics", "Science", "Social Studies", "Islamiyat", "Computer Science", "Pakistan Studies"],
};

export const getSubjectsForClass = (classId) => {
  if (["playgroup", "nursery", "prenursery"].includes(classId)) return SUBJECTS_BY_GROUP.early;
  if (["1","2","3","4","5","6"].includes(classId)) return SUBJECTS_BY_GROUP.primary;
  return SUBJECTS_BY_GROUP.secondary;
};

// ── SECTIONS (mock data) ──
export const mockSections = [
  { id: "s1",  classId: "X",  section: "A", subject: "Mathematics",     teacherId: "T-001", studentCount: 32 },
  { id: "s2",  classId: "X",  section: "B", subject: "Mathematics",     teacherId: "T-001", studentCount: 28 },
  { id: "s3",  classId: "X",  section: "A", subject: "English",         teacherId: "T-002", studentCount: 32 },
  { id: "s4",  classId: "9",  section: "A", subject: "Science",         teacherId: "T-003", studentCount: 30 },
  { id: "s5",  classId: "9",  section: "B", subject: "Urdu",            teacherId: "T-004", studentCount: 27 },
  { id: "s6",  classId: "8",  section: "A", subject: "Mathematics",     teacherId: "T-001", studentCount: 35 },
  { id: "s7",  classId: "6",  section: "A", subject: "Science",         teacherId: "T-003", studentCount: 31 },
  { id: "s8",  classId: "6",  section: "J", subject: "Biology",         teacherId: "T-005", studentCount: 22 },
  { id: "s9",  classId: "3",  section: "A", subject: "English",         teacherId: "T-002", studentCount: 29 },
  { id: "s10", classId: "1",  section: "A", subject: "Mathematics",     teacherId: "T-004", studentCount: 33 },
  { id: "s11", classId: "nursery", section: "A", subject: "English",    teacherId: "T-006", studentCount: 18 },
  { id: "s12", classId: "playgroup", section: "A", subject: "Arts & Crafts", teacherId: "T-006", studentCount: 15 },
];

// ── TEACHERS (mock data) ──
export const mockTeachers = [
  {
    id: "T-001", name: "Ms. Nadia Hussain", email: "teacher@test.com",
    cnic: "35202-1234567-8", phone: "0300-1234567", dob: "1985-03-15",
    address: "45 Model Town, Lahore", qualification: "M.Sc Mathematics",
    department: "Mathematics", joinDate: "2019-08-01", gender: "Female",
    assignedSections: ["s1","s2","s6"],
  },
  {
    id: "T-002", name: "Mr. Kamran Baig", email: "kamran.baig@school.edu",
    cnic: "35202-9876543-2", phone: "0321-9876543", dob: "1980-07-22",
    address: "12 Gulberg III, Lahore", qualification: "M.A English Literature",
    department: "Languages", joinDate: "2017-03-15", gender: "Male",
    assignedSections: ["s3","s9"],
  },
  {
    id: "T-003", name: "Dr. Sana Mirza", email: "sana.mirza@school.edu",
    cnic: "35202-5678901-3", phone: "0333-5678901", dob: "1988-11-05",
    address: "8 DHA Phase 5, Lahore", qualification: "PhD Biology",
    department: "Science", joinDate: "2020-09-01", gender: "Female",
    assignedSections: ["s4","s7"],
  },
  {
    id: "T-004", name: "Mr. Tariq Mehmood", email: "tariq.m@school.edu",
    cnic: "35202-3456789-0", phone: "0311-3456789", dob: "1978-01-30",
    address: "67 Johar Town, Lahore", qualification: "B.Ed, M.A Urdu",
    department: "Languages", joinDate: "2015-01-10", gender: "Male",
    assignedSections: ["s5","s10"],
  },
  {
    id: "T-005", name: "Ms. Rabia Shahid", email: "rabia.s@school.edu",
    cnic: "35202-2345678-9", phone: "0345-2345678", dob: "1992-06-18",
    address: "34 Faisal Town, Lahore", qualification: "M.Sc Botany",
    department: "Science", joinDate: "2022-02-15", gender: "Female",
    assignedSections: ["s8"],
  },
  {
    id: "T-006", name: "Ms. Hina Qureshi", email: "hina.q@school.edu",
    cnic: "35202-8765432-1", phone: "0303-8765432", dob: "1990-09-12",
    address: "23 Allama Iqbal Town, Lahore", qualification: "B.Ed Early Childhood",
    department: "Early Education", joinDate: "2021-04-01", gender: "Female",
    assignedSections: ["s11","s12"],
  },
];

// ── STUDENTS (mock data) ──
export const mockStudents = [
  {
    id: "STU-001", name: "Ali Ahmed", email: "ali.ahmed@student.edu",
    cnic: "35202-0000001-1", dob: "2010-04-15", gender: "Male",
    phone: "0300-0000001", address: "12 Model Town, Lahore",
    fatherName: "Ahmed Khan", fatherCnic: "35202-1111111-1", fatherPhone: "0300-1111111", fatherOccupation: "Engineer",
    motherName: "Sadia Ahmed", motherPhone: "0321-1111111",
    classId: "X", section: "A", rollNo: 12, admissionDate: "2020-04-01",
    feeStatus: "Paid",
  },
  {
    id: "STU-002", name: "Sara Khan", email: "sara.khan@student.edu",
    cnic: "35202-0000002-2", dob: "2010-07-22", gender: "Female",
    phone: "0300-0000002", address: "45 Gulberg, Lahore",
    fatherName: "Imran Khan", fatherCnic: "35202-2222222-2", fatherPhone: "0300-2222222", fatherOccupation: "Doctor",
    motherName: "Nadia Khan", motherPhone: "0321-2222222",
    classId: "X", section: "A", rollNo: 5, admissionDate: "2020-04-01",
    feeStatus: "Paid",
  },
  {
    id: "STU-003", name: "Bilal Raza", email: "bilal.raza@student.edu",
    cnic: "35202-0000003-3", dob: "2011-01-10", gender: "Male",
    phone: "0300-0000003", address: "78 DHA, Lahore",
    fatherName: "Raza Hussain", fatherCnic: "35202-3333333-3", fatherPhone: "0300-3333333", fatherOccupation: "Businessman",
    motherName: "Farah Raza", motherPhone: "0321-3333333",
    classId: "X", section: "B", rollNo: 7, admissionDate: "2019-04-01",
    feeStatus: "Pending",
  },
  {
    id: "STU-004", name: "Hina Malik", email: "hina.malik@student.edu",
    cnic: "35202-0000004-4", dob: "2011-09-05", gender: "Female",
    phone: "0300-0000004", address: "23 Johar Town, Lahore",
    fatherName: "Saleem Malik", fatherCnic: "35202-4444444-4", fatherPhone: "0300-4444444", fatherOccupation: "Teacher",
    motherName: "Asma Malik", motherPhone: "0321-4444444",
    classId: "X", section: "B", rollNo: 9, admissionDate: "2019-04-01",
    feeStatus: "Paid",
  },
  {
    id: "STU-005", name: "Usman Tariq", email: "usman.t@student.edu",
    cnic: "35202-0000005-5", dob: "2011-03-28", gender: "Male",
    phone: "0300-0000005", address: "56 Faisal Town, Lahore",
    fatherName: "Tariq Usman", fatherCnic: "35202-5555555-5", fatherPhone: "0300-5555555", fatherOccupation: "Accountant",
    motherName: "Rukhsana Tariq", motherPhone: "0321-5555555",
    classId: "9", section: "A", rollNo: 15, admissionDate: "2021-04-01",
    feeStatus: "Overdue",
  },
  {
    id: "STU-006", name: "Ayesha Noor", email: "ayesha.n@student.edu",
    cnic: "35202-0000006-6", dob: "2012-06-17", gender: "Female",
    phone: "0300-0000006", address: "34 Allama Iqbal Town, Lahore",
    fatherName: "Noor Ahmed", fatherCnic: "35202-6666666-6", fatherPhone: "0300-6666666", fatherOccupation: "Lawyer",
    motherName: "Sobia Noor", motherPhone: "0321-6666666",
    classId: "9", section: "B", rollNo: 3, admissionDate: "2021-04-01",
    feeStatus: "Paid",
  },
  {
    id: "STU-007", name: "Hamza Sheikh", email: "hamza.s@student.edu",
    cnic: "35202-0000007-7", dob: "2012-11-30", gender: "Male",
    phone: "0300-0000007", address: "89 Garden Town, Lahore",
    fatherName: "Iqbal Sheikh", fatherCnic: "35202-7777777-7", fatherPhone: "0300-7777777", fatherOccupation: "Pilot",
    motherName: "Samina Sheikh", motherPhone: "0321-7777777",
    classId: "8", section: "A", rollNo: 21, admissionDate: "2022-04-01",
    feeStatus: "Paid",
  },
  {
    id: "STU-008", name: "Zara Butt", email: "zara.b@student.edu",
    cnic: "35202-0000008-8", dob: "2013-02-14", gender: "Female",
    phone: "0300-0000008", address: "67 Wapda Town, Lahore",
    fatherName: "Aslam Butt", fatherCnic: "35202-8888888-8", fatherPhone: "0300-8888888", fatherOccupation: "Banker",
    motherName: "Tahira Butt", motherPhone: "0321-8888888",
    classId: "6", section: "A", rollNo: 18, admissionDate: "2023-04-01",
    feeStatus: "Pending",
  },
  {
    id: "STU-009", name: "Kamran Iqbal", email: "kamran.i@student.edu",
    cnic: "35202-0000009-9", dob: "2013-08-25", gender: "Male",
    phone: "0300-0000009", address: "12 Cavalry Ground, Lahore",
    fatherName: "Iqbal Hussain", fatherCnic: "35202-9999999-9", fatherPhone: "0300-9999999", fatherOccupation: "Army Officer",
    motherName: "Rabia Iqbal", motherPhone: "0321-9999999",
    classId: "6", section: "J", rollNo: 4, admissionDate: "2023-04-01",
    feeStatus: "Paid",
  },
  {
    id: "STU-010", name: "Fatima Siddiq", email: "fatima.s@student.edu",
    cnic: "35202-0000010-0", dob: "2014-05-08", gender: "Female",
    phone: "0300-0000010", address: "45 Bahria Town, Lahore",
    fatherName: "Siddiq Ahmed", fatherCnic: "35202-1010101-1", fatherPhone: "0300-1010101", fatherOccupation: "Professor",
    motherName: "Maryam Siddiq", motherPhone: "0321-1010101",
    classId: "3", section: "A", rollNo: 11, admissionDate: "2024-04-01",
    feeStatus: "Paid",
  },
  {
    id: "STU-011", name: "Omar Cheema", email: "omar.c@student.edu",
    cnic: "35202-0000011-1", dob: "2014-12-20", gender: "Male",
    phone: "0300-0000011", address: "23 Valencia Town, Lahore",
    fatherName: "Cheema Sahib", fatherCnic: "35202-1111000-1", fatherPhone: "0300-1111000", fatherOccupation: "Farmer",
    motherName: "Kiran Cheema", motherPhone: "0321-1111000",
    classId: "1", section: "A", rollNo: 8, admissionDate: "2025-04-01",
    feeStatus: "Overdue",
  },
  {
    id: "STU-012", name: "Maryam Zahid", email: "maryam.z@student.edu",
    cnic: "35202-0000012-2", dob: "2020-03-11", gender: "Female",
    phone: "0300-0000012", address: "78 Lake City, Lahore",
    fatherName: "Zahid Mahmood", fatherCnic: "35202-1212121-2", fatherPhone: "0300-1212121", fatherOccupation: "Shopkeeper",
    motherName: "Nazia Zahid", motherPhone: "0321-1212121",
    classId: "nursery", section: "A", rollNo: 2, admissionDate: "2025-09-01",
    feeStatus: "Paid",
  },
];

// ── FEE RECORDS ──
export const mockFeeRecords = [
  { id: "F-001", studentId: "STU-001", studentName: "Ali Ahmed",    classId: "X",  section: "A", month: "April 2026",   amount: 8500, status: "Paid",    paidDate: "2026-04-02", dueDate: "2026-04-10" },
  { id: "F-002", studentId: "STU-002", studentName: "Sara Khan",    classId: "X",  section: "A", month: "April 2026",   amount: 8500, status: "Paid",    paidDate: "2026-04-05", dueDate: "2026-04-10" },
  { id: "F-003", studentId: "STU-003", studentName: "Bilal Raza",   classId: "X",  section: "B", month: "April 2026",   amount: 8500, status: "Pending", paidDate: null,         dueDate: "2026-04-10" },
  { id: "F-004", studentId: "STU-004", studentName: "Hina Malik",   classId: "X",  section: "B", month: "April 2026",   amount: 8500, status: "Paid",    paidDate: "2026-04-01", dueDate: "2026-04-10" },
  { id: "F-005", studentId: "STU-005", studentName: "Usman Tariq",  classId: "9",  section: "A", month: "April 2026",   amount: 7500, status: "Overdue", paidDate: null,         dueDate: "2026-04-10" },
  { id: "F-006", studentId: "STU-006", studentName: "Ayesha Noor",  classId: "9",  section: "B", month: "April 2026",   amount: 7500, status: "Paid",    paidDate: "2026-04-03", dueDate: "2026-04-10" },
  { id: "F-007", studentId: "STU-007", studentName: "Hamza Sheikh", classId: "8",  section: "A", month: "April 2026",   amount: 7000, status: "Paid",    paidDate: "2026-04-07", dueDate: "2026-04-10" },
  { id: "F-008", studentId: "STU-008", studentName: "Zara Butt",    classId: "6",  section: "A", month: "April 2026",   amount: 6500, status: "Pending", paidDate: null,         dueDate: "2026-04-10" },
  { id: "F-009", studentId: "STU-009", studentName: "Kamran Iqbal", classId: "6",  section: "J", month: "April 2026",   amount: 6500, status: "Paid",    paidDate: "2026-04-04", dueDate: "2026-04-10" },
  { id: "F-010", studentId: "STU-010", studentName: "Fatima Siddiq",classId: "3",  section: "A", month: "April 2026",   amount: 5500, status: "Paid",    paidDate: "2026-04-06", dueDate: "2026-04-10" },
  { id: "F-011", studentId: "STU-011", studentName: "Omar Cheema",  classId: "1",  section: "A", month: "April 2026",   amount: 5000, status: "Overdue", paidDate: null,         dueDate: "2026-04-10" },
  { id: "F-012", studentId: "STU-012", studentName: "Maryam Zahid", classId: "nursery", section: "A", month: "April 2026", amount: 4500, status: "Paid", paidDate: "2026-04-01", dueDate: "2026-04-10" },
  // March records
  { id: "F-013", studentId: "STU-001", studentName: "Ali Ahmed",    classId: "X",  section: "A", month: "March 2026",   amount: 8500, status: "Paid",    paidDate: "2026-03-03", dueDate: "2026-03-10" },
  { id: "F-014", studentId: "STU-003", studentName: "Bilal Raza",   classId: "X",  section: "B", month: "March 2026",   amount: 8500, status: "Paid",    paidDate: "2026-03-08", dueDate: "2026-03-10" },
  { id: "F-015", studentId: "STU-005", studentName: "Usman Tariq",  classId: "9",  section: "A", month: "March 2026",   amount: 7500, status: "Paid",    paidDate: "2026-03-09", dueDate: "2026-03-10" },
];

export const getClassLabel = (classId) => {
  const cl = CLASS_LEVELS.find(c => c.id === classId);
  return cl ? cl.label : classId;
};

export const getTeacherById = (id) => mockTeachers.find(t => t.id === id);
export const getTeacherName = (id) => {
  const t = mockTeachers.find(t => t.id === id);
  return t ? t.name : "Unassigned";
};
