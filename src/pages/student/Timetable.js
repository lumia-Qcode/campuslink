import React from "react";
import Navbar from "../../components/Navbar";
import { studentData } from "../../data/mockData";

function Timetable() {
  return (
    <div>
      <Navbar />

      <h2>Class Timetable</h2>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Day</th>
            <th>Subject</th>
            <th>Time</th>
          </tr>
        </thead>

        <tbody>
          {studentData.timetable.map((t, index) => (
            <tr key={index}>
              <td>{t.day}</td>
              <td>{t.subject}</td>
              <td>{t.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Timetable;