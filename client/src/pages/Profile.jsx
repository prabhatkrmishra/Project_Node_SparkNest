import Cookies from "js-cookie";
import { Helmet } from "react-helmet";

import PreLoader from "./components/PreLoader";
import Header from "./components/Header";

import { LogOut } from "../API";

const Profile = () => {
  const user = Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null;

  function logout() {
    Cookies.remove("isLoggedIn");
    Cookies.remove("user");
    LogOut()
      .then(() => {
        window.location.href = "/";
      })
      .catch((error) => {
        console.error("Error during logout:", error);
      });
  }

  if (!user) {
    <button onClick={logout}>Data not found Logout</button>;
  }

  return (
    <>
      <Helmet>
        <title>
          {user.fname} {user.lname}
        </title>
      </Helmet>
      <PreLoader />
      <div id="page" className="s-pagewrap">
        <Header />
        <section
          id="content"
          className="s-content"
          style={{ paddingTop: "130px" }}
        >
          <div className="d-flex flex-column justify-content-center align-items-center row entry-wrap">
            <div className="d-flex flex-column">
              <div className="entry__author-box-profile">
                <figure className="entry__author-avatar-profile">
                  <img
                    alt=""
                    src="/images/avatars/user-06.jpg"
                    className="avatar"
                  />
                </figure>
                <div className="entry__author-info-profile">
                  <h5 className="entry__author-name-profile">
                    <a href="#0">
                      {/* TODO: Link to username */}
                      {user.fname} {user.lname}
                    </a>
                  </h5>
                  <div className="d-flex flex-row gap-2 entry__author-detail-profile">
                    <img
                      width="20"
                      height="20"
                      src="https://img.icons8.com/ios-filled/25/marker.png"
                      alt="marker"
                      id="profilesvg"
                    />
                    <p>Delhi, India</p>
                  </div>
                </div>
              </div>
              <div className="profileButtons">
                <a className="btn btn--pill-small" href="#0">
                  Edit Profile
                </a>
                <a className="btn btn--circle" href="#0">
                  <svg
                    width="16px"
                    height="16px"
                    viewBox="0 0 16 16"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    role="img"
                  >
                    <circle cx="2" cy="11" r="1.5" fill="currentColor"></circle>
                    <circle
                      cx="14"
                      cy="11"
                      r="1.5"
                      fill="currentColor"
                    ></circle>
                    <circle cx="8" cy="11" r="1.5" fill="currentColor"></circle>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Profile;
