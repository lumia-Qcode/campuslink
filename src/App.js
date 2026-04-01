import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import StudentDashboard from "./pages/student/Dashboard";
import { isAuthenticated, getUserRole } from "./services/auth";
import Signup from "./components/Signup";
import Announcements from "./pages/student/Announcements";
import Attendance from "./pages/student/Attendance";
import Marks from "./pages/student/Marks";
import Timetable from "./pages/student/Timetable";
import Fees from "./pages/student/Fees";
import Activities from "./pages/student/Activities";
import Materials from "./pages/student/Materials";
import Calendar from "./pages/student/Calendar";
import './index.css';

const ProtectedRoute = ({ children, role }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/" />;
  }

  if (role && getUserRole() !== role) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/student/dashboard"
           element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/student/announcements"
           element={
            <ProtectedRoute role="student">
              <Announcements />
            </ProtectedRoute>
          }
        />
        <Route path="/student/attendance"
           element={
            <ProtectedRoute role="student">
              <Attendance />
            </ProtectedRoute>
          }
        />
        <Route path="/student/marks"
           element={
            <ProtectedRoute role="student">
              <Marks />
            </ProtectedRoute>
          }
        />
        <Route path="/student/timetable"
           element={
            <ProtectedRoute role="student">
              <Timetable />
            </ProtectedRoute>
          }
        />
        <Route path="/student/fees"
           element={
            <ProtectedRoute role="student">
              <Fees />
            </ProtectedRoute>
          }
        />
        <Route path="/student/activities"
           element={
            <ProtectedRoute role="student">
              <Activities />
            </ProtectedRoute>
          }
        />
        <Route path="/student/materials"
           element={
            <ProtectedRoute role="student">
              <Materials />
            </ProtectedRoute>
          }
        />
        <Route path="/student/calendar"
           element={
            <ProtectedRoute role="student">
              <Calendar />
            </ProtectedRoute>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;