// @ts-nocheck
import { useEffect, useRef, useState } from "react";

const sections = [
  ["general", "General"],
  ["profile", "Edit Profile"],
  ["password", "Password"],
  ["notifications", "Email Notifications"],
  ["delete", "Delete Account"],
];

const DropDownMenu = ({ pSection, handleSectionChange }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="settings-navigation-dropdown" ref={containerRef}>
      <button
        type="button"
        className="btn btn--primary dropdown-section-settings-width settings-dropdown__toggle"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((value) => !value)}
      >
        Menu
      </button>
      {open && (
        <ul className="settings-dropdown__menu" role="menu">
          {sections.map(([value, label]) => (
            <li key={value} role="none">
              <button
                type="button"
                role="menuitem"
                className={`settings-dropdown__item ${
                  pSection === value ? "options-active" : ""
                }`}
                onClick={() => {
                  setOpen(false);
                  handleSectionChange(value);
                }}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DropDownMenu;
