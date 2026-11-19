// @ts-nocheck
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { updateDetails } from "../../../api/API";
import { useAuth } from "../../../components/auth/AuthProvider";

import ErrorMessage from "../messageBox/ErrorMessage";
import SuccessMessage from "../messageBox/SuccessMessage";

const Password = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isError, setError] = useState(false);
  const [isSuccess, setSuccess] = useState(false);
  const [notMatch, setNotMatch] = useState(false);
  const [responseMssg, SetResponseMssg] = useState("");

  const [newUserData, setUserData] = useState({
    oldpassword: "",
    newpassword: "",
    confirmpassword: "",
  });
  const Id = user?.id;

  const oldPasswordRef = useRef(null);
  const newPasswordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const handleDataChange = (e) => {
    setUserData((preVal) => {
      return {
        ...preVal,
        [e.target.name]: e.target.value,
      };
    });
    if (isError) setError(false);
    if (notMatch) setNotMatch(false);
  };

  const matchPassword = () => {
    if (newUserData.newpassword !== newUserData.confirmpassword) setNotMatch(true);
  };

  const clearPasswords = () => {
    if (oldPasswordRef.current) oldPasswordRef.current.value = "";
    if (newPasswordRef.current) newPasswordRef.current.value = "";
    if (confirmPasswordRef.current) confirmPasswordRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    if (!newUserData.oldpassword || !newUserData.newpassword || !newUserData.confirmpassword) {
      SetResponseMssg("All password fields are required");
      setError(true);
      return;
    }

    if (newUserData.newpassword !== newUserData.confirmpassword) {
      setNotMatch(true);
      return;
    }

    const formData = new FormData();
    formData.append("id", Id);
    formData.append("oldpassword", newUserData.oldpassword);
    formData.append("password", newUserData.confirmpassword);

    try {
      const response = await updateDetails(formData);
      if (response.status === 200) {
        SetResponseMssg(response.data.message);
        setSuccess(true);
        clearPasswords();
      } else {
        SetResponseMssg("Something went wrong, please try again.");
        setError(true);
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        navigate("/session/new", { replace: true });
        return;
      }
      SetResponseMssg(error?.response?.data?.message || "Could not update your password.");
      setError(true);
      if (error?.response?.status === 400) clearPasswords();
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <ErrorMessage isError={isError} errorMssg={responseMssg} />
        <SuccessMessage isSuccess={isSuccess} successMssg={responseMssg} />
        <div>
          <label className="profile-label-styles" htmlFor="pOldPass">
            Old Password
          </label>
          <input
            className="u-fullwidth profile-input-styles"
            type="password"
            id="pOldPass"
            name="oldpassword"
            onChange={handleDataChange}
            required
            ref={oldPasswordRef}
          />
        </div>
        <div>
          <label className="profile-label-styles" htmlFor="pNewPass">
            New Password
          </label>
          <input
            className="u-fullwidth profile-input-styles"
            type="password"
            id="pNewPass"
            name="newpassword"
            onChange={handleDataChange}
            required
            ref={newPasswordRef}
          />
        </div>
        <div>
          <label className="profile-label-styles" htmlFor="pNewPassConfirm">
            Confirm New Password
          </label>
          <input
            className="u-fullwidth profile-input-styles"
            type="password"
            id="pNewPassConfirm"
            name="confirmpassword"
            onChange={handleDataChange}
            onBlur={matchPassword}
            required
            ref={confirmPasswordRef}
          />
        </div>
        <ErrorMessage isError={notMatch} errorMssg={"New Passwords does not match"} />
        <button className="btn--primary u-quartorwidth profile-button-styles" type="submit">
          Update
        </button>
      </form>
    </>
  );
};

export default Password;
