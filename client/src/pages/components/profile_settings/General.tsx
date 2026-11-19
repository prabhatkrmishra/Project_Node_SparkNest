// @ts-nocheck
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { checkUserName, checkEmail, updateDetails } from "../../../api/API";
import { useAuth } from "../../../components/auth/AuthProvider";

import ErrorMessage from "../messageBox/ErrorMessage";
import SuccessMessage from "../messageBox/SuccessMessage";

const General = () => {
  const navigate = useNavigate();
  const { user, refresh } = useAuth();

  const [newUserData, setUserData] = useState({
    username: user?.username ?? "",
    email: user?.email ?? "",
  });

  const [unameExists, setUnameExists] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);
  const [errorMssg, SetErrorMssg] = useState("");
  const [responseMssg, SetResponseMssg] = useState("");

  const handleChangeUsername = (e) => {
    setUserData((preVal) => ({ ...preVal, [e.target.name]: e.target.value }));
    setUnameExists(false);
  };

  const handleChangeEmail = (e) => {
    setUserData((preVal) => ({ ...preVal, [e.target.name]: e.target.value }));
    setEmailExists(false);
  };

  const checkNewUsername = async () => {
    if (newUserData.username !== user?.username && newUserData.username) {
      const exists = await checkUserName(newUserData.username);
      if (exists.data.message) {
        setUnameExists(true);
        SetErrorMssg(exists.data.message);
      } else {
        setUnameExists(false);
      }
    }
  };

  const checkNewEmail = async () => {
    if (newUserData.email !== user?.email && newUserData.email) {
      const exists = await checkEmail(newUserData.email);
      if (exists.data.message) {
        setEmailExists(true);
        SetErrorMssg(exists.data.message);
      } else {
        setEmailExists(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdated(false);

    if (!user) return;

    if (!newUserData.email || !newUserData.username) {
      SetErrorMssg("Username and email are required");
      return;
    }

    if (newUserData.email === user.email && newUserData.username === user.username) {
      return;
    }

    if (unameExists || emailExists) return;

    const formData = new FormData();
    formData.append("id", user.id);
    if (newUserData.email !== user.email) formData.append("email", newUserData.email);
    if (newUserData.username !== user.username) formData.append("username", newUserData.username);

    try {
      const response = await updateDetails(formData);
      if (response.status === 200) {
        await refresh();
        SetResponseMssg(response.data.message);
        setIsUpdated(true);
      } else {
        SetErrorMssg("Something went wrong, please try again.");
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        navigate("/session/new", { replace: true });
        return;
      }
      SetErrorMssg(error?.response?.data?.message || "Could not update your details.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <SuccessMessage isSuccess={isUpdated} successMssg={responseMssg} />
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
      <button className="btn--primary u-quartorwidth profile-button-styles" type="submit">
        Update
      </button>
    </form>
  );
};

export default General;
