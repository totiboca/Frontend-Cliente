import React, { useState } from "react";
import API from "../utils/api";

const CambiarClave = () => {
    const [claveActual, setClaveActual] = useState("");
    const [claveNueva, setClaveNueva] = useState("");
    const [mensaje, setMensaje] = useState("");

    const handleChangePassword = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const response = await API.post("/auth/cambiar-clave", { claveActual, claveNueva }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMensaje(response.data.mensaje);
        } catch (error) {
            setMensaje("Error al cambiar la clave.");
        }
    };

    return (
        <div className="dashboard-container">
            <h2>Cambiar Clave</h2>
            <form onSubmit={handleChangePassword}>
                <input type="password" placeholder="Clave actual" value={claveActual} onChange={(e) => setClaveActual(e.target.value)} required />
                <input type="password" placeholder="Nueva clave" value={claveNueva} onChange={(e) => setClaveNueva(e.target.value)} required />
                <button type="submit">Actualizar Clave</button>
            </form>
            {mensaje && <p>{mensaje}</p>}
        </div>
    );
};

export default CambiarClave;
