import axios from 'axios';

// IMPORTANT: In local development, replace this with your machine's IP address 
// to access the XAMPP server from a physical device or emulator.
const BASE_URL = 'http://localhost/FISH_MARKET/api'; 

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
