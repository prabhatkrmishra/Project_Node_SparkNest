import axios from "axios";

axios.defaults.withCredentials = true;

// Server location
export const WEB_URL = "http://localhost:8080";
//export const WEB_URL = "https://sparknest.run.place/api";

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
      'Content-Type': 'multipart/form-data',
    }
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

export const GetUserPublic = (id) => {
  return axios.get(`${WEB_URL}/public/user/${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

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

export const viewArticle = (id) => {
  return axios.get(`${WEB_URL}/article/view/${id}`);
};

export const fetchArticle = (id) => {
  return axios.get(`${WEB_URL}/article/fetch/${id}`);
}

export const createArticle = (formData) => {
  return axios.post(`${WEB_URL}/article/create`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  });
};

export const updateArticle = (formData) => {
  return axios.patch(`${WEB_URL}/article/update`, formData, {
    withCredentials: true,
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  });
};

export const dropArticle = (id) => {
  return axios.delete(`${WEB_URL}/article/delete`, {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
    data: { id },
  });
};

export const fetchCategories = (categoryString) => {
  return axios.get(`${WEB_URL}/fetch/categories?category=${categoryString}`, {
    withCredentials: false,
  });
};
