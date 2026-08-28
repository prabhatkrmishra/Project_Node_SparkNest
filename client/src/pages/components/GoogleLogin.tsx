// @ts-nocheck
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const GoogleLogin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // New flow: session is already set via httpOnly cookie by server redirect to /google/success
    // Try to fetch current user via session; fallback to legacy query param for backward compat
    const params = new URLSearchParams(window.location.search);
    const legacyUser = params.get("user");

    if (legacyUser) {
      try {
        const parsed = JSON.parse(decodeURIComponent(legacyUser));
        const days = parsed.cookieAge / (1000 * 60 * 60 * 24);
        Cookies.set("sessionDays", days.toString(), { expires: days });
        Cookies.set("sessionLogged", true, { expires: days });
        localStorage.setItem("userBio", parsed.bio);
        parsed.bio = "";
        Cookies.set("sessionUser", JSON.stringify(parsed), { expires: days });
        navigate("/profile");
        return;
      } catch (e) {
        console.error("Legacy Google login parse failed:", e);
      }
    }

    // Preferred: session cookie already set, fetch user via API or use sessionUser if present
    const sessionUser = Cookies.get("sessionUser");
    if (sessionUser) {
      navigate("/profile");
      return;
    }

    // If no sessionUser yet, try to verify session by checking if we can reach a protected endpoint
    // For now, just redirect to profile — server session will be validated there
    // If session is valid, profile will load; otherwise it will redirect to login
    navigate("/profile");
  }, [navigate]);

  return null;
};

export default GoogleLogin;
