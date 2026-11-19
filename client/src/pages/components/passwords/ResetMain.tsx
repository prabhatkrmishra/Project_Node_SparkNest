// @ts-nocheck
import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import PreLoader from "../PreLoader";
import Header from "../Header";
import Footer from "../Footer";
import ResetPass from "./ResetPass";
import ResetError from "./ResetError";

import { verifyToken } from "../../../api/SERVICESAPI";

const ResetMain = () => {
  const { email, token } = useParams();

  const [mssg, setMssg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!email || !token) {
      setMssg("This reset link is incomplete. Please request a new one.");
      setIsError(true);
      setChecking(false);
      return;
    }

    const body = {
      email: email,
      token: token,
    };

    const verify = async () => {
      try {
        const response = await verifyToken(body);
        if (response.status === 200) {
          setMssg(response.data.message);
          setIsSuccess(true);
        } else {
          setMssg("We could not verify this reset link. Please request a new one.");
          setIsError(true);
        }
      } catch (error) {
        setMssg(
          error?.response?.data?.message ||
            "This reset link is invalid or has expired. Please request a new one."
        );
        setIsError(true);
      } finally {
        setChecking(false);
      }
    };
    void verify();
  }, [email, token]);

  return (
    <>
      <Helmet>
        <title>Reset Password · SparkNest</title>
      </Helmet>
      <PreLoader />
      <div id="page" className="s-pagewrap">
        <Header />
        <section id="content" className="s-content" style={{ paddingTop: "130px" }}>
          <div className="row d-flex justify-content-center mb-lg-5">
            {checking && (
              <div className="column lg-6 tab-12" style={{ paddingBottom: "50px" }}>
                <p role="status">Checking your reset link…</p>
              </div>
            )}
            {!checking && isSuccess && (
              <ResetPass isSuccess={isSuccess} mssg={mssg} email={email} token={token} />
            )}
            {!checking && isError && <ResetError isError={isError} mssg={mssg} />}
          </div>
        </section>
        <Footer />
      </div>
    </>
  );
};

export default ResetMain;
