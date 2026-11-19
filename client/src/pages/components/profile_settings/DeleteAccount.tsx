// @ts-nocheck
import { useState } from "react";

import { DeleteUserAccount } from "../../../api/API";
import { useAuth } from "../../../components/auth/AuthProvider";

import logout from "../tools/auth";

const DeleteAccount = () => {
  const { user } = useAuth();

  const [consent, setConsent] = useState("");
  const [isConsentGiven, SetConsentGiven] = useState(false);

  const handleConsentChange = (e) => {
    setConsent(e.target.value);
    const consentGiven = "YES";
    SetConsentGiven(e.target.value === consentGiven);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!consent) return;

    if (!isConsentGiven || !user) return;

    const details = {
      idtodelete: user.id,
      email: user.email,
      allowed: isConsentGiven,
    };
    try {
      await DeleteUserAccount(details);
    } catch (error) {
      console.error("Account deletion failed:", error);
    } finally {
      logout();
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div>
          <label className="profile-label-styles" htmlFor="consentBox">
            Type {`'YES'`}
          </label>
          <input
            className="u-fullwidth profile-input-styles"
            type="text"
            placeholder=""
            id="consentBox"
            onChange={handleConsentChange}
            value={consent}
          />
        </div>
        <button
          className="btn--primary u-quartorwidth profile-button-styles delete-button"
          type="submit"
        >
          DELETE
        </button>
      </form>
    </>
  );
};

export default DeleteAccount;
