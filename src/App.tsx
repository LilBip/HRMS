import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Departments from "./pages/Departments";
import Login from "./pages/Login";
import ActivityLogPage from "./pages/ActivityLog";
import RequestForms from "./pages/RequestForms";
import Profile from "./pages/Profile";
import Attendance from "./pages/Attendance"; // ✅ Thêm dòng này

import MainLayout from "./layout/MainLayout";
import { useAuth } from "./contexts/AuthContexts";
import "../src/index.css";

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" />}
        >
          <Route index element={<Dashboard />} />
          <Route path="employees" element={<Employees />} />
          <Route path="departments" element={<Departments />} />
          <Route path="activity-log" element={<ActivityLogPage />} />
          <Route path="requests" element={<RequestForms />} />
          <Route path="attendance" element={<Attendance />} /> {/* ✅ Route mới */}
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/" : "/login"} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
