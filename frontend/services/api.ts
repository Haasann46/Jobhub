import axios from "axios";
import { API_URL } from "@/constants/api";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    console.log("BASE URL:", config.baseURL);
    console.log("URL:", config.url);
    console.log("FULL:", `${config.baseURL}${config.url}`);
    return config;
});

export default api;