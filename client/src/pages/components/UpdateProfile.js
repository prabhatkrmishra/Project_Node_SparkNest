import Cookies from "js-cookie";
import { GetUserPublic } from "../../api/API";

const updateProfile = async () => {
  const user = Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null;

  if (user && user.id) {
    const response = await GetUserPublic(user.id);

    user.fname = response.data.fname;
    user.lname = response.data.lname;
    user.username = response.data.username;
    user.region = response.data.region;
    localStorage.setItem("userBio", response.data.bio);
    localStorage.setItem("avatar", response.data.avatar);
  }
};

export default updateProfile;
