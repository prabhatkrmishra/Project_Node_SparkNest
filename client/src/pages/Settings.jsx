import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";

import PreLoader from "./components/PreLoader";
import Header from "./components/Header";

import DeleteAccount from "./components/profile_settings/DeleteAccount";
import General from "./components/profile_settings/General";
import Notifications from "./components/profile_settings/Notifications";
import Password from "./components/profile_settings/Password";
import Profile from "./components/profile_settings/Profile";

const Settings = () => {
  const { section } = useParams();
  const pSection = section ? section : "general";

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

  if (validSections.includes(pSection)) {
    selectedSection = sectionMap.get(pSection);
    sectionInfo = sectionInfoMap.get(pSection);
  } else {
    return (window.location.href = "/error");
  }

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
            <div className="lg-10">
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
                      <span>Naruto Uzumaki</span>
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
                      <a href="/account/settings/general">General</a>
                    </li>
                    <li
                      className={pSection === "profile" ? "options-active" : ""}
                    >
                      <a href="/account/settings/profile">Edit Profile</a>
                    </li>
                    <li
                      className={
                        pSection === "password" ? "options-active" : ""
                      }
                    >
                      <a href="/account/settings/password">Password</a>
                    </li>
                    <li
                      className={
                        pSection === "notifications" ? "options-active" : ""
                      }
                    >
                      <a href="/account/settings/notifications">
                        Email Notifications
                      </a>
                    </li>
                    <li
                      className={pSection === "delete" ? "options-active" : ""}
                    >
                      <a href="/account/settings/delete">Delete Account</a>
                    </li>
                  </ul>
                </div>
                <div className="profile-settings-menu-section">
                  {pSection === "general" && <General />}
                  {pSection === "profile" && <Profile />}
                  {pSection === "password" && <Password />}
                  {pSection === "notifications" && (
                    <Notifications pSection="notifications" />
                  )}
                  {pSection === "delete" && <DeleteAccount />}
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
