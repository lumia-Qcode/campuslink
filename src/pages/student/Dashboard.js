import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { studentData } from "../../data/mockData";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div>
      <Navbar />

      <h1>Welcome {studentData.name} 🎓</h1>
      <h2>Marks</h2>
      {studentData.marks.map((m, index) => (
        <div
          key={index}
          onClick={() => navigate("/marks")}
          style={{
            border: "1px solid black",
            margin: "10px",
            padding: "10px",
            cursor: "pointer",
            borderRadius: "8px"
          }}
        >
          <h4>{m.subject}</h4>
          <p>Grade: {m.grade}</p>
          <p>{m.remarks}</p>
        </div>
      ))}

      <h2>Attendance</h2>
      {studentData.attendance.map((a, index) => {
        const percentage = ((a.present / a.total) * 100).toFixed(1);

        return (
          <div
            key={index}
            onClick={() => navigate("/attendance")}
            style={{
              border: "1px solid black",
              margin: "10px",
              padding: "10px",
              cursor: "pointer",
              borderRadius: "8px"
            }}
          >
            <h4>{a.subject}</h4>
            <p style={{ color: percentage < 75 ? "red" : "green" }}>
              {percentage}% Attendance
            </p>
            <div style={{ width: "100%", background: "#ddd", height: "8px" }}>
              <div
                style={{
                  width: `${percentage}%`,
                  background: percentage < 75 ? "red" : "green",
                  height: "8px"
                }}
              />
            </div>
          </div>
        );
      })}
      
      <h2>Timetable</h2>
      {studentData.timetable.slice(0, 3).map((t, index) => (
        <div
          key={index}
          onClick={() => navigate("/timetable")}
          style={{
            border: "1px solid black",
            margin: "10px",
            padding: "10px",
            cursor: "pointer",
            borderRadius: "8px"
          }}
        >
          <h4>{t.day}</h4>
          <p>{t.subject}</p>
          <p>{t.time}</p>
        </div>
      ))}
    </div>
  );
}

export default Dashboard;