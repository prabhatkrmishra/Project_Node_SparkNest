import axios from "axios";
import { WEB_URL } from "./API";

export const sendMessage = (body) => {
  return axios.post(`${WEB_URL}/send/message`, body, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};