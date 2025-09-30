import axios from "axios";
import { WEB_URL } from "./API";

export const fetchComments = (article_id) => {
  return axios.get(`${WEB_URL}/comment/fetch/${article_id}`);
};

export const createComment = (article_id, comment) => {
  return axios.post(`${WEB_URL}/comment/create/${article_id}`, comment, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const dropComment = (comment_id) => {
  return axios.delete(`${WEB_URL}/comment/delete/${comment_id}`);
};
