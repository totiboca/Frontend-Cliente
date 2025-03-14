import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import "./Dashboard.css";

const Dashboard = () => {
    const navigate = useNavigate();
    const [movimientos, setMovimientos] = useState({});
    const [error, setError] = useState("");
    const [filtroRuta, setFiltroRuta] = useState("Todas");
    const [filtroFechaInicio, setFiltroFechaInicio] = useState("");
    const [filtroFechaFin, setFiltroFechaFin] = useState("");
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [filtroMes, setFiltroMes] = useState("");
    const [nombreCliente, setNombreCliente] = useState("");
    const [usuario, setUsuario] = useState(null);


    useEffect(() => {
        const obtenerPerfil = async () => {
            try {
                const response = await API.get("/auth/perfil", {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                console.log("Perfil obtenido:", response.data);
                setUsuario(response.data);
                setNombreCliente(response.data.nombre); // Guardamos el nombre del cliente
            } catch (error) {
                console.error("Error obteniendo perfil:", error);
            }
        };
        obtenerPerfil();
    }, []);
    
    
//




    useEffect(() => {
        const fetchMovimientos = async () => {
            try {
                const response = await API.get("api/clientes/movimientos", {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                console.log("Response:", response);
                console.log("Response data:", response.data);
                console.log("Datos de movimientos:", response.data?.movimientos);
                setMovimientos(response.data?.movimientos || {});
            } catch (err) {
                setError("Error al obtener datos");
            }
        };
        fetchMovimientos();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    const handleChangePassword = () => {
        navigate("/cambiar-clave");
    };

    const filtrarMovimientos = (movimientos) => {
        return Object.keys(movimientos)
            .filter((ruta) => filtroRuta === "Todas" || ruta === filtroRuta)
            .reduce((filtered, ruta) => {
                const movimientosFiltrados = movimientos[ruta].filter((mov) => {
                    const fechaMov = new Date(`${mov.fecha}T12:00:00Z`);

                    const inicio = filtroFechaInicio ? new Date(filtroFechaInicio) : null;
                    const fin = filtroFechaFin ? new Date(filtroFechaFin) : null;

                    // 📌 Filtrado por mes y año
                const mesMov = fechaMov.getMonth() + 1; // Mes en JS empieza desde 0
                const añoMov = fechaMov.getFullYear();

                let mesFiltro = filtroMes ? parseInt(filtroMes.split("-")[1]) : null;
                let añoFiltro = filtroMes ? parseInt(filtroMes.split("-")[0]) : null;
                console.log(`Fecha Mov: ${mov.fecha}, Mes: ${mesMov}, Año: ${añoMov}`);
                console.log(`Filtro Mes: ${mesFiltro}, Año Filtro: ${añoFiltro}`);

                return (
                    (!inicio || fechaMov >= inicio) &&
                    (!fin || fechaMov <= fin) &&
                    (!filtroMes || (mesMov === mesFiltro && añoMov === añoFiltro)) &&
                    (!filtroMes || (mesMov === mesFiltro && añoMov === añoFiltro))
                );
            });

                if (movimientosFiltrados.length > 0) {
                    filtered[ruta] = movimientosFiltrados;
                }
                return filtered;
            }, {});
    };

    const rutasDisponibles = Object.keys(movimientos);

    return (
        <div className="dashboard-container">
            {/* Encabezado con Menú de Usuario */}
            <div className="dashboard-header">
            <h2 style={{ color: "white" }}>{nombreCliente || "Dashboard"}</h2>
                <div className="menu-container">
                    <button className="menu-button" onClick={() => setMenuAbierto(!menuAbierto)}>
                        ☰ Menú
                    </button>
                    {menuAbierto && (
                        <div className="dropdown-menu">
                            <button onClick={handleChangePassword}>Cambiar Contraseña</button>
                            <button onClick={handleLogout}>Cerrar Sesión</button>
                        </div>
                    )}
                </div>
            </div>

            {error && <p className="error-message">{error}</p>}

            {/* Filtros */}
            <div className="filtros-container">
                <label>
                    Filtrar por ruta:
                    <select value={filtroRuta} onChange={(e) => setFiltroRuta(e.target.value)}>
                        <option value="Todas">Todas</option>
                        {rutasDisponibles.map((ruta) => (
                            <option key={ruta} value={ruta}>
                                {ruta}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Fecha inicio:
                    <input type="date" value={filtroFechaInicio} onChange={(e) => setFiltroFechaInicio(e.target.value)} />
                </label>
                <label>
                    Fecha fin:
                    <input type="date" value={filtroFechaFin} onChange={(e) => setFiltroFechaFin(e.target.value)} />
                </label>
                <label>
               Filtrar por mes:
             <input
               type="month"
                     value={filtroMes}
                     onChange={(e) => setFiltroMes(e.target.value)}
    />
</label>

            </div>
            {/* Resumen Total */}
            <div className="resumen-total">
                        <h3>Resumen Total</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Total Carga</th>
                                    <th>Total Devolución</th>
                                    <th>Saldo Final</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <strong>
                                            {Object.values(filtrarMovimientos(movimientos)).reduce(
                                                (acc, rutaMovs) => acc + rutaMovs.reduce((sum, mov) => sum + mov.lleva, 0),
                                                0
                                            )}
                                        </strong>
                                    </td>
                                    <td>
                                        <strong>
                                            {Object.values(filtrarMovimientos(movimientos)).reduce(
                                                (acc, rutaMovs) => acc + rutaMovs.reduce((sum, mov) => sum + mov.trae, 0),
                                                0
                                            )}
                                        </strong>
                                    </td>
                                    <td>
                                        <strong>
                                            {Object.values(filtrarMovimientos(movimientos)).reduce(
                                                (acc, rutaMovs) =>
                                                    acc +
                                                    rutaMovs.reduce((sum, mov) => sum + mov.lleva - mov.trae, 0),
                                                0
                                            )}
                                        </strong>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
            {/* Movimientos */}
            {Object.keys(filtrarMovimientos(movimientos)).length > 0 ? (
                <div className="movimientos-container">
                    {Object.keys(filtrarMovimientos(movimientos)).map((ruta) => {
                        let totalCargaRuta = 0;
                        let totalDevolucionRuta = 0;

                        return (
                            
                            <div key={ruta}>
                                <h3>Ruta: {ruta}</h3>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Fecha</th>
                                            <th>Carga</th>
                                            <th>Devolución</th>
                                            <th>Saldo Día</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtrarMovimientos(movimientos)[ruta].map((mov, index) => {
                                            totalCargaRuta += mov.lleva;
                                            totalDevolucionRuta += mov.trae;
                                            return (
                                                <tr key={index}>
                                                    <td>{mov.fecha}</td>
                                                    <td>{mov.lleva}</td>
                                                    <td>{mov.trae}</td>
                                                    <td>{mov.lleva - mov.trae}</td>
                                                </tr>
                                            );
                                        })}
                                        <tr className="totales-ruta">
                                            <td><strong>Total Ruta {ruta}</strong></td>
                                            <td><strong>{totalCargaRuta}</strong></td>
                                            <td><strong>{totalDevolucionRuta}</strong></td>
                                            <td><strong>{totalCargaRuta - totalDevolucionRuta}</strong></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        );
                    })}
                 {/* resumen total puede ir aca sino */}
                </div>
            ) : (
                <p>No hay movimientos registrados con los filtros aplicados.</p>
            )}
        </div>
    );
};

export default Dashboard;
