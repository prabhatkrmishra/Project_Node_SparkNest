import { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";

import { updateDetails } from "../../../API";
import logout from "../auth";

import SuccessMessage from "../messageBox/SuccessMessage";

const Profile = () => {
  const user = useRef(
    Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null
  );
  const days = Cookies.get("sessiondays") ? Number(Cookies.get("user")) : null;
  if (user == null || days == null) {
    window.location.href == "/profile";
  }

  const [updateCookie, setUpdateCookie] = useState(false);
  useEffect(() => {
    if (updateCookie) {
      user.current = Cookies.get("user")
        ? JSON.parse(Cookies.get("user"))
        : null;
    }
    setUpdateCookie(false);
  }, [updateCookie]);

  const [newUserData, setUserData] = useState({
    fname: user.current.fname,
    lname: user.current.lname,
    region: user.current.region,
  });
  const Id = user.current.id;
  const sanitizedData = {};
  const [isUpdated, setIsUpdated] = useState(false);
  const [responseMssg, SetResponseMssg] = useState("");

  const handleDataChange = (e) => {
    setUserData((preVal) => {
      return {
        ...preVal,
        [e.target.name]: e.target.value,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdated(false);
    if (!newUserData.fname && !newUserData.lname && !newUserData.region) {
      alert("Input field is empty");
      return;
    }

    if (
      newUserData.fname === user.current.fname &&
      newUserData.lname === user.current.lname &&
      newUserData.region === user.current.region
    ) {
      return;
    }

    sanitizedData.id = Id;
    if (newUserData.fname !== user.current.fname)
      sanitizedData.fname = newUserData.fname;
    if (newUserData.lname !== user.current.lname)
      sanitizedData.lname = newUserData.lname;
    if (newUserData.region !== user.current.region)
      sanitizedData.region = newUserData.region;

    try {
      const response = await updateDetails(sanitizedData);
      if (response.status == 200) {
        user.current.fname = newUserData.fname;
        user.current.lname = newUserData.lname;
        user.current.region = newUserData.region;
        Cookies.set("user", JSON.stringify(user.current), { expires: days });
        setUpdateCookie(true);
        SetResponseMssg(response.data.message);
        setIsUpdated(true);
        setTimeout(() => {
          window.location.href = "profile";
        }, 300);
      } else {
        alert("Something went wrong !");
        window.location.href = "/";
      }
    } catch (error) {
      if (
        error.response.status == 403 || //Not Authenticated
        error.response.status == 404 || //User not found
        error.response.status == 500 //Server error
      ) {
        logout();
      }
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <SuccessMessage isSuccess={isUpdated} successMssg={responseMssg} />
        <div className="u-fullwidth menu-section-profile">
          <div className="profile-input-names">
            <label className="profile-label-styles" htmlFor="pfName">First Name</label>
            <input
              className="profile-input-name profile-input-styles"
              type="text"
              id="fName"
              name="fname"
              required
              value={newUserData.fname}
              placeholder="First Name"
              onChange={handleDataChange}
            />
          </div>
          <div className="profile-input-name">
            <label className="profile-label-styles" htmlFor="plName">Last Name</label>
            <input
              className="profile-input-name profile-input-styles"
              type="text"
              id="lName"
              name="lname"
              required
              value={newUserData.lname}
              placeholder="Last Name"
              onChange={handleDataChange}
            />
          </div>
        </div>
        <div>
          <label className="profile-label-styles" htmlFor="pRegion">Region</label>
          <input
            className="u-fullwidth profile-input-styles"
            type="text"
            id="pRegion"
            name="region"
            required
            value={newUserData.region}
            placeholder="City, State, Country"
            onChange={handleDataChange}
          />
        </div>
        <button className="btn--primary u-quartorwidth profile-button-styles" type="submit">
          Update
        </button>
      </form>
    </>
  );
};

export default Profile;
