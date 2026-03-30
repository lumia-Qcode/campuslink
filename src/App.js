import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./components/Login";
import Signup from "./components/Signup";
import Navbar from "./components/Navbar";
import StudentDashboard from "./pages/student/Dashboard";
import MarksPage from "./pages/student/Marks";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/navbar" element={<Navbar />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/marks" element={<MarksPage />} />
      </Routes>
    </Router>
  );
}

export default App;