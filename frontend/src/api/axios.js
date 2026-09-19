import axios from "axios";

// Use whatever hostname the browser is currently on
const backendHost = window.location.hostname; // "localhost" or "192.168.0.103"

const api = axios.create({
  baseURL: `http://${backendHost}:5000/api`,
  withCredentials: true,
});

export default api;