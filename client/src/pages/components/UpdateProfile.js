import Cookies from "js-cookie";
import { GetUserPublic } from "../../api/API";

const updateProfile = async () => {
  const days = Cookies.get("sessiondays") ? Number(Cookies.get("user")) : null;
  const userCookie = Cookies.get("user");
  const user = userCookie ? JSON.parse(userCookie) : null;

  if (user && user.id) {
    const response = await GetUserPublic(user.id);

    user.fname = response.data.fname;
    user.lname = response.data.lname;
    user.username = response.data.username;
    user.region = response.data.region;
    Cookies.set("user", JSON.stringify(user), { expires: days });
    localStorage.setItem("userBio", response.data.bio);
    localStorage.setItem("avatar", response.data.avatar);
    console.log(response);
  }
};

export default updateProfile;
