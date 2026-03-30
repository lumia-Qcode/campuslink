import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { studentData } from "../../data/mockData";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div>
      <Navbar />

      <h1>Welcome {studentData.name}</h1>

      {/* MARKS */}
      <h3>Marks</h3>
      {studentData.marks.map((m, index) => (
        <div
          key={index}
          onClick={() => navigate("/marks")}
          style={{ border: "1px solid black", margin: "10px", padding: "10px", cursor: "pointer" }}
        >
          <h4>{m.subject}</h4>
          <p>Grade: {m.grade}</p>
        </div>
      ))}

      {/* ATTENDANCE */}
      <h3>Attendance</h3>
      {studentData.attendance.map((a, index) => {
        const percentage = ((a.present / a.total) * 100).toFixed(1);

        return (
          <div
            key={index}
            onClick={() => navigate("/attendance")}
            style={{ border: "1px solid black", margin: "10px", padding: "10px", cursor: "pointer" }}
          >
            <h4>{a.subject}</h4>
            <p>{percentage}% Attendance</p>
          </div>
        );
      })}
    </div>
  );
}

export default Dashboard;