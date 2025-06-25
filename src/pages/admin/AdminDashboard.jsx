import React from "react";
import { Link } from "react-router-dom";
import AdminNavbar from "../../components/AdminNavbar";


const AdminDashboard = () => {
  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">Admin Panel</h2>
          <nav className="space-y-4 text-gray-700">
            <Link to="/admin/products" className="block hover:text-black">📦 Manage Products</Link>
            <Link to="/admin/orders" className="block hover:text-black">🧾 Manage Orders</Link>
            <Link to="/admin/users" className="block hover:text-black">👥 Manage Users</Link>
            <Link to="#" className="block hover:text-black">📊 View Reports</Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-semibold mb-6">Welcome, Admin</h1>
          <p className="text-gray-700 mb-4">Use the sidebar to manage your store.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard label="Total Products" value="134" />
            <StatCard label="Pending Orders" value="27" />
            <StatCard label="Users" value="382" />
            <StatCard label="Monthly Revenue" value="$12,450" />
          </div>
        </main>
      </div>
    </>
  );
};

const StatCard = ({ label, value }) => (
  <div className="bg-white rounded shadow-md p-4 text-center">
    <p className="text-sm text-gray-500">{label}</p>
    <h3 className="text-xl font-bold text-indigo-600">{value}</h3>
  </div>
);

export default AdminDashboard;
