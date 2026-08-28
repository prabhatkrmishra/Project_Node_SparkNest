// @ts-nocheck
import { api, WEB_URL } from "./API";

export const sendMessage = (body) => {
  return api.post(`/send/message`, body, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const resetPassword = (email) => {
  return api.post(`/password/request/email`, email, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const verifyToken = (body) => {
  return api.post(`/password/verify`, body, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const patchPasswords = (body) => {
  return api.post(`/password/new`, body, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export { WEB_URL };
