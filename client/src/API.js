import axios from 'axios';

axios.defaults.withCredentials = true;

// local express server
const WEB_URL = 'http://localhost:8080'; 

export const getMessage = () => axios.get(`${WEB_URL}/message`);

export const sendLoginCred = (loginCred) => {
    return axios.post(`${WEB_URL}/login`, loginCred);
};

export const checkEmail = (email) => {
    return axios.get(`${WEB_URL}/checkemail/${email}`);
};

export const sendSignupCred = (signupCred) => {
    return axios.post(`${WEB_URL}/signup`, signupCred);
};

export const LogOut = () => {
    return axios.post(`${WEB_URL}/logout`, { withCredentials: true });
};

export const Subscription = (email) => {
    return axios.post(`${WEB_URL}/subscribe/newsletter?email=${email}`);
};