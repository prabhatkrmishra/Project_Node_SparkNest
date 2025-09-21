import { useState } from "react";
import { Helmet } from "react-helmet";
import "bootstrap/dist/css/bootstrap-utilities.css";

import { checkEmail, sendSignupCred } from "../api/API";
import { WEB_URL } from "../api/API";

import PreLoader from "./components/PreLoader";
import ErrorMessage from "./components/messageBox/ErrorMessage";
import Header from "./components/Header";

const SignUp = () => {
  const [userData, setUserData] = useState({
    fname: "",
    lname: "",
    email: "",
    password: "",
    newsletter: false,
  });
  const [emailExists, setEmailExists] = useState(false);
  const [errorMssg, SetErrorMssg] = useState("");

  function handleUserData(event) {
    setUserData((preVal) => {
      return {
        ...preVal,
        [event.target.name]: event.target.value,
      };
    });
    setEmailExists(false);
  }

  const handleCheckboxChange = (event) => {
    setUserData((preVal) => {
      return {
        ...preVal,
        [event.target.name]: event.target.checked,
      };
    });
  };

  const handleFocus = (e) => {
    e.target.removeAttribute("readonly");
  };

  const handleEmailBlur = async () => {
    if (userData.email) {
      const exists = await checkEmail(userData.email);
      if (exists.data.message) {
        setEmailExists(true);
        SetErrorMssg(exists.data.message);
      } else {
        setEmailExists(false);
      }
    } else {
      alert("Email is empty");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (emailExists) {
      return;
    }

    try {
      const response = await sendSignupCred(userData);
      if (response.status == 201) {
        alert("Signup successful! Login to continue");
        window.location.href = "/session/new";
      } else {
        alert("Something went wrong !");
        window.location.href = "/";
      }
    } catch (error) {
      console.error("There was an error during Signup!", error);
    }
  };

  const googleAuth = () => {
    window.location.href = `${WEB_URL}/auth/google`;
  };

  return (
    <>
      <Helmet>
        <title>Signup : SparkNest</title>
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
            <div
              className="column lg-6 tab-12"
              style={{ paddingBottom: "50px" }}
            >
              <div>
                <h2
                  className="d-flex justify-content-center u-add-bottom mb-xxl-5"
                  style={{ marginTop: "0" }}
                >
                  <u>Signup</u>
                </h2>
              </div>
              {/*  <!-- Login with --> */}
              {/*  <!-- Google Button --> */}
              <div className="d-flex align-items-center justify-content-center mt-4">
                <a
                  onClick={googleAuth}
                  className="btn btn--hollow u-fullwidth d-flex gap-3  align-items-center justify-content-center"
                >
                  <div>Sign Up with</div>
                  <svg
                    className="google-svg-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    width="20px"
                    height="20px"
                    viewBox="0 0 488 512"
                  >
                    <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
                  </svg>
                </a>
              </div>
              {/*  <!-- Google Button End --> */}
              {/*  <!-- OR --> */}
              <div className="d-flex justify-content-center align-items-center mb-4">
                {/*  <!-- Left horizontal border --> */}
                <div style={{ width: "47%" }}>
                  <hr
                    className="mt-4 mb-4 border border-secondary-subtle"
                    style={{ borderColor: "#000000 !important" }}
                  />
                </div>
                {/*  <!-- Mid Text --> */}
                <div
                  className="text-center fw-bold mx-3 text-muted"
                  style={{ textWrap: "nowrap" }}
                >
                  OR
                </div>
                {/* <!-- Right horizontal border --> */}
                <div style={{ width: "47%" }}>
                  <hr
                    className="mt-4 mb-4 border border-secondary-subtle"
                    style={{ borderolor: "#000000 !important" }}
                  />
                </div>
              </div>
              {/*  <!-- OR END --> */}
              <form onSubmit={handleSubmit}>
                <div className="signup-form">
                  <div className="form-outline">
                    <label htmlFor="fName" style={{ marginBottom: "8px" }}>
                      First Name
                    </label>
                    <input
                      className="input-Width-adjust"
                      type="text"
                      id="fName"
                      name="fname"
                      placeholder="First Name"
                      required=""
                      onChange={handleUserData}
                      readOnly
                      onFocus={handleFocus}
                    />
                  </div>
                  <div className="form-outline">
                    <label htmlFor="lName" style={{ marginBottom: "8px" }}>
                      Last Name
                    </label>
                    <input
                      className="input-Width-adjust"
                      type="text"
                      id="lName"
                      name="lname"
                      placeholder="Last Name"
                      required=""
                      onChange={handleUserData}
                      readOnly
                      onFocus={handleFocus}
                    />
                  </div>
                </div>
                <div className="form-outline mb-4">
                  <label htmlFor="formEmail" style={{ marginBottom: "8px" }}>
                    Enter Email
                  </label>
                  <input
                    className="u-fullwidth"
                    type="email"
                    id="formEmail"
                    name="email"
                    placeholder="your@email.com"
                    required=""
                    onChange={handleUserData}
                    onBlur={handleEmailBlur}
                    readOnly
                    onFocus={handleFocus}
                  />
                </div>
                <ErrorMessage isError={emailExists} errorMssg={errorMssg} />
                <div className="form-outline mb-4">
                  <label htmlFor="formPassword" style={{ marginBottom: "8px" }}>
                    Enter Password
                  </label>
                  <input
                    className="u-fullwidth"
                    type="password"
                    id="formPassword"
                    name="password"
                    placeholder="•••••••••••••"
                    required=""
                    onChange={handleUserData}
                  />
                </div>
                <div className="d-flex flex-row justify-content-between align-items-center mb-5">
                  <label className="u-add-bottom" style={{ margin: "0 0" }}>
                    <input
                      type="checkbox"
                      id="newsletterSignup"
                      name="newsletter"
                      checked={userData.newsletter}
                      onChange={handleCheckboxChange}
                      style={{ width: "15px", height: "15px" }}
                    />
                    <span className="label-text" htmlFor="newsletterSignup">
                      SignUp for NewsLetter
                    </span>
                  </label>
                </div>
                <button type="submit" className="btn--primary u-fullwidth mb-5">
                  Sign Up
                </button>
                <label
                  className="u-add-bottom"
                  style={{ margin: "0 0", textAlign: "center" }}
                >
                  <span className="label-text" htmlFor="loginCheck">
                    Already have an account?{" "}
                    <a className="label-text " href="/session/new">
                      <u>Sign In</u>
                    </a>
                  </span>
                </label>
              </form>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default SignUp;
