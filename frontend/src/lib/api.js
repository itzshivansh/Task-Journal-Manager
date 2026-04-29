import axios from "axios";
import { getToken } from "./storage";

const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://task-journal-manager.onrender.com";

const API = axios.create({
  baseURL: `${baseURL}/api`
});

API.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;