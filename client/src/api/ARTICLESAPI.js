import { api, WEB_URL } from "./API";

export const getArticlePreviews = () => {
  return `${WEB_URL}/article/previews`;
};

export const getArticlePreviewsCategory = (category) => {
  return `${WEB_URL}/article/preview/category/${category}`;
};

export const getProfileArticlePreviews = (id) => {
  return `${WEB_URL}/article/profile/preview/${id}`;
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
  return `${WEB_URL}/articles/saved/${user_id}`;
};

export const getAllLiked = (user_id) => {
  return `${WEB_URL}/articles/liked/${user_id}`;
};
