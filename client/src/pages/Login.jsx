import { useState } from "react";
import { Helmet } from "react-helmet";
import Cookies from "js-cookie";
import "bootstrap/dist/css/bootstrap-utilities.css";

import PreLoader from "./components/PreLoader";
import ErrorMessage from "./components/messageBox/ErrorMessage";
import Header from "./components/Header";

import { sendLoginCred } from "../api/API";
import { WEB_URL } from "../api/API";

const Login = () => {
  const [userCred, setUserCred] = useState({
    useremail: "",
    password: "",
    savesession: false,
  });
  const [isError, setError] = useState(false);
  const [errorMssg, SetErrorMssg] = useState("");

  const isLoggedIn = Cookies.get("isLoggedIn") || null;
  if (isLoggedIn) {
    window.location.href = `/profile`;
  }

  function handleUserCred(event) {
    setUserCred((preVal) => {
      return {
        ...preVal,
        [event.target.name]: event.target.value,
      };
    });
    setError(false);
    SetErrorMssg("");
  }

  const handleCheckboxChange = (event) => {
    setUserCred((preVal) => {
      return {
        ...preVal,
        [event.target.name]: event.target.checked,
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await sendLoginCred(userCred);
      if (response.status == 200) {
        if (response.data.cookieAge && response.data.cookieAge !== false) {
          // persistent cookie
          const days = response.data.cookieAge / (1000 * 60 * 60 * 24);
          Cookies.set("sessiondays", days.toString(), {
            expires: userCred.savesession ? days : null,
          });
          Cookies.set("isLoggedIn", "true", {
            expires: userCred.savesession ? days : null,
          });
          const userData = response.data;
          localStorage.setItem("userBio", userData.bio);
          userData.bio = "";
          Cookies.set("user", JSON.stringify(userData), { expires: days });
        } else {
          // session cookie
          Cookies.set("isLoggedIn", "true");
          Cookies.set("user", JSON.stringify(response.data));
        }
        window.location.href = `/profile`;
      }
    } catch (error) {
      if (error.response.data.message) {
        setError(true);
        SetErrorMssg(error.response.data.message);
      } else {
        setError(true);
        SetErrorMssg("Something went wrong, refresh page");
      }
    }
  };

  const googleAuth = () => {
    window.location.href = `${WEB_URL}/auth/google`;
  };

  return (
    <>
      <PreLoader />
      <Helmet>
        <title>Login : SparkNest</title>
      </Helmet>
      <div id="page" className="s-pagewrap">
        <Header />
        <section
          id="content"
          className="s-content"
          style={{ paddingTop: "130px" }}
        >
          <div className="row d-flex justify-content-center">
            <div
              className="column lg-6 tab-12"
              style={{ paddingBottom: "50px" }}
            >
              <div className="">
                <h2
                  className="d-flex justify-content-center u-add-bottom mb-xxl-5"
                  style={{ marginTop: "0" }}
                >
                  <u>Login</u>
                </h2>
              </div>
              {/*  <!-- Login with -->
              <div
                className="d-flex align-items-center justify-content-center"
                style={{ margintop: "10px" }}
              >
                <p className="text-center fw-bold mx-3 mb-0 text-muted">
                  Log in with
                </p>
              </div>
                <!-- Login with end --> */}
              {/*  <!-- Google Button --> */}
              <div className="d-flex align-items-center justify-content-center">
                <a
                  onClick={googleAuth}
                  className="btn btn--hollow u-fullwidth d-flex gap-3 align-items-center justify-content-center"
                >
                  <div>Log in with</div>
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
              {<ErrorMessage isError={isError} errorMssg={errorMssg} />}
              <form onSubmit={handleSubmit}>
                <div className="form-outline mb-4">
                  <label htmlFor="formEmail" style={{ marginBottom: "8px" }}>
                    Your Email
                  </label>
                  <input
                    className="u-fullwidth"
                    type="email"
                    id="formEmail"
                    name="useremail"
                    placeholder="abcd@efg.ijk"
                    required=""
                    onChange={handleUserCred}
                  />
                </div>
                <div className="form-outline mb-4">
                  <label htmlFor="formPassword" style={{ marginBottom: "8px" }}>
                    Password
                  </label>
                  <input
                    className="u-fullwidth"
                    type="password"
                    id="formPassword"
                    name="password"
                    placeholder="•••••••••••"
                    required=""
                    onChange={handleUserCred}
                  />
                </div>
                <div className="d-flex flex-row justify-content-between align-items-center mb-5">
                  <label className="u-add-bottom" style={{ margin: "0 0" }}>
                    <input
                      type="checkbox"
                      id="loginCheck"
                      name="savesession"
                      checked={userCred.savesession}
                      onChange={handleCheckboxChange}
                      style={{ width: "15px", height: "15px" }}
                    />
                    <span className="label-text" htmlFor="loginCheck">
                      Remember me
                    </span>
                  </label>
                  <label className="u-add-bottom" style={{ margin: "0 0" }}>
                    <a className="label-text" href="/forgot-password">
                      Forgot password?
                    </a>
                  </label>
                </div>
                <button type="submit" className="btn--primary u-fullwidth mb-5">
                  Sign in
                </button>
                <label
                  className="u-add-bottom"
                  style={{ margin: "0 0", textAlign: "center" }}
                >
                  <span className="label-text" htmlFor="loginCheck">
                    Not have an account?{" "}
                    <a className="label-text " href="/signup/new">
                      <u>Sign up</u>
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

export default Login;
