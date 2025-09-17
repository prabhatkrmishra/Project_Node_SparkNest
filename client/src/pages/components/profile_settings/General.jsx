import { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";

import { checkUserName, checkEmail } from "../../../API";
import { updateDetails } from "../../../API";
import logout from "../auth";

import ErrorMessage from "../messageBox/ErrorMessage";

const General = () => {
  const user = useRef(
    Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null
  );
  const days = Cookies.get("sessiondays") ? Number(Cookies.get("user")) : null;
  if (user == null || days == null) {
    window.location.href == "/profile";
  }
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    if (updated) {
      user.current = Cookies.get("user")
        ? JSON.parse(Cookies.get("user"))
        : null;
    }
    setUpdated(false);
  }, [updated]);

  const [newUserData, setUserData] = useState({
    username: user.current.username,
    email: user.current.email,
  });
  const Id = user.current.id;
  const sanitizedData = {};

  const [unameExists, setUnameExists] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [errorMssg, SetErrorMssg] = useState("");

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
      sanitizedData.id = Id;
      if (newUserData.email !== user.current.email)
        sanitizedData.email = newUserData.email;
      if (newUserData.username !== user.current.username)
        sanitizedData.username = newUserData.username;

      try {
        const response = await updateDetails(sanitizedData);
        if (response.status == 200) {
          user.current.username = newUserData.username;
          user.current.email = newUserData.email;
          Cookies.set("user", JSON.stringify(user.current), { expires: days });
          setUpdated(true);
          alert("User details update Successful");
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
      }
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "25px" }}>
          <span className="profile-uid">User ID: {Id}</span>
        </div>
        <div>
          <label htmlFor="pUsername">Username</label>
          <input
            className="u-fullwidth"
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
          <label htmlFor="pEmail">Your email</label>
          <input
            className="u-fullwidth"
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
        <button className="btn--primary u-quartorwidth" type="submit">
          Update
        </button>
      </form>
    </>
  );
};

export default General;
