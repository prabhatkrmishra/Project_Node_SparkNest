import axios from "axios";
import { WEB_URL } from "./API";

export const sendMessage = (body) => {
  return axios.post(`${WEB_URL}/send/message`, body, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const resetPassword = (email) => {
  return axios.post(`${WEB_URL}/password/request/email`, email, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const verifyToken = (body) => {
  return axios.post(`${WEB_URL}/password/verify`, body, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export const patchPasswords = (body) => {
  return axios.post(`${WEB_URL}/password/new`, body, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}