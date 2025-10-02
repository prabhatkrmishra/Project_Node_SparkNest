/* eslint-disable react/prop-types */
import { useState } from "react";

import SuccessMessage from "../messageBox/SuccessMessage";
import ErrorMessage from "../messageBox/ErrorMessage";

import { patchPasswords } from "../../../api/SERVICESAPI";

const ResetPass = ({ isSuccess, mssg, email, token }) => {
  const [password, setPassword] = useState({
    newPassword: "",
    confirmPassword: "",
    email: email,
    token: token,
  });

  const [successMssg, setSuccessMssg] = useState(mssg);
  const [updated, setUpdated] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMssg, setErrorMssg] = useState("");

  const comparePasswords = (newPass, confirmPass) => {
    return newPass === confirmPass;
  };

  const handleChange = (e) => {
    setPassword((preVal) => {
      return {
        ...preVal,
        [e.target.name]: e.target.value,
      };
    });
    setIsError(false);
  };

  const handleBlur = () => {
    if (!password.newPassword || !password.confirmPassword) return;
    const isSame = comparePasswords(
      password.newPassword,
      password.confirmPassword
    );
    if (!isSame) {
      setErrorMssg("Passwords do not match");
      setIsError(true);
    } else {
      setIsError(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password.email || !password.token) return;
    if (!password.newPassword || !password.confirmPassword) return;
    if (isError) return;

    try {
      const response = await patchPasswords(password);
      if (response.status == 200) {
        setSuccessMssg(response.data.message);
        setUpdated(true);
        setTimeout(() => {
          window.location.href = "/session/new";
        }, 3000);
      }
    } catch (error) {
      if (error.response.status == 400) {
        setErrorMssg(error.response.data.message);
        setIsError(true);
      }
    }
  };

  return (
    <div className="column lg-6 tab-12" style={{ paddingBottom: "50px" }}>
      <SuccessMessage isSuccess={isSuccess} successMssg={successMssg} />
      {!updated && (
        <form action="" autoComplete="off" onSubmit={handleSubmit}>
          <div className="form-outline mb-4">
            <label htmlFor="newPassword" style={{ marginBottom: "8px" }}>
              New Password
            </label>
            <input
              className="u-fullwidth"
              type="password"
              id="newPassword"
              name="newPassword"
              placeholder="•••••••••••••"
              required=""
              onChange={handleChange}
            />
          </div>
          <div className="form-outline mb-4">
            <label htmlFor="confirmPassword" style={{ marginBottom: "8px" }}>
              Retype New Password
            </label>
            <input
              className="u-fullwidth"
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="•••••••••••••"
              required=""
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>
          <ErrorMessage isError={isError} errorMssg={errorMssg} />
          <button type="submit" className="btn--primary u-fullwidth mb-5">
            {"Update Password"}
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPass;
