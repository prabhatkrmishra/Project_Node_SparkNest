import axios from 'axios';

axios.defaults.withCredentials = true;

// local express server
const WEB_URL = 'http://localhost:8080'; 

export const getMessage = () => axios.get(`${WEB_URL}/message`);

export const sendLoginCred = (loginCred) => {
    return axios.post(`${WEB_URL}/login`, loginCred);
};

export const checkEmail = (email) => {
    return axios.get(`${WEB_URL}/check/email/${email}`);
};

export const checkUserName = (uname) => {
    return axios.get(`${WEB_URL}/check/username/${uname}`);
};

export const sendSignupCred = (signupCred) => {
    return axios.post(`${WEB_URL}/signup`, signupCred);
};

export const updateSignupDetails = (signupDetails) => {
    return axios.patch(`${WEB_URL}/user/details`, signupDetails, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

export const LogOut = () => {
    return axios.post(`${WEB_URL}/logout`, { withCredentials: true });
};

export const Subscription = (email) => {
    return axios.post(`${WEB_URL}/subscribe/newsletter?email=${email}`);
};