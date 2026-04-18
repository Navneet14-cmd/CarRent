import { useState } from "react";
import AuthPage from "./AuthPage";
import VehicleBookingDashboard from "./VehicleBookingDashboard";
import AdminDashboard from "./components/AdminDashboard";
import OwnerDashboard from "./components/OwnerDashboard";

export default function App() {
console.log("App loaded");
  const [user, setUser] = useState(null);

  const handleAuth = (userData) => {
    console.log("handleAuth called with:", userData);
    setUser(userData);
  };

  if (!user) {
    return <AuthPage onAuth={handleAuth} />;
  }

  if (user.role === "admin" || user.role === "Admin" || user.role === "Super Admin") {
    return <AdminDashboard adminUser={user} onLogout={() => setUser(null)} />;
  }

  if (user.role === "owner" || user.role === "Owner") {
    return <OwnerDashboard currentUser={user} onLogout={() => setUser(null)} />;
  }

  return <VehicleBookingDashboard currentUser={user} onLogout={() => setUser(null)} />;
}
