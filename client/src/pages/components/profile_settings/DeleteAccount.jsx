import { useState } from "react";
import Cookies from "js-cookie";

import { DeleteUserAccount } from "../../../api/API";

import logout from "../tools/auth";

const DeleteAccount = () => {
  const user = Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null;
  if (user == null) {
    window.location.href == "/profile";
  }

  const [consent, setConsent] = useState("");
  const [isConsentGiven, SetConsentGiven] = useState(false);

  const handleConsentChange = (e) => {
    setConsent(e.target.value);
    const consentGiven = "YES";
    if (e.target.value == consentGiven) SetConsentGiven(true);
    if (e.target.value != consentGiven) SetConsentGiven(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!consent) return;

    if (isConsentGiven) {
      const details = {
        idtodelete: user.id,
        email: user.email,
        allowed: isConsentGiven,
      };
      try {
        const response = await DeleteUserAccount(details);
        if (response.status == 200) {
          logout();
        } else {
          logout();
        }
      } catch (error) {
        if (error.response.status) logout();
      }
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div>
          <label className="profile-label-styles" htmlFor="consentBox">Type {`'YES'`}</label>
          <input
            className="u-fullwidth profile-input-styles"
            type="text"
            placeholder=""
            id="consentBox"
            onChange={handleConsentChange}
            value={consent}
          />
        </div>
        <button className="btn--primary u-quartorwidth profile-button-styles delete-button" type="submit">
          DELETE
        </button>
      </form>
    </>
  );
};

export default DeleteAccount;
