import axios from 'axios';

// local express server
const WEB_URL = 'http://localhost:5000'; 

export const getHome = () => axios.get(`${WEB_URL}`);
export const getMessage = () => axios.get(`${WEB_URL}/message`);
export const sendMessage = (message) => {
    const response = axios.post(`${WEB_URL}/submit`, message);
    return response;
};