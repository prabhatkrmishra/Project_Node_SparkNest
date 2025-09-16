import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Helmet } from "react-helmet";
import { useParams, useNavigate } from "react-router-dom";

import {
  useFloating,
  autoUpdate,
  offset,
  shift,
  useDismiss,
  useRole,
  useClick,
  useInteractions,
  FloatingFocusManager,
  useId,
} from "@floating-ui/react";

import { LogOut } from "../API";

import PreLoader from "./components/PreLoader";
import Header from "./components/Header";
import RenderBlogs from "./components/RenderBlogs";
import MoveToEffect from "./components/effects/MoveToEffect";

const Profile = () => {
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
  const [highlighted, setHighlighted] = useState(section || "blogs");

  const login = Cookies.get("isLoggedIn") || null;
  const user = Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null;
  if (!user || !login) {
    logout();
  }

  useEffect(() => {
    if (user.username == null || user.region == null) {
      Cookies.set("setProfile", "true");
      window.location.href = "/profile/details";
    }

    const allowedSections = ["blogs", "collections", "liked"];
    if (!allowedSections.includes(section)) {
      navigate("/profile/blogs");
      setHighlighted("blogs");
    } else {
      setHighlighted(section);
    }

    const element = document.getElementById("bricks");
    if (element) {
      element.style.paddingTop = "60px";
    }

    return () => {
      if (element) {
        element.style.paddingTop = "";
      }
    };
  }, [navigate, section, user.region, user.username]);

  const handleSectionChange = (newSection) => {
    setHighlighted(newSection);
    navigate(`/profile/${newSection}`);
  };

  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset({ mainAxis: -25, crossAxis: 90 }), shift()],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  const headingId = useId();

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
          <div
            className="d-flex flex-column justify-content-center align-items-center row entry-wrap"
            style={{
              paddingBottom: "0px",
            }}
          >
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
                    <a className="profile-name-height" href="#0">
                      {/* TODO: Link to username */}
                      {user.fname} {user.lname}
                    </a>
                  </h5>
                  <div className="d-flex flex-row gap-5 profil-info">
                    <div className="d-flex flex-row gap-2 entry__author-detail-profile">
                      <img
                        width="20"
                        height="20"
                        src="https://img.icons8.com/ios-filled/20/user-male-circle.png"
                        alt="user-male-circle"
                        id="profilesvg"
                      />
                      <p>{user.username}</p>
                    </div>
                    <div className="d-flex flex-row gap-2 entry__author-detail-profile">
                      <img
                        width="20"
                        height="20"
                        src="https://img.icons8.com/ios-filled/25/marker.png"
                        alt="marker"
                        id="profilesvg"
                      />
                      <p>{user.region}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="profileButtons">
                <a
                  className="btn btn--pill-small profile-buttons-style"
                  href="/account/settings/profile"
                >
                  <span>Edit Profile</span>
                </a>
                <span
                  className="btn btn--circle profile-buttons-style"
                  ref={refs.setReference}
                  {...getReferenceProps()}
                >
                  <svg
                    width="16px"
                    height="16px"
                    viewBox="0 0 16 16"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    role="img"
                  >
                    <circle cx="2" cy="12" r="1.5" fill="currentColor"></circle>
                    <circle cx="8" cy="12" r="1.5" fill="currentColor"></circle>
                    <circle
                      cx="14"
                      cy="12"
                      r="1.5"
                      fill="currentColor"
                    ></circle>
                  </svg>
                </span>
                {isOpen && (
                  <FloatingFocusManager context={context} modal={false}>
                    <div
                      className="dot-sub-menu"
                      ref={refs.setFloating}
                      style={floatingStyles}
                      aria-labelledby={headingId}
                      {...getFloatingProps()}
                    >
                      <div className="d-flex flex-column">
                        <button
                          className="btn btn--pill-small profile-buttons-svg-menu"
                          onClick={() => navigate("/account/settings")}
                        >
                          <span>Settings</span>
                        </button>
                        <button
                          className="btn btn--pill-small profile-buttons-svg-menu"
                          onClick={logout}
                        >
                          <span>Logout</span>
                        </button>
                        <button
                          className="btn btn--pill-small profile-buttons-svg-menu"
                          onClick={() => navigate("/contact")}
                        >
                          Contact
                        </button>
                      </div>
                    </div>
                  </FloatingFocusManager>
                )}
              </div>
            </div>
            <div className="d-flex flex-row gap-3 lg-12 profile-menu-buttons">
              <button
                className={`btn btn--pill-small profile-buttons-style-menu ${
                  highlighted === "blogs" ? "profile-buttons-highlight" : ""
                }`}
                onClick={() => handleSectionChange("blogs")}
              >
                My Blogs
              </button>
              <button
                className={`btn btn--pill-small profile-buttons-style-menu ${
                  highlighted === "collections"
                    ? "profile-buttons-highlight"
                    : ""
                }`}
                onClick={() => handleSectionChange("collections")}
              >
                Collections
              </button>
              <button
                className={`btn btn--pill-small profile-buttons-style-menu ${
                  highlighted === "liked" ? "profile-buttons-highlight" : ""
                }`}
                onClick={() => handleSectionChange("liked")}
              >
                Liked
              </button>
            </div>
            <div className="profile-hr-container">
              <hr className="profile-hr" />
            </div>
          </div>
          {highlighted === "blogs" && <RenderBlogs />}
          {highlighted === "collections" && <RenderBlogs />}
          {highlighted === "liked" && <RenderBlogs />}
        </section>
      </div>
      <MoveToEffect />
    </>
  );
};

export default Profile;
