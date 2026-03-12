import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Monitoramento from "./pages/Monitoramento";
import AtosNormativos from "./pages/AtosNormativos";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/monitoramento" element={<Monitoramento />} />
                <Route path="/atos-normativos" element={<AtosNormativos />} />
                <Route path="/notificacoes" element={<div className="p-4">Notificações em breve</div>} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
