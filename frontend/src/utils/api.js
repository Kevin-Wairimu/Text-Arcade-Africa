import axios from 'axios';

// The baseURL should point to the root of your server.
// DO NOT add /api here.
const API = axios.create({
  baseURL: 'http://localhost:5000'
});

export default API;