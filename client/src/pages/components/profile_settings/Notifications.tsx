// @ts-nocheck
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { GetSubscription, SetSubscription } from "../../../api/API";
import { useAuth } from "../../../components/auth/AuthProvider";

import SuccessMessage from "../messageBox/SuccessMessage";

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [userData, setUserdata] = useState({
    email: user?.email ?? "",
    newsletter: false,
  });
  const [isUpdated, setIsUpdated] = useState(false);
  const [responseMssg, SetResponseMssg] = useState("");
  const savedNewsletter = useRef(false);

  useEffect(() => {
    if (!user?.email) return;
    let active = true;

    const getSubscriptions = async () => {
      try {
        const response = await GetSubscription(user.email);
        if (active && response.status === 200) {
          savedNewsletter.current = Boolean(response.data.newsletter);
          setUserdata({
            email: response.data.email ?? user.email,
            newsletter: Boolean(response.data.newsletter),
          });
        }
      } catch (error) {
        if (error?.response?.status === 404 && active) {
          savedNewsletter.current = false;
          setUserdata({ email: user.email, newsletter: false });
        } else if (error?.response?.status === 401) {
          navigate("/session/new", { replace: true });
        }
      }
    };

    void getSubscriptions();
    return () => {
      active = false;
    };
  }, [navigate, user?.email]);

  const handleCheckboxChange = (event) => {
    setUserdata((preval) => ({ ...preval, [event.target.name]: event.target.checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdated(false);

    if (!userData.email) return;
    if (userData.newsletter === savedNewsletter.current) return;

    try {
      const response = await SetSubscription({
        email: userData.email,
        newsletter: userData.newsletter,
      });
      if (response.status === 200) {
        savedNewsletter.current = userData.newsletter;
        SetResponseMssg(response.data.message);
        setIsUpdated(true);
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        navigate("/session/new", { replace: true });
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
        <label className="profile-label-styles u-add-bottom" htmlFor="newsletterSignup">
          <input
            type="checkbox"
            id="newsletterSignup"
            name="newsletter"
            checked={userData.newsletter}
            onChange={handleCheckboxChange}
            style={{ width: "15px", height: "15px" }}
          />
          <span className="label-text">NewsLetters from SparkNest</span>
        </label>
        <button className="btn--primary u-quartorwidth profile-button-styles" type="submit">
          Update
        </button>
      </form>
    </>
  );
};

export default Notifications;
