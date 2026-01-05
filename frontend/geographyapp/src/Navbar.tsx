import React from "react";
import NavButton from "./NavButton";

export default function Navbar() {
  return (
    <div className="navbar-container">
      <NavButton destination="/quiz" title="Quiz"></NavButton>
      <NavButton destination="/social" title="Social"></NavButton>
      <NavButton destination="/profile" title="Profile"></NavButton>
    </div>
  );
}
