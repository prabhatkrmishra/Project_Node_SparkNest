import Dropdown from "react-bootstrap/Dropdown";

const DropDownMenu = (prop) => {
  return (
    <>
      <Dropdown className="settings-navigation-dropdown">
        <Dropdown.Toggle
          className="dropdown-section-settings-width"
          variant="success"
          id="dropdown-basic"
        >
          Menu
        </Dropdown.Toggle>
        <Dropdown.Menu className="dropdown-section-settings-width dropdown-section-settings-menu">
          <Dropdown.Item>
            <li className={prop.pSection === "general" ? "options-active" : ""}>
              <span
                className="dropdown-menu-span"
                style={{ cursor: "pointer" }}
                onClick={() => prop.handleSectionChange("general")}
              >
                General
              </span>
            </li>
          </Dropdown.Item>
          <Dropdown.Item>
            <li className={prop.pSection === "profile" ? "options-active" : ""}>
              <span
                className="dropdown-menu-span"
                style={{ cursor: "pointer" }}
                onClick={() => prop.handleSectionChange("profile")}
              >
                Edit Profile
              </span>
            </li>
          </Dropdown.Item>
          <Dropdown.Item>
            <li
              className={prop.pSection === "password" ? "options-active" : ""}
            >
              <span
                className="dropdown-menu-span"
                style={{ cursor: "pointer" }}
                onClick={() => prop.handleSectionChange("password")}
              >
                Password
              </span>
            </li>
          </Dropdown.Item>
          <Dropdown.Item>
            <li
              className={
                prop.pSection === "notifications" ? "options-active" : ""
              }
            >
              <span
                className="dropdown-menu-span"
                style={{ cursor: "pointer" }}
                onClick={() => prop.handleSectionChange("notifications")}
              >
                Email Notifications
              </span>
            </li>
          </Dropdown.Item>
          <Dropdown.Item>
            <li className={prop.pSection === "delete" ? "options-active" : ""}>
              <span
                className="dropdown-menu-span"
                style={{ cursor: "pointer" }}
                onClick={() => prop.handleSectionChange("delete")}
              >
                Delete Account
              </span>
            </li>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </>
  );
};

export default DropDownMenu;
