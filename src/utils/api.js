import axios from "axios";

const API = axios.create({
    baseURL: "prueba-bandejas-production.up.railway.app", // URL del backend
});

export default API;

