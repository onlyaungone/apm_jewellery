import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import Navbar from "./components/Navbar";
import MyAccount from "./pages/account/MyAccount";
import MyDetails from "./pages/account/MyDetails";
import ChangePassword from "./pages/account/ChangePassword";
import AddressBook from "./pages/account/address/AddressBook";
import AddAddress from "./pages/account/address/AddAddress";
import EditAddress from "./pages/account/address/EditAddress";
import AdminDashboard from "./pages/admin/AdminDashboard";
import { useAuth } from "./context/AuthContext";
import AdminProducts from "./pages/admin/products/AdminProducts";
import AddProduct from "./pages/admin/products/AddProduct";

function App() {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminRoute = location.pathname.startsWith("/admin");

  // ✅ Log Firebase Auth state (email + UID)
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("✅ Logged in user email:", user.email);
        console.log("✅ Logged in user UID:", user.uid);
      } else {
        console.log("❌ No user is logged in");
      }
    });
    return () => unsubscribe();
  }, []);

  // ⛳ Redirect admin to /admin if at root
  useEffect(() => {
    if (!loading && currentUser?.role === "admin" && location.pathname === "/") {
      navigate("/admin");
    }
  }, [loading, currentUser, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl font-semibold">Loading user info...</p>
      </div>
    );
  }

  return (
    <>
      {!isAdminRoute && <Navbar />}

      <Routes>
        <Route
          path="/"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
              <h2 className="text-white text-4xl font-bold">Welcome to APM Jewellery 💎</h2>
            </div>
          }
        />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/account" element={<MyAccount />} />
        <Route path="/details" element={<MyDetails />} />
        <Route path="/password" element={<ChangePassword />} />
        <Route path="/address-book" element={<AddressBook />} />
        <Route path="/add-address" element={<AddAddress />} />
        <Route path="/edit-address/:id" element={<EditAddress />} />

        {/* 🔐 Admin Protected Routes */}
        <Route
          path="/admin"
          element={currentUser?.role === "admin" ? <AdminDashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/admin/products"
          element={currentUser?.role === "admin" ? <AdminProducts /> : <Navigate to="/" />}
        />
        <Route
          path="/admin/products/add"
          element={currentUser?.role === "admin" ? <AddProduct /> : <Navigate to="/" />}
        />
      </Routes>
    </>
  );
}

export default function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}
