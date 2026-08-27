import { api, WEB_URL } from "./API";

export const fetchComments = (article_id) => {
  return api.get(`/comment/fetch/${article_id}`);
};

export const createComment = (article_id, comment) => {
  return api.post(`/comment/create/${article_id}`, comment, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const dropComment = (comment_id) => {
  return api.delete(`/comment/delete/${comment_id}`);
};

// Keep WEB_URL export for backward compat if needed
export { WEB_URL };
