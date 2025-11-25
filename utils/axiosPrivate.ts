// lib/api/axiosPrivate.ts
import axios from "axios";

const axiosPrivate = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://10.10.7.109:1000/api/v1",
    headers: { "Content-Type": "application/json" },
});

// Store for cleanup
let isRedirecting = false;

axiosPrivate.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosPrivate.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && !isRedirecting) {
            isRedirecting = true;
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");
            // Redirect to login with return URL
            const currentPath = window.location.pathname;
            window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
        return Promise.reject(error);
    }
);

export default axiosPrivate;
