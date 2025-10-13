import { useLayoutEffect, useRef, useState } from "react";
import Cookies from "js-cookie";

import logout from "../tools/auth";
import { GetSubscription } from "../../../api/API";
import { SetSubscription } from "../../../api/API";

import SuccessMessage from "../messageBox/SuccessMessage";

const Notifications = (prop) => {
  const user = Cookies.get("sessionUser") ? JSON.parse(Cookies.get("sessionUser")) : null;
  if (user == null) {
    window.location.href == "/profile";
  }

  const [userData, setUserdata] = useState({
    email: user.email,
    newsletter: false,
  });
  const [isUpdated, setIsUpdated] = useState(false);
  const [responseMssg, SetResponseMssg] = useState("");
  var responseData = useRef({});
  var errorData = useRef({});
  const sanitizedData = {};

  useLayoutEffect(() => {
    const getSubscriptions = async () => {
      try {
        responseData.current = await GetSubscription(user.email);
        if (responseData.current.status == 200) {
          setUserdata(() => {
            return responseData.current.data;
          });
        }
      } catch (error) {
        if (error.response.status == 404) {
          errorData.current.email = user.email;
          errorData.current.newsletter = false;
          setUserdata(() => {
            return errorData.current;
          });
        } else if (
          error.response.status == 400 || //empty email
          error.response.status == 403 || //Not Authenticated
          error.response.status == 500 //Server error
        ) {
          logout();
        }
      }
    };
    getSubscriptions();
  }, [user.email]);

  const handleCheckboxChange = (event) => {
    setUserdata((preval) => {
      return {
        ...preval,
        [event.target.name]: event.target.checked,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdated(false);

    if (!userData.email) return;

    
    const formData = new FormData();
    formData.append("email", userData.email);
    if (responseData.current.data) {
      if (userData.newsletter === responseData.current.data.newsletter) return null;
    }

    if (errorData.current) {
      if (userData.newsletter === errorData.current.newsletter) return null;
    }
    sanitizedData.newsletter = userData.newsletter;
    formData.append("newsletter", userData.newsletter);

    try {
      const response = await SetSubscription(formData);
      if (response.status == 200) {
        SetResponseMssg(response.data.message);
        setIsUpdated(true);
        if (responseData.current.data)
          responseData.current.data.newsletter = sanitizedData.newsletter;
        if (errorData.current)
          errorData.current.newsletter = sanitizedData.newsletter;
      } else {
        alert("Something went wrong !");
        window.location.href = "/";
      }
    } catch (error) {
      if (
        error.response.status == 400 || //empty email
        error.response.status == 403 || //Not Authenticated
        error.response.status == 500 //Server error
      ) {
        logout();
      }
    }
  };

  return (
    <>
      <SuccessMessage isSuccess={isUpdated} successMssg={responseMssg} />
      <form onSubmit={handleSubmit}>
        <h5 style={{ marginTop: 0 }}>Notification and Alerts</h5>
        <div className="profile-hr-container notifications-hr">
          <hr className="profile-hr" />
        </div>
        <label className="profile-label-styles u-add-bottom">
          <input
            type="checkbox"
            id="newsletterSignup"
            name="newsletter"
            checked={userData.newsletter}
            onChange={handleCheckboxChange}
            style={{ width: "15px", height: "15px" }}
          />
          <span className="label-text" htmlFor="newsletterSignup">
            NewsLetters from SparkNest
          </span>
        </label>
        <button
          className="btn--primary u-quartorwidth profile-button-styles"
          type="submit"
          style={{
            marginTop: prop.pSection === "notifications" ? "100px" : "0px",
          }}
        >
          Update
        </button>
      </form>
    </>
  );
};

export default Notifications;
