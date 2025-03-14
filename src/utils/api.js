import axios from "axios";

const API = axios.create({
    baseURL: "https://prueba-bandejas-production.up.railway.app/api", // URL del backend
});

export default API;

