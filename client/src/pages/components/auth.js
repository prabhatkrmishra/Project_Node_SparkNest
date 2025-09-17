import Cookies from "js-cookie";

import { LogOut } from "../../API";

const logout = () => {
  Cookies.remove("isLoggedIn");
  Cookies.remove("user");
  Cookies.remove("setProfile");
  Cookies.remove("sessiondays");

  LogOut()
    .then(() => {
      window.location.href = "/session/new";
    })
    .catch((error) => {
      console.error("Error during logout:", error);
    });
};

export default logout;
