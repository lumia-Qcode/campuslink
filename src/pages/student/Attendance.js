import React from "react";
import Navbar from "../../components/Navbar";
import { studentData } from "../../data/mockData";

function Attendance() {
  return (
    <div>
      <Navbar />

      <h2>Attendance Details</h2>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Subject</th>
            <th>Present</th>
            <th>Total</th>
            <th>Percentage</th>
          </tr>
        </thead>

        <tbody>
          {studentData.attendance.map((a, index) => {
            const percentage = ((a.present / a.total) * 100).toFixed(1);

            return (
              <tr key={index}>
                <td>{a.subject}</td>
                <td>{a.present}</td>
                <td>{a.total}</td>
                <td>{percentage}%
                  <div style={{ width: "100%", background: "#ddd" }}>
                    <div style={{ width: `${percentage}%`, background: "green", height: "10px" }} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Attendance;