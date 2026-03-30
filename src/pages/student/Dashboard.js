import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { studentData } from "../../data/mockData";

function StudentDashboard() {
  const navigate = useNavigate();

  return (
    <div>
      <Navbar />

      <h1>Welcome {studentData.name} 🎓</h1>

      <h3>Your Marks</h3>

      {studentData.marks.map((m, index) => (
        <div
          key={index}
          onClick={() => navigate("/marks")}
          style={{
            border: "1px solid black",
            padding: "10px",
            margin: "10px",
            cursor: "pointer"
          }}
        >
          <h4>{m.subject}</h4>
          <p>Grade: {m.grade}</p>
          <p>{m.remarks}</p>
        </div>
      ))}
    </div>
  );
}

export default StudentDashboard;