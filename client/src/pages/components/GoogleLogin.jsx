import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const GoogleLogin = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const login = queryParams.get("login");
    const saveData = queryParams.get("saveData");
    const user = queryParams.get("user");

    if (login && saveData && user) {
      try {
        const parsedUserData = JSON.parse(decodeURIComponent(user));
        const days = parsedUserData.cookieAge / (1000 * 60 * 60 * 24);
        Cookies.set('sessiondays', days.toString());
        Cookies.set("isLoggedIn", 'true', { expires: days });
        Cookies.set("user", JSON.stringify(parsedUserData), { expires: days });
        navigate("/profile");
      } catch (error) {
        console.error("Error parsing user data:", error);
        navigate("/");
      }
    } else {
      navigate("/");
    }
  }, [location, navigate]);

  return null;
};

export default GoogleLogin;
