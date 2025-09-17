import { Helmet } from "react-helmet";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";

import { LogOut } from "../API";

import PreLoader from "./components/PreLoader";
import Header from "./components/Header";
import DeleteAccount from "./components/profile_settings/DeleteAccount";
import General from "./components/profile_settings/General";
import Notifications from "./components/profile_settings/Notifications";
import Password from "./components/profile_settings/Password";
import Profile from "./components/profile_settings/Profile";

const Settings = () => {
  const logout = () => {
    Cookies.remove("isLoggedIn");
    Cookies.remove("user");
    Cookies.remove("setProfile");
    Cookies.remove("sessiondays");
    LogOut()
      .then(() => {
        window.location.href = "/session/new";
      })
      .catch((error) => {
        console.error("Error during logout:", error);
      });
  };

  const { section } = useParams();
  const navigate = useNavigate();
  const pSection = section ? section : "general";

  const login = Cookies.get("isLoggedIn") || null;
  if(login == null) {
    window.location.href = "/session/new";
  }
  const user = Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null;
  if (login && user == null) {
    logout();
  }

  const [fade, setFade] = useState(false);

  const validSections = [
    "general",
    "profile",
    "password",
    "notifications",
    "delete",
  ];

  const sectionMap = new Map([
    ["general", "General"],
    ["profile", "Profile"],
    ["password", "Password"],
    ["notifications", "Notifications"],
    ["delete", "Delete Account"],
  ]);

  const sectionInfoMap = new Map([
    ["general", "Manage your username and email"],
    ["profile", "Manage your Profile"],
    ["password", "Manage your Password"],
    ["notifications", "Manage your email notifications"],
    ["delete", "Delete your account permanentely"],
  ]);

  var selectedSection = "";
  var sectionInfo = "";

  useEffect(() => {
    const timer = setTimeout(() => setFade(true), 300);
    if (user.username == null || user.region == null) {
      Cookies.set("setProfile", "true");
      window.location.href = "/profile/details";
    }
    return () => clearTimeout(timer);
  }, [pSection, user.region, user.username]);

  if (validSections.includes(pSection)) {
    selectedSection = sectionMap.get(pSection);
    sectionInfo = sectionInfoMap.get(pSection);
  } else {
    return (window.location.href = "/error");
  }

  const handleSectionChange = (newSection) => {
    setFade(false);
    setTimeout(() => navigate(`/account/settings/${newSection}`), 300);
  };

  return (
    <>
      <Helmet>
        <title>Settings : {selectedSection}</title>
      </Helmet>
      <PreLoader />
      <div id="page" className="s-pagewrap">
        <Header />
        <section
          id="content"
          className="s-content"
          style={{ paddingTop: "130px" }}
        >
          <div className="row entry-wrap d-flex justify-content-center">
            <div className="lg-9">
              <div className="entry__author-box-profile d-flex flex-row align-items-center">
                <div>
                  <figure className="entry__author-avatar profile-avatar-settings">
                    <img
                      alt=""
                      src="/images/avatars/user-06.jpg"
                      className="avatar avatar-settings"
                    />
                  </figure>
                </div>
                <div
                  className="entry__author-info"
                  style={{ marginTop: "15px" }}
                >
                  <h5
                    className="entry__author-name"
                    style={{ marginBottom: "5px", fontSize: "3rem" }}
                  >
                    <a href="#0">
                      <span>{user.fname} {user.lname}</span>
                    </a>
                    <span style={{ marginBottom: "5rem" }}> {" / "} </span>
                    <span>{selectedSection}</span>
                  </h5>
                  <p style={{ margin: "0", fontSize: "1.8rem" }}>
                    {sectionInfo}
                  </p>
                </div>
              </div>
              <div className="profile-settings-container">
                <div className="profile-settings-menu-container">
                  <ul className="profile-settings-options">
                    <li
                      className={pSection === "general" ? "options-active" : ""}
                    >
                      <span
                        style={{ cursor: "pointer" }}
                        onClick={() => handleSectionChange("general")}
                      >
                        General
                      </span>
                    </li>
                    <li
                      className={pSection === "profile" ? "options-active" : ""}
                    >
                      <span
                        style={{ cursor: "pointer" }}
                        onClick={() => handleSectionChange("profile")}
                      >
                        Edit Profile
                      </span>
                    </li>
                    <li
                      className={
                        pSection === "password" ? "options-active" : ""
                      }
                    >
                      <span
                        style={{ cursor: "pointer" }}
                        onClick={() => handleSectionChange("password")}
                      >
                        Password
                      </span>
                    </li>
                    <li
                      className={
                        pSection === "notifications" ? "options-active" : ""
                      }
                    >
                      <span
                        style={{ cursor: "pointer" }}
                        onClick={() => handleSectionChange("notifications")}
                      >
                        Email Notifications
                      </span>
                    </li>
                    <li
                      className={pSection === "delete" ? "options-active" : ""}
                    >
                      <span
                        style={{ cursor: "pointer" }}
                        onClick={() => handleSectionChange("delete")}
                      >
                        Delete Account
                      </span>
                    </li>
                  </ul>
                </div>
                <div
                  className={`profile-settings-menu-section ${
                    fade ? "fade-in" : "fade-out"
                  }`}
                >
                  {pSection === "general" && <General/>}
                  {pSection === "profile" && <Profile/>}
                  {pSection === "password" && <Password/>}
                  {pSection === "notifications" && (
                    <Notifications pSection="notifications"/>
                  )}
                  {pSection === "delete" && <DeleteAccount/>}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Settings;
