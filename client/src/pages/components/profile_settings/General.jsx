import { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";

import { checkUserName, checkEmail } from "../../../api/API";
import { updateDetails } from "../../../api/API";
import logout from "../tools/auth";

import ErrorMessage from "../messageBox/ErrorMessage";
import SuccessMessage from "../messageBox/SuccessMessage";

const General = () => {
  const user = useRef(
    Cookies.get("sessionUser") ? JSON.parse(Cookies.get("sessionUser")) : null
  );
  const days = Cookies.get("sessionDays")
    ? Number(Cookies.get("sessionDays"))
    : 0;
  if (user.current == null || days == 0) {
    window.location.href == "/profile";
  }
  const [updateCookie, setUpdateCookie] = useState(false);

  useEffect(() => {
    if (updateCookie) {
      user.current = Cookies.get("sessionUser")
        ? JSON.parse(Cookies.get("sessionUser"))
        : null;
    }
    setUpdateCookie(false);
  }, [updateCookie]);

  const [newUserData, setUserData] = useState({
    username: user.current.username,
    email: user.current.email,
  });
  const Id = user.current.id;

  const [unameExists, setUnameExists] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);
  const [errorMssg, SetErrorMssg] = useState("");
  const [responseMssg, SetResponseMssg] = useState("");

  const handleChangeUsername = (e) => {
    setUserData((preVal) => {
      return {
        ...preVal,
        [e.target.name]: e.target.value,
      };
    });
    setUnameExists(false);
  };

  const handleChangeEmail = (e) => {
    setUserData((preVal) => {
      return {
        ...preVal,
        [e.target.name]: e.target.value,
      };
    });
    setEmailExists(false);
  };

  const checkNewUsername = async () => {
    if (newUserData.username !== user.current.username) {
      if (newUserData.username) {
        const exists = await checkUserName(newUserData.username);
        if (exists.data.message) {
          setUnameExists(true);
          SetErrorMssg(exists.data.message);
        } else {
          setUnameExists(false);
        }
      } else {
        console.log("Username is empty");
      }
    }
  };

  const checkNewEmail = async () => {
    if (newUserData.email !== user.current.email) {
      if (newUserData.email) {
        const exists = await checkEmail(newUserData.email);
        if (exists.data.message) {
          setEmailExists(true);
          SetErrorMssg(exists.data.message);
        } else {
          setEmailExists(false);
        }
      } else {
        console.log("Email is empty");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdated(false);
    if (!newUserData.email || !newUserData.username) {
      alert("Username or Email is empty");
      return;
    }

    if (
      newUserData.email === user.current.email &&
      newUserData.username === user.current.username
    ) {
      return;
    }

    if (!unameExists && !emailExists) {
      const formData = new FormData();
      formData.append("id", Id);
      if (newUserData.email !== user.current.email)
        formData.append("email", newUserData.email);
      if (newUserData.username !== user.current.username)
        formData.append("username", newUserData.username);

      try {
        const response = await updateDetails(formData);
        if (response.status == 200) {
          user.current.username = newUserData.username;
          user.current.email = newUserData.email;
          Cookies.set("sessionUser", JSON.stringify(user.current), {
            expires: days,
          });
          setUpdateCookie(true);
          SetResponseMssg(response.data.message);
          setIsUpdated(true);
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
        } else console.log(error.response);
      }
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <SuccessMessage isSuccess={isUpdated} successMssg={responseMssg} />
        <div style={{ marginBottom: "25px" }}>
          <label className="profile-label-styles" htmlFor="uid">
            User ID
          </label>
          <span className="profile-uid" id="uid">
            {Id}
          </span>
        </div>
        <div>
          <label className="profile-label-styles" htmlFor="pUsername">
            Username
          </label>
          <input
            className="u-fullwidth profile-input-styles"
            type="text"
            id="pUsername"
            name="username"
            value={newUserData.username}
            placeholder="Username"
            onChange={handleChangeUsername}
            onBlur={checkNewUsername}
          />
        </div>
        <ErrorMessage isError={unameExists} errorMssg={errorMssg} />
        <div>
          <label className="profile-label-styles" htmlFor="pEmail">
            Your email
          </label>
          <input
            className="u-fullwidth profile-input-styles"
            type="email"
            id="pEmail"
            name="email"
            value={newUserData.email}
            placeholder="Email"
            onChange={handleChangeEmail}
            onBlur={checkNewEmail}
          />
        </div>
        <ErrorMessage isError={emailExists} errorMssg={errorMssg} />
        <button
          className="btn--primary u-quartorwidth profile-button-styles"
          type="submit"
        >
          Update
        </button>
      </form>
    </>
  );
};

export default General;
