import axios from "axios";

const axiosPublic = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://10.10.7.109:1000/api/v1",
});

export default axiosPublic;
