import axios from "axios";

axios.defaults.withCredentials = true;

// local express server
export const WEB_URL = "http://localhost:8080";

export const sendLoginCred = (loginCred) => {
  return axios.post(`${WEB_URL}/login`, loginCred, {
    withCredentials: true,
  });
};

export const checkEmail = (email) => {
  return axios.get(`${WEB_URL}/check/email/${email}`);
};

export const checkUserName = (uname) => {
  return axios.get(`${WEB_URL}/check/username/${uname}`);
};

export const sendSignupCred = (signupCred) => {
  return axios.post(`${WEB_URL}/signup`, signupCred, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const updateDetails = (details) => {
  return axios.patch(`${WEB_URL}/user/details`, details, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const LogOut = () => {
  return axios.post(`${WEB_URL}/logout`, { withCredentials: true });
};

export const Subscription = (details) => {
  return axios.post(`${WEB_URL}/subscribe/newsletter`, details, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const GetSubscription = (email) => {
  return axios.get(`${WEB_URL}/get/subscription/${email}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const SetSubscription = (details) => {
  return axios.patch(`${WEB_URL}/set/subscription`, details, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const DeleteUserAccount = (data) => {
  return axios.delete(`${WEB_URL}/user/account/delete/yes`, {
    headers: {
      "Content-Type": "application/json",
    },
    data: data,
  });
};
