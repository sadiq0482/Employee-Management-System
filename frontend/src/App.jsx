import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import EmployeeLayout from './components/EmployeeLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeList from './pages/EmployeeList';
import AddEmployee from './pages/AddEmployee';
import EditEmployee from './pages/EditEmployee';
import DepartmentList from './pages/DepartmentList';
import LeaveRequests from './pages/LeaveRequests';
import ApplyLeave from './pages/ApplyLeave';
import LeaveHistory from './pages/LeaveHistory';
import Profile from './pages/Profile';
import MyAttendance from './pages/MyAttendance';
import AdminAttendance from './pages/AdminAttendance';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="employees" element={<EmployeeList />} />
            <Route path="employees/add" element={<AddEmployee />} />
            <Route path="employees/:id/edit" element={<EditEmployee />} />
            <Route path="departments" element={<DepartmentList />} />
            <Route path="leaves" element={<LeaveRequests />} />
            <Route path="attendance" element={<AdminAttendance />} />
          </Route>

          <Route
            path="/employee"
            element={
              <ProtectedRoute requiredRole="EMPLOYEE">
                <EmployeeLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<EmployeeDashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="attendance" element={<MyAttendance />} />
            <Route path="leaves/apply" element={<ApplyLeave />} />
            <Route path="leaves/history" element={<LeaveHistory />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;