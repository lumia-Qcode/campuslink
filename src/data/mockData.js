// ================= CLASSES & SECTIONS =================
export const classes = Array.from({ length: 10 }, (_, i) => i + 1);
export const sections = ["A","B","C","D","E","F","G","H","I","J","K"];

// ================= STUDENTS =================
export const students = [
  { id: 1, name: "Ali Ahmed", class: 10, section: "A", rollNo: 12 },
  { id: 2, name: "Sara Khan", class: 10, section: "A", rollNo: 5 },
  { id: 3, name: "Usman Ali", class: 9, section: "B", rollNo: 18 },
  { id: 4, name: "Hina Malik", class: 8, section: "C", rollNo: 9 }
];

export const announcements = [
  {
    id: 1,
    title: "Final Exam Postponed",
    description: "Exams postponed till 1st April due to online classes.",
    tag: "urgent",
  },
  {
    id: 2,
    title: "Award Ceremony",
    description: "Dear Students, the award ceremony for class 8 will be held on 13th April in Deans Hall.",
    tag: "event",
  },
  {
    id: 3,
    title: "Library Extended Hours",
    description: "The library will be open until 7 PM during exam preparation week.",
    tag: "info",
  },
];

export const marks = [
  {
    studentId: 1,
    subjects: [
      { name: "English", component: "MidTerm - I", marks: 95, total: 100 },
      { name: "Maths", component: "MidTerm - I", marks: 78, total: 100 },
      { name: "Computer", component: "MidTerm - I", marks: 87, total: 100 },
      { name: "Science", component: "MidTerm - I", marks: 91, total: 100 },
    ],
  },
];

export const attendance = [
  {
    studentId: 1,
    overall: 85,
    records: [
      { date: "2026-03-28", status: "Present" },
      { date: "2026-03-27", status: "Present" },
      { date: "2026-03-26", status: "Absent" },
      { date: "2026-03-25", status: "Present" },
      { date: "2026-03-24", status: "Present" },
    ],
    subjects: [
      { name: "Computer", percentage: 92, color: "#4f8ef7" },
      { name: "English", percentage: 72, color: "#9b6dff" },
      { name: "Maths", percentage: 85, color: "#2db87b" },
      { name: "Science", percentage: 98, color: "#f5c842" },
    ],
  },
];

export const fees = [
  {
    studentId: 1,
    total: 25000,
    paid: 25000,
    remaining: 0,
    challan: "Spring 2026",
    status: "Paid",
  },
];

export const activities = [
  { activity: "Cricket Team", participation: "Active Member" },
  { activity: "Science Club", participation: "Vice President" },
  { activity: "Art Society", participation: "Member" },
];

export const materials = [
  { title: "Chapter 5 - Algebra Notes", subject: "Maths", date: "2026-03-20" },
  { title: "Essay Writing Guide", subject: "English", date: "2026-03-18" },
  { title: "Computer Science - OOP Basics", subject: "Computer", date: "2026-03-15" },
];

export const calendar = [
  { date: "2026-04-01", event: "Final Exams Begin" },
  { date: "2026-04-13", event: "Award Ceremony — Deans Hall" },
  { date: "2026-04-20", event: "Spring Break Starts" },
  { date: "2026-05-01", event: "Labour Day Holiday" },
];

// src/data/mockData.js

export const timetable = [
  {
    class: 10,
    section: "A",
    schedule: [
      { day: "Monday", time: "8:00 - 8:45", subject: "Mathematics", teacher: "Ms. Nadia" },
      { day: "Monday", time: "8:45 - 9:30", subject: "English", teacher: "Mr. Khalid" },
      { day: "Monday", time: "9:30 - 10:15", subject: "Science", teacher: "Ms. Aisha" },
      { day: "Monday", time: "10:30 - 11:15", subject: "Computer", teacher: "Mr. Farhan" },
      { day: "Monday", time: "11:15 - 12:00", subject: "Islamiyat", teacher: "Ms. Sana" },

      { day: "Tuesday", time: "8:00 - 8:45", subject: "English", teacher: "Mr. Khalid" },
      { day: "Tuesday", time: "8:45 - 9:30", subject: "Computer", teacher: "Mr. Farhan" },
      { day: "Tuesday", time: "9:30 - 10:15", subject: "Mathematics", teacher: "Ms. Nadia" },
      { day: "Tuesday", time: "10:30 - 11:15", subject: "Science", teacher: "Ms. Aisha" },
      { day: "Tuesday", time: "11:15 - 12:00", subject: "Urdu", teacher: "Ms. Zara" },

      { day: "Wednesday", time: "8:00 - 8:45", subject: "Science", teacher: "Ms. Aisha" },
      { day: "Wednesday", time: "8:45 - 9:30", subject: "Urdu", teacher: "Ms. Zara" },
      { day: "Wednesday", time: "9:30 - 10:15", subject: "English", teacher: "Mr. Khalid" },
      { day: "Wednesday", time: "10:30 - 11:15", subject: "Mathematics", teacher: "Ms. Nadia" },
      { day: "Wednesday", time: "11:15 - 12:00", subject: "Computer", teacher: "Mr. Farhan" },

      { day: "Thursday", time: "8:00 - 8:45", subject: "Science", teacher: "Ms. Aisha" },
      { day: "Thursday", time: "8:45 - 9:30", subject: "Urdu", teacher: "Ms. Zara" },
      { day: "Thursday", time: "9:30 - 10:15", subject: "English", teacher: "Mr. Khalid" },
      { day: "Thursday", time: "10:30 - 11:15", subject: "Mathematics", teacher: "Ms. Nadia" },
      { day: "Thursday", time: "11:15 - 12:00", subject: "Computer", teacher: "Mr. Farhan" },
    ],
  },
];

export const progress = [
  { category: "Behavior", rating: "Excellent", level: "pb-excellent" },
  { category: "Academics", rating: "Satisfactory", level: "pb-satisfactory" },
  { category: "Uniform", rating: "Good", level: "pb-good" },
  { category: "Arts", rating: "Unsatisfied", level: "pb-unsatisfied" },
];