import axios from "axios";
import { getToken } from "./storage";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5050";

export const api = axios.create({
  baseURL: `${baseURL}/api`
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

