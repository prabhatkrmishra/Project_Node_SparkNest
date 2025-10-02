// eslint-disable-next-line no-unused-vars
import axios from "axios";
import { WEB_URL } from "./API";

export const getArticlePreviews = () => {
  return (`${WEB_URL}/article/previews`);
};

export const getArticlePreviewsCategory = (category) => {
  return (`${WEB_URL}/article/preview/category/${category}`);
};

export const getProfileArticlePreviews = (id) => {
  return (`${WEB_URL}/article/profile/preview/${id}`)
};

export const getFeatured = () => {
  return axios.get(`${WEB_URL}/articles/featured`);
};

export const checkSavedArticle = (userId, articleId) => {
  return axios.get(`${WEB_URL}/articles/checksaved/${userId}/${articleId}`);
};

export const saveArticleUser = (data) => {
  return axios.post(`${WEB_URL}/articles/save`, data, {
    withCredentials: true,
  });
};

export const unsaveArticleUser = (data) => {
  return axios.post(`${WEB_URL}/articles/unsave`, data, {
    withCredentials: true,
  });
};

export const checkLikedArticle = (userId, articleId) => {
  return axios.get(`${WEB_URL}/articles/checkliked/${userId}/${articleId}`);
};

export const likeArticleUser = (data) => {
  return axios.post(`${WEB_URL}/articles/like`, data, {
    withCredentials: true,
  });
};

export const unlikeArticleUser = (data) => {
  return axios.post(`${WEB_URL}/articles/unlike`, data, {
    withCredentials: true,
  });
};

export const getAllSaved = (user_id) => {
  return (`${WEB_URL}/articles/saved/${user_id}`);
};

export const getAllLiked = (user_id) => {
  return (`${WEB_URL}/articles/liked/${user_id}`);
};