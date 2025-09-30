// eslint-disable-next-line no-unused-vars
import axios from "axios";
import { WEB_URL } from "./API";

export const getArticlePreviews = () => {
  return (`${WEB_URL}/article/previews`);
};

export const getArticlePreviewsCategory = (category) => {
  return (`${WEB_URL}/article/previews/category/${category}`);
};

export const getProfileArticlePreviews = (id) => {
  return (`${WEB_URL}/article/profile/preview/${id}`)
};
