import React from "react";
import Navbar from "../../components/Navbar";
import { studentData } from "../../data/mockData";

function MarksPage() {
  return (
    <div>
      <Navbar />
      <h2>Marks Details</h2>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Subject</th>
            <th>Score</th>
            <th>Grade</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {studentData.marks.map((m, index) => (
            <tr key={index}>
              <td>{m.subject}</td>
              <td>{m.score}</td>
              <td>{m.grade}</td>
              <td>{m.remarks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MarksPage;