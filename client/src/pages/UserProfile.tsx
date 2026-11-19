// @ts-nocheck
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";

import PreLoader from "./components/PreLoader";
import Header from "./components/Header";
import Footer from "./components/Footer";
import MoveToEffect from "./components/effects/MoveToEffect";
import RenderPreviews from "./components/RenderPreviews";

import { GetUserPublic } from "../api/API";
import { getProfileArticlePreviews } from "../api/ARTICLESAPI";

const UserProfile = () => {
  const { usertag } = useParams();
  const url = getProfileArticlePreviews(usertag);
  const type = 100;

  const [profile, setProfile] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchProfile = async () => {
      setNotFound(false);
      try {
        const response = await GetUserPublic(usertag);
        if (active && response.status === 200) setProfile(response.data);
      } catch (error) {
        if (active && error?.response?.status === 404) setNotFound(true);
      }
    };
    void fetchProfile();
    return () => {
      active = false;
    };
  }, [usertag]);

  return (
    <>
      <Helmet>
        <title>
          {profile ? `${profile.fname} ${profile.lname}` : notFound ? "Profile not found" : "Profile"}
        </title>
      </Helmet>
      <PreLoader />
      <div id="page" className="s-pagewrap">
        <Header />
        <section id="content" className="s-content user-profile" style={{ paddingTop: "130px" }}>
          {!notFound && <h1 className="u-screen-reader-text">{profile ? `${profile.fname} ${profile.lname}` : usertag}</h1>}
          {notFound && (
            <div className="row user-profile__notfound">
              <div className="column lg-12">
                <h1>Profile not found</h1>
                <p>We couldn’t find a SparkNest member with that username.</p>
                <a className="btn btn--primary" href="/">
                  Back to home
                </a>
              </div>
            </div>
          )}
          {!notFound && (
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
                    <img
                      alt={profile ? `${profile.fname} ${profile.lname}'s avatar` : "User avatar"}
                      src={profile?.avatar || "/images/sample-image.jpg"}
                      className="avatar"
                      onError={(event) => {
                        event.currentTarget.src = "/images/sample-image.jpg";
                      }}
                    />
                  </figure>
                  <div className="entry__author-info-profile">
                    <h5 className="entry__author-name-profile">
                      <a
                        className="profile-name-height"
                        href={`/user/${profile?.username || usertag}`}
                      >
                        {profile ? `${profile.fname} ${profile.lname}` : ""}
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
                        <p>{profile ? profile.username : ""}</p>
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
                        <p>{profile ? profile.region : ""}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="entry__author-box-profile-bio">
                  <p className="profile-bio">{profile?.bio}</p>
                </div>
              </div>
            </div>
            <div className="profile-creation-box">
              <h3 className="profile-creation-heading">
                <span>CREATIONS</span>
              </h3>
            </div>
          </div>
          )}
          {!notFound && <RenderPreviews url={url} type={type} />}
        </section>
        <Footer />
      </div>
      <MoveToEffect />
    </>
  );
};

export default UserProfile;
