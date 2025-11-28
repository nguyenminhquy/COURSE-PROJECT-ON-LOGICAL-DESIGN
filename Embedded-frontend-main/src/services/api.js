import axios from "axios";

function get_tk() {
  const match = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("tk="));
  return match ? match.substring(3) : null;
}

function remove_tk() {
  document.cookie = "tk=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = get_tk();
    if (token) {
      config.headers["Authorization"] = "Bearer " + token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      remove_tk();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
