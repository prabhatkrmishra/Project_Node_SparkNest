import axios from "axios";
import { env } from "../config/env";

axios.defaults.withCredentials = true;

export const WEB_URL = env.apiUrl;

export const api = axios.create({
  baseURL: WEB_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && window.location.pathname !== "/session/new") {
      // Don't auto-redirect on background checks; let caller handle
    }
    return Promise.reject(err);
  }
);

export const sendLoginCred = (loginCred: unknown) => {
  return api.post(`/login`, loginCred);
};

export const checkEmail = (email: string) => {
  return api.get(`/check/email/${email}`);
};

export const checkUserName = (uname: string) => {
  return api.get(`/check/username/${uname}`);
};

export const sendSignupCred = (signupCred: unknown) => {
  return api.post(`/signup`, signupCred, {
    headers: { "Content-Type": "application/json" },
  });
};

export const updateDetails = (details: FormData) => {
  return api.patch(`/user/details`, details, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const DeleteUserAccount = (data: unknown) => {
  return api.delete(`/user/account/delete/yes`, {
    headers: { "Content-Type": "application/json" },
    data: data,
  });
};

export const GetUserPublic = (id: string | number) => {
  return api.get(`/public/user/${id}`, {
    headers: { "Content-Type": "application/json" },
  });
};

export const LogOut = () => {
  return api.post(`/logout`);
};

export const Subscription = (details: unknown) => {
  return api.post(`/subscribe/newsletter`, details, {
    headers: { "Content-Type": "application/json" },
  });
};

export const GetSubscription = (email: string) => {
  return api.get(`/get/subscription/${email}`, {
    headers: { "Content-Type": "application/json" },
  });
};

export const SetSubscription = (details: unknown) => {
  return api.patch(`/set/subscription`, details, {
    headers: { "Content-Type": "application/json" },
  });
};

export const viewArticle = (id: string | number) => {
  return api.get(`/article/view/${id}`);
};

export const fetchArticle = (id: string | number) => {
  return api.get(`/article/fetch/${id}`);
};

export const createArticle = (formData: FormData) => {
  return api.post(`/article/create`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updateArticle = (formData: FormData) => {
  return api.patch(`/article/update`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const dropArticle = (id: string | number) => {
  return api.delete(`/article/delete`, {
    headers: { "Content-Type": "application/json" },
    data: { id },
  });
};

export const fetchCategories = (categoryString: string) => {
  return api.get(`/fetch/categories?category=${categoryString}`, {
    withCredentials: false,
  });
};

export const fetchAllCategories = () => {
  return api.get(`/fetch/categories/all`, {
    withCredentials: false,
  });
};
