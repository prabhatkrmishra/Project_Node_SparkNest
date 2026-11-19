// @ts-nocheck
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
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

import logout from "./components/tools/auth";

import PreLoader from "./components/PreLoader";
import Header from "./components/Header";
import Footer from "./components/Footer";
import GetPreviews from "./components/profile/GetPreviews";
import MoveToEffect from "./components/effects/MoveToEffect";

import updateProfile from "./components/UpdateProfile";
import { useAuth } from "../components/auth/AuthProvider";

const Profile = () => {
  const navigate = useNavigate();
  const { user, refresh } = useAuth();

  useEffect(() => {
    if (user && (!user.username || !user.region)) {
      navigate("/profile/details", { replace: true });
    }
  }, [user, navigate]);

  const [profileAvatar, setProfileAvatar] = useState(user?.avatar || null);
  useEffect(() => {
    let active = true;
    const updateUser = async () => {
      await updateProfile();
      const nextUser = await refresh();
      if (active) {
        setProfileAvatar(nextUser?.avatar || localStorage.getItem("avatar"));
      }
    };
    if (user?.id) void updateUser();
    return () => {
      active = false;
    };
  }, [refresh, user?.id]);

  const userBio = user?.bio || localStorage.getItem("userBio") || "";
  const { section } = useParams();
  const [highlighted, setHighlighted] = useState(section || "articles");

  useEffect(() => {
    const allowedSections = ["articles", "collections", "liked"];
    if (!allowedSections.includes(section)) {
      navigate("/profile/articles");
      setHighlighted("articles");
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
  }, [navigate, section]);

  const [isOpen, setIsOpen] = useState(false);
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset({ mainAxis: 10, crossAxis: 32 }), shift()],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);
  const headingId = useId();

  const handleSectionChange = (newSection) => {
    setHighlighted(newSection);
    navigate(`/profile/${newSection}`);
  };

  return (
    <>
      <Helmet>
        <title>{user ? `${user.fname} ${user.lname}` : "Your profile"}</title>
      </Helmet>
      <PreLoader />
      <div id="page" className="s-pagewrap">
        <Header />
        <section id="content" className="s-content" style={{ paddingTop: "130px" }}>
          <div
            className="d-flex flex-column justify-content-center align-items-center row entry-wrap"
            style={{
              paddingBottom: "0px",
            }}
          >
            <div className="profile-heading-container">
              <div className="profile-avatar-buttons">
                <div className="entry__author-box-profile">
                  <figure className="entry__author-avatar-profile">
                    <img alt="" src={profileAvatar} className="avatar" />
                  </figure>
                  <div className="entry__author-info-profile">
                    <h5 className="entry__author-name-profile">
                      <a
                        className="profile-name-height"
                        href={`/user/${user ? user.username || user.id : 0}`}
                      >
                        {user ? user.fname + " " + user.lname : ""}
                      </a>
                    </h5>
                    <div className="profil-info">
                      <div className="d-flex flex-row gap-2 entry__author-detail-profile">
                        <svg
                          className="profile-detail-icon"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                        >
                          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
                          <circle cx="12" cy="9.5" r="3" stroke="currentColor" strokeWidth="1.6" />
                          <path
                            d="M6.5 18c.9-2.4 2.9-3.6 5.5-3.6s4.6 1.2 5.5 3.6"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                          />
                        </svg>
                        <p>{user ? user.username : ""}</p>
                      </div>
                      <div className="d-flex flex-row gap-2 entry__author-detail-profile">
                        <svg
                          className="profile-detail-icon"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M12 21s6-5.1 6-10a6 6 0 1 0-12 0c0 4.9 6 10 6 10Z"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinejoin="round"
                          />
                          <circle cx="12" cy="11" r="2.2" stroke="currentColor" strokeWidth="1.6" />
                        </svg>
                        <p>{user ? user.region : ""}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="entry__author-box-profile-bio">
                  <p className="profile-bio">{userBio}</p>
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
                      <circle cx="2" cy="8" r="1.5" fill="currentColor"></circle>
                      <circle cx="8" cy="8" r="1.5" fill="currentColor"></circle>
                      <circle cx="14" cy="8" r="1.5" fill="currentColor"></circle>
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
                            <span>Contact</span>
                          </button>
                        </div>
                      </div>
                    </FloatingFocusManager>
                  )}
                </div>
              </div>
            </div>
            <div className="d-flex flex-row gap-3 lg-12 profile-menu-buttons">
              <button
                className={`btn btn--pill-small profile-buttons-style-menu ${
                  highlighted === "articles" ? "profile-buttons-highlight" : ""
                }`}
                onClick={() => handleSectionChange("articles")}
              >
                My Articles
              </button>
              <button
                className={`btn btn--pill-small profile-buttons-style-menu ${
                  highlighted === "collections" ? "profile-buttons-highlight" : ""
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
          {user && <GetPreviews renderCategory={highlighted} userId={user.id ? user.id : 0} />}
        </section>
        <Footer />
      </div>
      <MoveToEffect />
    </>
  );
};

export default Profile;
