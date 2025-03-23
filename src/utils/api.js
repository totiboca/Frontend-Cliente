import axios from "axios";

const API = axios.create({
    // baseURL: "https://prueba-bandejas-production.up.railway.app/api", // URL del backend
    baseURL: "http://localhost:5000/api" // Ajusta el puerto según tu configuración local
});

export default API;