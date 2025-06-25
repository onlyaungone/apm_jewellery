import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../utils/firebaseConfig";

const AdminNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <Link to="/admin" className="text-2xl font-bold">
        APM Admin
      </Link>

      <ul className="flex gap-6 text-sm font-medium">
        <li>
          <Link to="/admin/products" className="hover:text-indigo-400 transition">Products</Link>
        </li>
        <li>
          <Link to="/admin/orders" className="hover:text-indigo-400 transition">Orders</Link>
        </li>
        <li>
          <Link to="/admin/users" className="hover:text-indigo-400 transition">Users</Link>
        </li>
        <li>
          <button onClick={handleLogout} className="hover:text-red-400 transition">Logout</button>
        </li>
      </ul>
    </nav>
  );
};

export default AdminNavbar;
