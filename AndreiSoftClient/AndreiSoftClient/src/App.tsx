import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import CreateHeadForm from "./pages/CreateHeadForm";
import EditHeadForm from "./pages/EditHeadForm";
import AdminHeadDetails from "./pages/AdminHeadDetails";
import UserManagement from "./pages/UserManagement";
import ServiceNeedsManagement from "./pages/ServiceNeedsManagement";
import AdminHistoryPage from "./pages/AdminHistoryPage";
import MechanicIndex from "./pages/MechanicIndex";
import MechanicHeadDetails from "./pages/MechanicHeadDetails";
import MechanicHistoryPage from "./pages/MechanicHistoryPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import "./App.css";

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: string }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/login" />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === "Administrator" ? "/admin" : "/mechanic"} /> : <LoginPage />} />

      <Route element={<Layout />}>
        {/* Admin routes */}
        <Route path="/admin" element={<ProtectedRoute role="Administrator"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/heads/create" element={<ProtectedRoute role="Administrator"><CreateHeadForm /></ProtectedRoute>} />
        <Route path="/admin/heads/:id" element={<ProtectedRoute role="Administrator"><AdminHeadDetails /></ProtectedRoute>} />
        <Route path="/admin/heads/:id/edit" element={<ProtectedRoute role="Administrator"><EditHeadForm /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute role="Administrator"><UserManagement /></ProtectedRoute>} />
        <Route path="/admin/service-needs" element={<ProtectedRoute role="Administrator"><ServiceNeedsManagement /></ProtectedRoute>} />
        <Route path="/admin/history" element={<ProtectedRoute role="Administrator"><AdminHistoryPage /></ProtectedRoute>} />

        {/* Mechanic routes */}
        <Route path="/mechanic" element={<ProtectedRoute role="Mechanic"><MechanicIndex /></ProtectedRoute>} />
        <Route path="/mechanic/heads/:id" element={<ProtectedRoute role="Mechanic"><MechanicHeadDetails /></ProtectedRoute>} />
        <Route path="/mechanic/history" element={<ProtectedRoute role="Mechanic"><MechanicHistoryPage /></ProtectedRoute>} />

        {/* Shared */}
        <Route path="/change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

