import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:3300/api',
});


// it will Add JWT token to every request
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }

    return req;
});




export default API;
