import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";

import PreLoader from "../PreLoader";
import SuccessMessage from "../messageBox/SuccessMessage";

import { resetPassword } from "../../../api/SERVICESAPI";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [mssg, setMssg] = useState("");
  const [countdown, setCountdown] = useState(0);
  const countDownTime = 45;

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) return;

    const body = {
      email: email,
    };

    try {
      const response = await resetPassword(body);
      if (response.status == 200) {
        setMssg(response.data.message);
        setIsSuccess(true);
        setEmail("");
        setCountdown(countDownTime);
      }
    } catch (error) {
      console.log(error.response);
    }
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
    if (countdown < 1) {
      setIsSuccess(false);
    }
  }, [countdown]);

  return (
    <>
      <Helmet>
        <title>Forgot Pasword</title>
      </Helmet>
      <PreLoader />
      <div id="page" className="s-pagewrap">
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
              <SuccessMessage isSuccess={isSuccess} successMssg={mssg} />
              {countdown < 1 && (
                <p>
                  <u>Request a password reset link to your email</u>
                </p>
              )}
              {countdown > 0 && (
                <p>
                  Please wait <b>{countdown}</b> seconds before requesting a new
                  link.
                </p>
              )}
              <form onSubmit={handleSubmit}>
                <div className="form-outline mb-4">
                  <label htmlFor="formEmail" style={{ marginBottom: "8px" }}>
                    Enter Your Email
                  </label>
                  <input
                    className="u-fullwidth"
                    type="email"
                    id="formEmail"
                    name="email"
                    placeholder="your@email.com"
                    required=""
                    value={email}
                    onChange={handleChange}
                  />
                </div>
                <button
                  type="submit"
                  className="btn--primary u-fullwidth mb-5"
                  disabled={countdown > 0}
                >
                  {countdown > 0 ? `Wait ${countdown}s` : "Submit"}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ForgotPassword;
