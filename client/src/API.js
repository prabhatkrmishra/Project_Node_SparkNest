import axios from 'axios';

// local express server
const WEB_URL = 'http://localhost:5000'; 

export const getMessage = () => axios.get(`${WEB_URL}/message`);

export const sendLoginCred = (loginCred) => {
    return axios.post(`${WEB_URL}/login`, loginCred);
};

export const sendSignupCred = (signupCred) => {
    return axios.post(`${WEB_URL}/signup`, signupCred);
};

export const sendMessage = (message) => {
    const response = axios.post(`${WEB_URL}/submit`, message);
    return response;
};