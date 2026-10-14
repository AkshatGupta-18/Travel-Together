
import axios from "axios";

console.log("VITE_API_URL =", import.meta.env.VITE_API_URL);


const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: true,
});

console.log("Axios baseURL =", api.defaults.baseURL);


export default api;