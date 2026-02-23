import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout, isAdmin, isMechanic } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return <Outlet />;

  return (
    <div className="app-layout">
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to={isAdmin ? "/admin" : "/mechanic"}>AndreiSoft</Link>
        </div>
        <div className="navbar-links">
          {isAdmin && (
            <>
              <Link to="/admin" className="nav-link">Табло</Link>
              <Link to="/admin/heads/create" className="nav-link">Нова глава</Link>
              <Link to="/admin/users" className="nav-link">Потребители</Link>
              <Link to="/admin/service-needs" className="nav-link">Услуги</Link>
              <Link to="/admin/history" className="nav-link">История</Link>
              <Link to="/admin/reports" className="nav-link">Отчети</Link>
            </>
          )}
          {isMechanic && (
            <>
              <Link to="/mechanic" className="nav-link">Налични глави</Link>
              <Link to="/mechanic/my-heads" className="nav-link">Моите глави</Link>
              <Link to="/mechanic/history" className="nav-link">Моята история</Link>
              <Link to="/mechanic/reports" className="nav-link">Мой отчет</Link>
            </>
          )}
        </div>
        <div className="navbar-user">
          <span className="user-info">
            {user.firstName} {user.lastName}
            <span className="badge">{user.role}</span>
          </span>
          <Link to="/change-password" className="nav-link">Смяна на парола</Link>
          <button onClick={handleLogout} className="btn btn-sm btn-outline">
            Изход
          </button>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
