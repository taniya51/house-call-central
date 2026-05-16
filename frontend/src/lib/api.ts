import axios from "axios";

export const API_BASE = "https://positive-wholeness-production-f53c.up.railway.app/api";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("hs_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function safeRequest<T>(
  fn: () => Promise<{ data: T }>,
  fallback: () => T | Promise<T>,
): Promise<T> {
  try {
    const res = await fn();
    return res.data;
  } catch (err: unknown) {
    console.error("API call failed, using fallback:", err);
    return await fallback();
  }
}