import { Helmet } from "react-helmet";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import PreLoader from "../PreLoader";
import ResetPass from "./ResetPass";
import ResetError from "./ResetError";

import { verifyToken } from "../../../api/SERVICESAPI";

const ResetMain = () => {
  const { email, token } = useParams();
  console.log(email);
  console.log(token);

  const [mssg, setMssg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!email || !token) return;

    const body = {
      email: email,
      token: token,
    };

    const verify = async () => {
      if (!body.email || !body.token) return;

      try {
        const response = await verifyToken(body);
        if (response.status == 200) {
          setMssg(response.data.message);
          setIsSuccess(true);
          return;
        }
      } catch (error) {
        if (error.response.status == 400) {
          setMssg(error.response.data.message);
          setIsError(true);
          return;
        }
      }
    };
    verify();
  }, [email, token]);

  return (
    <>
      <Helmet>
        <title>Reset Pasword</title>
      </Helmet>
      <PreLoader />
      <div id="page" className="s-pagewrap">
        <section
          id="content"
          className="s-content"
          style={{ paddingTop: "130px" }}
        >
          <div className="row d-flex justify-content-center mb-lg-5">
            {isSuccess && <ResetPass isSuccess={isSuccess} mssg={mssg} email={email} token={token}/>}
            {isError && <ResetError isError={isError} mssg={mssg} />}
          </div>
        </section>
      </div>
    </>
  );
};

export default ResetMain;
