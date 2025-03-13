import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import CambiarClave from "./pages/CambiarClave";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/cambiar-clave" element={<CambiarClave />} />
            </Routes>
        </Router>
    );
}

export default App;

