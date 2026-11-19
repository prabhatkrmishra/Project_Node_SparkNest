// @ts-nocheck
import { api } from "./API";

// Preview helpers return API-relative paths. Callers pass them to the shared
// axios instance, which already applies the /api baseURL.
export const getArticlePreviews = () => {
  return `/article/previews`;
};

export const getArticlePreviewsCategory = (category) => {
  return `/article/preview/category/${category}`;
};

export const getProfileArticlePreviews = (id) => {
  return `/article/profile/preview/${id}`;
};

export const getFeatured = () => {
  return api.get(`/articles/featured`);
};

export const checkSavedArticle = (userId, articleId) => {
  return api.get(`/articles/checksaved/${userId}/${articleId}`);
};

export const saveArticleUser = (data) => {
  return api.post(`/articles/save`, data);
};

export const unsaveArticleUser = (data) => {
  return api.post(`/articles/unsave`, data);
};

export const checkLikedArticle = (userId, articleId) => {
  return api.get(`/articles/checkliked/${userId}/${articleId}`);
};

export const likeArticleUser = (data) => {
  return api.post(`/articles/like`, data);
};

export const unlikeArticleUser = (data) => {
  return api.post(`/articles/unlike`, data);
};

export const getAllSaved = (user_id) => {
  return `/articles/saved/${user_id}`;
};

export const getAllLiked = (user_id) => {
  return `/articles/liked/${user_id}`;
};
