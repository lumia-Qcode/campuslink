import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import { isAuthenticated, getUserRole } from "./services/auth";

// Student Pages
import StudentDashboard from "./pages/student/Dashboard";
import Announcements from "./pages/student/Announcements";
import Attendance from "./pages/student/Attendance";
import Marks from "./pages/student/Marks";
import Timetable from "./pages/student/Timetable";
import Fees from "./pages/student/Fees";
import Activities from "./pages/student/Activities";
import Materials from "./pages/student/Materials";
import Calendar from "./pages/student/Calendar";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminTeachers from "./pages/admin/AdminTeachers";
import AdminSections from "./pages/admin/AdminSections";
import AdminFees from "./pages/admin/AdminFees";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminTimetable from "./pages/admin/AdminTimetable";
import AdminFinancialAid from "./pages/admin/AdminFinancialAid";

// Teacher Pages
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherAttendance from "./pages/teacher/TeacherAttendance";
import TeacherMarks from "./pages/teacher/TeacherMarks";
import TeacherTimetable from "./pages/teacher/TeacherTimeTable";
import TeacherMaterials from "./pages/teacher/TeacherMaterials";
import TeacherAnnouncements from "./pages/teacher/TeacherAnnouncement";
import TeacherStudents from "./pages/teacher/TeacherStudents";
import TeacherCalendar from "./pages/teacher/TeacherCalendar";

import './index.css';

const ProtectedRoute = ({ children, role }) => {
  if (!isAuthenticated()) return <Navigate to="/" />;
  if (role && getUserRole() !== role) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ─── STUDENT ROUTES ─── */}
        <Route path="/student/dashboard"     element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/announcements" element={<ProtectedRoute role="student"><Announcements /></ProtectedRoute>} />
        <Route path="/student/attendance"    element={<ProtectedRoute role="student"><Attendance /></ProtectedRoute>} />
        <Route path="/student/marks"         element={<ProtectedRoute role="student"><Marks /></ProtectedRoute>} />
        <Route path="/student/timetable"     element={<ProtectedRoute role="student"><Timetable /></ProtectedRoute>} />
        <Route path="/student/fees"          element={<ProtectedRoute role="student"><Fees /></ProtectedRoute>} />
        <Route path="/student/activities"    element={<ProtectedRoute role="student"><Activities /></ProtectedRoute>} />
        <Route path="/student/materials"     element={<ProtectedRoute role="student"><Materials /></ProtectedRoute>} />
        <Route path="/student/calendar"      element={<ProtectedRoute role="student"><Calendar /></ProtectedRoute>} />

        {/* ─── ADMIN ROUTES ─── */}
        <Route path="/admin/dashboard"     element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/students"      element={<ProtectedRoute role="admin"><AdminStudents /></ProtectedRoute>} />
        <Route path="/admin/teachers"      element={<ProtectedRoute role="admin"><AdminTeachers /></ProtectedRoute>} />
        <Route path="/admin/sections"      element={<ProtectedRoute role="admin"><AdminSections /></ProtectedRoute>} />
        <Route path="/admin/fees"          element={<ProtectedRoute role="admin"><AdminFees /></ProtectedRoute>} />
        <Route path="/admin/announcements" element={<ProtectedRoute role="admin"><AdminAnnouncements /></ProtectedRoute>} />
        <Route path="/admin/timetable"     element={<ProtectedRoute role="admin"><AdminTimetable /></ProtectedRoute>} />
        <Route path="/admin/financial-aid" element={<ProtectedRoute role="admin"><AdminFinancialAid /></ProtectedRoute>} />

        {/* ─── TEACHER ROUTES ─── */}
        <Route path="/teacher/dashboard"     element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>} />
        <Route path="/teacher/attendance"    element={<ProtectedRoute role="teacher"><TeacherAttendance /></ProtectedRoute>} />
        <Route path="/teacher/marks"         element={<ProtectedRoute role="teacher"><TeacherMarks /></ProtectedRoute>} />
        <Route path="/teacher/timetable"     element={<ProtectedRoute role="teacher"><TeacherTimetable /></ProtectedRoute>} />
        <Route path="/teacher/materials"     element={<ProtectedRoute role="teacher"><TeacherMaterials /></ProtectedRoute>} />
        <Route path="/teacher/announcements" element={<ProtectedRoute role="teacher"><TeacherAnnouncements /></ProtectedRoute>} />
        <Route path="/teacher/students"      element={<ProtectedRoute role="teacher"><TeacherStudents /></ProtectedRoute>} />
        <Route path="/teacher/calendar"      element={<ProtectedRoute role="teacher"><TeacherCalendar /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;