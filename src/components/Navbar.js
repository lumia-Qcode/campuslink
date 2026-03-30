import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav style={{ padding: "10px", background: "#eee" }}>
      <Link to="/student-dashboard">Dashboard</Link> |{" "}
      <Link to="/marks">Marks</Link>
    </nav>
  );
}

export default Navbar;