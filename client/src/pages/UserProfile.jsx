import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
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

  const [profile, setProfile] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await GetUserPublic(usertag);
        {
          if (response.status == 200) {
            setProfile(response.data);
          }
        }
      } catch (error) {
        console.log(error.response);
        return;
      }
    };
    fetchProfile();
  }, [usertag]);

  return (
    <>
      <Helmet>
        <title>{profile ? profile.fname + profile.lname : ""}</title>
      </Helmet>
      <PreLoader />
      <div id="page" className="s-pagewrap">
        <Header />
        <section
          id="content"
          className="s-content user-profile"
          style={{ paddingTop: "130px" }}
        >
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
                    <img alt="" src={profile.avatar} className="avatar" />
                  </figure>
                  <div className="entry__author-info-profile">
                    <h5 className="entry__author-name-profile">
                      <a className="profile-name-height" href="#0">
                        {/* TODO: Link to username */}
                        {profile ? profile.fname + " " + profile.lname : ""}
                      </a>
                    </h5>
                    <div className="profil-info">
                      <div className="d-flex flex-row gap-2 entry__author-detail-profile">
                        <img
                          width="20"
                          height="20"
                          src="https://img.icons8.com/ios-filled/20/user-male-circle.png"
                          alt="user-male-circle"
                          id="profilesvg"
                        />
                        <p>{profile ? profile.username : ""}</p>
                      </div>
                      <div className="d-flex flex-row gap-2 entry__author-detail-profile">
                        <img
                          width="20"
                          height="20"
                          src="https://img.icons8.com/ios-filled/25/marker.png"
                          alt="marker"
                          id="profilesvg"
                        />
                        <p>{profile ? profile.region : ""}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="entry__author-box-profile-bio">
                  <p className="profile-bio">{profile.bio}</p>
                </div>
              </div>
            </div>
            <div className="profile-creation-box">
              <h3 className="profile-creation-heading"><span>CREATIONS</span></h3>
            </div>
          </div>
          <RenderPreviews url={url} type={type}/>
        </section>
        <Footer />
      </div>
      <MoveToEffect />
    </>
  );
};

export default UserProfile;
