import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinkClass = ({ isActive }) =>
  `nav-link px-3 py-2 rounded mx-1 ${isActive ? 'bg-primary text-white' : 'text-light'}`;

export default function EmployeeLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4 py-3 shadow-sm">
        <span className="navbar-brand fw-bold">Employee Management</span>
        <div className="navbar-nav flex-row me-auto">
          <NavLink className={navLinkClass} to="/employee/dashboard">Dashboard</NavLink>
          <NavLink className={navLinkClass} to="/employee/profile">My Profile</NavLink>
          <NavLink className={navLinkClass} to="/employee/attendance">My Attendance</NavLink>
          <NavLink className={navLinkClass} to="/employee/leaves/apply">Apply Leave</NavLink>
          <NavLink className={navLinkClass} to="/employee/leaves/history">Leave History</NavLink>
        </div>
        <div className="d-flex align-items-center">
          <span className="badge bg-secondary bg-opacity-50 text-light me-3 px-3 py-2">
            {user?.username} · Employee
          </span>
          <button className="btn btn-outline-light btn-sm px-3" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>
      <div className="container-fluid p-4">
        <Outlet />
      </div>
    </div>
  );
}