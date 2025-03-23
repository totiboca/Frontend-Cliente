import React, { useState } from "react";
import API from "../utils/api";
import { useNavigate } from "react-router-dom";
import "../styles.css"; // Asegúrate de que los estilos están importados
import bimboLogo from "../assets/bimbo.webp"; // <-- Ruta a tu imagen


const Login = () => {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState("");
    const [clave, setClave] = useState("");
    const [confirmarClave, setConfirmarClave] = useState("");
    const [idCliente, setIdCliente] = useState("");
    const [error, setError] = useState("");
    const [registro, setRegistro] = useState(false);

    // **Función para manejar el inicio de sesión**
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await API.post("/auth/login", { usuario, clave });
            localStorage.setItem("token", response.data.token);
            navigate("/dashboard");
        } catch (err) {
            setError("Usuario o clave incorrectos.");
        }
    };

    // **Función para manejar el registro**
    const handleRegistro = async (e) => {
        e.preventDefault();
        if (clave !== confirmarClave) {
            setError("Las contraseñas no coinciden.");
            return;
        }
        try {
            await API.post("/auth/registro", { usuario, clave, id_cliente: idCliente });
            setRegistro(false);
            setError("");
        } catch (err) {
            setError("Error al registrar usuario.");
        }
    };

    return (
        <div className="login-container">
              <img src={bimboLogo} alt="Bimbo Logo" className="bimbo-logo" />
            <h2>{registro ? "Registro de Usuario" : "Inicio de Sesión"}</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={registro ? handleRegistro : handleLogin} className="login-form">
                {registro && (
                    <input 
                        type="text" 
                        placeholder="ID Cliente" 
                        value={idCliente} 
                        onChange={(e) => setIdCliente(e.target.value)} 
                        required 
                    />
                )}
                <input 
                    type="text" 
                    placeholder="Usuario" 
                    value={usuario} 
                    onChange={(e) => setUsuario(e.target.value)} 
                    required 
                />
                <input 
                    type="password" 
                    placeholder="Contraseña" 
                    value={clave} 
                    onChange={(e) => setClave(e.target.value)} 
                    required 
                />
                {registro && (
                    <input 
                        type="password" 
                        placeholder="Confirmar Contraseña" 
                        value={confirmarClave} 
                        onChange={(e) => setConfirmarClave(e.target.value)} 
                        required 
                    />
                )}
                <button type="submit">{registro ? "Registrarse" : "Iniciar Sesión"}</button>
            </form>
            <p onClick={() => setRegistro(!registro)} className="toggle">
                {registro ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
            </p>
        </div>
    );
};

export default Login;
