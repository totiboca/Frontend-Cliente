import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Estados generales
  const [movimientos, setMovimientos] = useState({});
  const [error, setError] = useState("");
  const [filtroRuta, setFiltroRuta] = useState("Todas");
  const [filtroFechaInicio, setFiltroFechaInicio] = useState("");
  const [filtroFechaFin, setFiltroFechaFin] = useState("");
  const [filtroMes, setFiltroMes] = useState("");
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [nombreCliente, setNombreCliente] = useState("");
  const [usuario, setUsuario] = useState(null);

  // Estado para el filtro "Tipo" cuando el usuario es "Ambos"
  const [filtroTipo, setFiltroTipo] = useState("Cliente"); // valores: "Cliente" o "Operador Logístico"

  // Obtener perfil
  useEffect(() => {
    const obtenerPerfil = async () => {
      try {
        const response = await API.get("/auth/perfil", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUsuario(response.data); // debe incluir: { id_cliente, tipo, nombre, ... }
        setNombreCliente(response.data.nombre);
      } catch (error) {
        console.error("Error obteniendo perfil:", error);
      }
    };
    obtenerPerfil();
  }, []);

  // Obtener movimientos
  useEffect(() => {
    const fetchMovimientos = async () => {
      try {
        const response = await API.get("/clientes/movimientos", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
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

  // Función de filtrado de movimientos según fechas y ruta
  const filtrarMovimientos = (movs) => {
    if (!movs) return {};
    const rutasFiltradas = {};
    Object.keys(movs).forEach((id_ruta) => {
      const { nombre_ruta, datos } = movs[id_ruta];
      const datosFiltrados = datos.filter((mov) => {
        const fechaMov = new Date(`${mov.fecha}T12:00:00Z`);
        const inicio = filtroFechaInicio ? new Date(filtroFechaInicio) : null;
        const fin = filtroFechaFin ? new Date(filtroFechaFin) : null;
        const mesMov = fechaMov.getMonth() + 1;
        const añoMov = fechaMov.getFullYear();
        let mesFiltro = filtroMes ? parseInt(filtroMes.split("-")[1]) : null;
        let añoFiltro = filtroMes ? parseInt(filtroMes.split("-")[0]) : null;
        return (
          (!inicio || fechaMov >= inicio) &&
          (!fin || fechaMov <= fin) &&
          (!filtroMes || (mesMov === mesFiltro && añoMov === añoFiltro))
        );
      });
      if ((filtroRuta === "Todas" || filtroRuta === id_ruta) && datosFiltrados.length > 0) {
        rutasFiltradas[id_ruta] = {
          nombre_ruta,
          datos: datosFiltrados,
        };
      }
    });
    return rutasFiltradas;
  };

  // Totales globales
  const movimientosFiltrados = filtrarMovimientos(movimientos);
  const totalCargaGlobal = Object.values(movimientosFiltrados).reduce(
    (acc, ruta) => acc + ruta.datos.reduce((sum, mov) => sum + mov.lleva, 0),
    0
  );
  const totalDevolucionGlobal = Object.values(movimientosFiltrados).reduce(
    (acc, ruta) => acc + ruta.datos.reduce((sum, mov) => sum + mov.trae, 0),
    0
  );
  const saldoGlobal = totalCargaGlobal - totalDevolucionGlobal;

  // Helper para calcular totales por ruta
  function calcularTotales(datos) {
    let totalCarga = 0;
    let totalDevolucion = 0;
    datos.forEach((mov) => {
      totalCarga += mov.lleva;
      totalDevolucion += mov.trae;
    });
    return { totalCarga, totalDevolucion, saldo: totalCarga - totalDevolucion };
  }

  // Vista para Cliente normal
  function VistaCliente({ movs }) {
    if (Object.keys(movs).length === 0) return <p>No hay movimientos para mostrar.</p>;
    return (
      <div className="movimientos-container">
        {Object.keys(movs).map((id_ruta) => {
          let totalCargaRuta = 0;
          let totalDevolucionRuta = 0;
          return (
            <div key={id_ruta}>
              <h3>Ruta: {id_ruta} - {movs[id_ruta].nombre_ruta}</h3>
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
                  {movs[id_ruta].datos.map((mov, index) => {
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
                    <td><strong>Total Ruta {id_ruta}</strong></td>
                    <td><strong>{totalCargaRuta}</strong></td>
                    <td><strong>{totalDevolucionRuta}</strong></td>
                    <td><strong>{totalCargaRuta - totalDevolucionRuta}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    );
  }

  // Vista para Operador Logístico
  function VistaOperadorLogistico({ movs }) {
    const [rutaSeleccionada, setRutaSeleccionada] = useState(null);
    if (rutaSeleccionada) {
      const { nombre_ruta, datos } = movs[rutaSeleccionada];
      return (
        <div>
          <h3>Detalle de la Ruta: {nombre_ruta} (ID: {rutaSeleccionada})</h3>
          <button onClick={() => setRutaSeleccionada(null)}>Volver</button>
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
              {datos.map((mov, i) => (
                <tr key={i}>
                  <td>{mov.fecha}</td>
                  <td>{mov.lleva}</td>
                  <td>{mov.trae}</td>
                  <td>{mov.lleva - mov.trae}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    const rutas = Object.keys(movs);
    if (rutas.length === 0) return <p>No hay rutas como Operador Logístico.</p>;
    return (
      <div>
        <h3>Resumen de Rutas (Operador Logístico)</h3>
        <table>
          <thead>
            <tr>
              <th>Ruta</th>
              <th>Nombre de Ruta</th>
              <th>Total Carga</th>
              <th>Total Devolución</th>
              <th>Saldo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rutas.map((id_ruta) => {
              const { nombre_ruta, datos } = movs[id_ruta];
              const { totalCarga, totalDevolucion, saldo } = calcularTotales(datos);
              return (
                <tr key={id_ruta}>
                  <td>{id_ruta}</td>
                  <td>{nombre_ruta}</td>
                  <td>{totalCarga}</td>
                  <td>{totalDevolucion}</td>
                  <td>{saldo}</td>
                  <td>
                    <button onClick={() => setRutaSeleccionada(id_ruta)}>Ver Detalle</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  // Vista para usuarios de tipo Ambos, con filtro "Tipo"
  function VistaAmbos({ movs, idCliente }) {
    // Usamos el filtro filtroTipo para decidir qué vista mostrar
    if (filtroTipo === "Cliente") {
      // Filtramos movimientos donde el usuario es cliente
      const movsCliente = {};
      Object.keys(movs).forEach((id_ruta) => {
        const { nombre_ruta, datos } = movs[id_ruta];
        // Revisamos el primer movimiento (se asume que toda la ruta es consistente)
        if (datos[0].id_cliente_ruta === idCliente) {
          movsCliente[id_ruta] = { nombre_ruta, datos };
        }
      });
      return <VistaCliente movs={movsCliente} />;
    } else if (filtroTipo === "Operador Logístico") {
      // Filtramos movimientos donde el usuario es operador logístico
      const movsFletero = {};
      Object.keys(movs).forEach((id_ruta) => {
        const { nombre_ruta, datos } = movs[id_ruta];
        if (datos[0].id_fletero_ruta === idCliente) {
          movsFletero[id_ruta] = { nombre_ruta, datos };
        }
      });
      return <VistaOperadorLogistico movs={movsFletero} />;
    } else {
      return <p>Tipo no definido.</p>;
    }
  }

  // Render principal
  const tipoUsuario = usuario?.tipo; // "Cliente", "Operador Logistico", "Ambos"
  return (
    <div className="dashboard-container">
      {/* Encabezado */}
      <div className="dashboard-header">
        <h2>{nombreCliente || "Dashboard"}</h2>
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

      {/* Filtros generales */}
      <div className="filtros-container">
        <label>
          Rutas:
          <select value={filtroRuta} onChange={(e) => setFiltroRuta(e.target.value)}>
            <option value="Todas">Todas</option>
            {Object.keys(movimientos).map((ruta) => (
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
          <input type="month" value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)} />
        </label>
        {/* Filtro extra para tipo en "Ambos" */}
        {tipoUsuario === "Ambos" && (
          <label>
            Tipo:
            <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
              <option value="Cliente">Cliente</option>
              <option value="Operador Logístico">Operador Logístico</option>
            </select>
          </label>
        )}
      </div>
      
      

      {/* Mostrar movimientos según tipo de usuario */}
      {tipoUsuario === "Cliente" && (
        <VistaCliente movs={movimientosFiltrados} />
      )}
      {tipoUsuario === "Operador Logistico" && (
        <VistaOperadorLogistico movs={movimientosFiltrados} />
      )}
      {tipoUsuario === "Ambos" && (
        <VistaAmbos movs={movimientosFiltrados} idCliente={usuario?.id_cliente} />
      )}
      {!tipoUsuario && <p>No hay movimientos registrados.</p>}

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
              <td><strong>{totalCargaGlobal}</strong></td>
              <td><strong>{totalDevolucionGlobal}</strong></td>
              <td><strong>{saldoGlobal}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>


    </div>
  );
};

export default Dashboard;
