import Cookies from "js-cookie";
import CryptoJS from 'crypto-js';

import { LogOut } from "../../../api/API";

const logout = () => {
  Cookies.remove("isLoggedIn");
  Cookies.remove("user");
  Cookies.remove("setProfile");
  Cookies.remove("sessiondays");
  localStorage.removeItem("userBio");

  LogOut()
    .then(() => {
      window.location.href = "/session/new";
    })
    .catch((error) => {
      console.error("Error during logout:", error);
    });
};

export const encryptData = (data, key) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
};

export const decryptData = (ciphertext, key) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, key);
  const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decryptedData);
};

export default logout;
