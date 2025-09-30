import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import Cookies from "js-cookie";

import { checkUserName, updateDetails } from "../../api/API";
import logout from "./tools/auth";

import PreLoader from "./PreLoader";
import Header from "./Header";
import ErrorMessage from "./messageBox/ErrorMessage";

import { setItem } from "./tools/IndexDBstorage";

const Details = () => {
  const navigate = useNavigate();
  const setProfile = Cookies.get("setProfile")
    ? Cookies.get("setProfile")
    : null;

  useEffect(() => {
    if (setProfile == null) {
      navigate("/session/new");
    }
  }, [navigate, setProfile]);

  const user = useRef(
    Cookies.get("user") ? JSON.parse(Cookies.get("user")) : {}
  );
  const days = Cookies.get("sessiondays") ? Number(Cookies.get("user")) : null;
  const [userData, setUserData] = useState({
    id: user.current.id ? user.current.id : "",
    username: "",
    region: "",
    bio: "",
    avatar: "",
  });
  const [unameExists, setUnameExists] = useState(false);
  const [errorMssg, SetErrorMssg] = useState("");
  const [charCount, setCharCount] = useState(0);
  const maxCharLimit = 200;

  const handleFocus = (e) => {
    e.target.removeAttribute("readonly");
  };

  function handleUserData(event) {
    if (event.target.name === "bio" && event.target.value.length > maxCharLimit)
      return;

    setUserData((preVal) => {
      return {
        ...preVal,
        [event.target.name]: event.target.value,
      };
    });

    if (event.target.name === "bio") {
      setCharCount(event.target.value.length);
    }

    setUnameExists(false);
  }

  const handleBlur = async () => {
    if (userData.username) {
      const exists = await checkUserName(userData.username);
      if (exists.data.message) {
        setUnameExists(true);
        SetErrorMssg(exists.data.message);
      } else {
        setUnameExists(false);
      }
    } else {
      console.log("Username is empty");
    }
  };

  const [avatars, setAvatars] = useState([]);
  const [avatar, setAvatar] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [notChoosen, setNotChoosen] = useState(false);

  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        const response = await fetch("http://localhost:8080/images/avatars");
        const data = await response.json();
        setAvatars(data.avatars);
      } catch (error) {
        console.error("Error fetching avatars:", error);
      }
    };
    fetchAvatars();
  }, []);

  const handleAvatarSelect = (avatarUrl) => {
    setAvatar(avatarUrl);
    setSelectedImage("");
    setSelectedFile(null);
    setUserData((preVal) => {
      return {
        ...preVal,
        avatar: avatarUrl,
      };
    });
    setNotChoosen(false);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setAvatar("");
      setNotChoosen(false);
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (unameExists) {
      return;
    }

    if (!avatar && !selectedImage) {
      SetErrorMssg("No avatar selected or uploaded");
      setNotChoosen(true);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("id", userData.id);
      formData.append("username", userData.username);
      formData.append("region", userData.region);
      formData.append("bio", userData.bio);
      if(userData.avatar) formData.append("avatar", userData.avatar);
      if(selectedFile) formData.append("avatar_image", selectedFile);

      const response = await updateDetails(formData);
      if (response.status == 200) {
        user.current.username = userData.username;
        user.current.region = userData.region;
        user.current.avatar = "";
        user.current.bio = "";
        Cookies.set("user", JSON.stringify(user.current), { expires: days });
        localStorage.setItem("userBio", userData.bio);
        setItem("avatar", userData.avatar || selectedImage);
        Cookies.remove("setProfile");
        alert("User details update Successful");
        window.location.href = "/profile";
      } else {
        alert("Something went wrong !");
        window.location.href = "/";
      }
    } catch (error) {
      if (
        error.response.status == 403 || //Not Authenticated
        error.response.status == 404 || //User not found
        error.response.status == 500 //Server error
      ) {
        logout();
      }
      console.error("There was an error during Signup!", error);
    }
  };

  return (
    <>
      <Helmet>
        <title>Details : SparkNest</title>
      </Helmet>
      <PreLoader />
      <div id="page" className="s-pagewrap">
        <Header />
        <section
          id="content"
          className="s-content"
          style={{ paddingTop: "130px" }}
        >
          <div className="row d-flex justify-content-center mb-lg-5">
            <div className="column lg-6 tab-12">
              <div className="image-selector">
                <h5>Select an Avatar</h5>
                <div className="avatar-grid">
                  {avatars.map((avatarUrl, index) => (
                    <img
                      key={index}
                      src={avatarUrl}
                      alt={`Avatar ${index + 1}`}
                      onClick={() => handleAvatarSelect(avatarUrl)}
                      style={{
                        cursor: "pointer",
                        margin: "5px",
                        display: "block",
                        width: "80px",
                        height: "80px",
                      }}
                    />
                  ))}
                </div>
              </div>
              <div style={{ margin: "20px 0", textAlign: "center" }}>OR</div>
              <div className="image-selector">
                <h5>Upload your Image</h5>
                <input
                  type="file"
                  className="upload-custom-avatar"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {selectedImage && (
                  <div className="image-selector" style={{ marginTop: "32px" }}>
                    <h5>Selected Image</h5>
                    <img
                      src={selectedImage}
                      alt="Selected"
                      style={{ width: "100px", height: "100px" }}
                    />
                  </div>
                )}
              </div>
              {avatar && (
                <div className="image-selector" style={{ marginTop: "32px" }}>
                  <h5>Selected Avatar:</h5>
                  <img
                    src={avatar}
                    alt="Selected Avatar"
                    style={{ width: "100px", height: "100px" }}
                  />
                </div>
              )}
              <div className="upload-avatar-error-div">
                <ErrorMessage isError={notChoosen} errorMssg={errorMssg} />
              </div>
            </div>
            <div
              className="column lg-6 tab-12"
              style={{ paddingBottom: "50px" }}
            >
              <form onSubmit={handleSubmit}>
                <div className="form-outline mb-4">
                  <label htmlFor="userName" style={{ marginBottom: "8px" }}>
                    Enter Username
                  </label>
                  <input
                    className="u-fullwidth"
                    type="text"
                    id="userName"
                    name="username"
                    placeholder="userName"
                    required
                    value={userData.username}
                    onChange={handleUserData}
                    onBlur={handleBlur}
                    readOnly
                    onFocus={handleFocus}
                  />
                </div>
                <ErrorMessage isError={unameExists} errorMssg={errorMssg} />
                <div className="form-outline mb-4">
                  <label htmlFor="inputRegion" style={{ marginBottom: "8px" }}>
                    Enter Region
                  </label>
                  <input
                    className="u-fullwidth"
                    type="text"
                    id="inputRegion"
                    name="region"
                    placeholder="City, Country"
                    required
                    value={userData.region}
                    onChange={handleUserData}
                    readOnly
                    onFocus={handleFocus}
                  />
                </div>
                <div
                  className="form-outline mb-4"
                  style={{ position: "relative" }}
                >
                  <label htmlFor="inputBio" style={{ marginBottom: "8px" }}>
                    Your Bio
                  </label>
                  <textarea
                    className="u-fullwidth"
                    placeholder="Max 150 characters"
                    id="inputBio"
                    name="bio"
                    required
                    value={userData.bio}
                    onChange={handleUserData}
                    readOnly
                    onFocus={handleFocus}
                  ></textarea>
                  <p
                    style={{
                      position: "absolute",
                      padding: "0 10px 0 5px",
                      right: "1px",
                      bottom: "1px",
                      fontSize: "12px",
                      marginBottom: "0",
                      color: charCount > maxCharLimit ? "red" : "gray",
                    }}
                  >
                    {maxCharLimit - charCount} characters remaining
                  </p>
                </div>
                <button type="submit" className="btn--primary u-fullwidth mb-5">
                  Set Details
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Details;
