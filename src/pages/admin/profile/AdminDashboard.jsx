import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import AdminNavbar from "../../../components/AdminNavbar";
import { useAuth } from "../../../context/AuthContext";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../utils/firebaseConfig";

const AdminDashboard = () => {
  const { currentUser } = useAuth();

  const [stats, setStats] = useState({
    totalProducts: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    declinedOrders: 0,
    users: 0,
    admins: 0,
    monthlyRevenue: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const [
          productsSnap,
          usersSnap,
          adminsSnap,
          pendingOrdersSnap,
          confirmedOrdersSnap,
          declinedOrdersSnap,
          allOrdersSnap
        ] = await Promise.all([
          getDocs(collection(db, "products")),
          getDocs(query(collection(db, "users"), where("role", "==", "user"))),
          getDocs(query(collection(db, "users"), where("role", "==", "admin"))),
          getDocs(query(collection(db, "orders"), where("status", "==", "Processing"))),
          getDocs(query(collection(db, "orders"), where("status", "==", "Completed"))),
          getDocs(query(collection(db, "orders"), where("status", "==", "Cancelled"))),
          getDocs(collection(db, "orders")),
        ]);

        let totalRevenue = 0;
        allOrdersSnap.forEach((doc) => {
          const data = doc.data();
          const createdAt = data?.createdAt?.toDate?.();
          const isThisMonth =
            createdAt &&
            createdAt.getMonth() === currentMonth &&
            createdAt.getFullYear() === currentYear;

          if (data.status !== "Cancelled" && isThisMonth) {
            totalRevenue += parseFloat(data.total) || 0;
          }
        });

        setStats({
          totalProducts: productsSnap.size,
          pendingOrders: pendingOrdersSnap.size,
          confirmedOrders: confirmedOrdersSnap.size,
          declinedOrders: declinedOrdersSnap.size,
          users: usersSnap.size,
          admins: adminsSnap.size,
          monthlyRevenue: totalRevenue,
        });
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      }
    };

    fetchStats();
  }, []);

  if (currentUser?.role !== "admin") return <Navigate to="/" />;

  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">Admin Panel</h2>
          <nav className="space-y-4 text-gray-700">
            <Link to="/admin/products" className="block hover:text-black">Manage Products</Link>
            <Link to="/admin/orders" className="block hover:text-black">Manage Orders</Link>
            <Link to="/admin/orders/confirmed" className="block hover:text-black">Confirmed Orders</Link>
            <Link to="/admin/orders/declined" className="block hover:text-black">Declined Orders</Link>
            <Link to="/admin/users" className="block hover:text-black">Manage Users</Link>
            <Link to="/admin/enquiries" className="block hover:text-black">Manage Enquiries</Link>
            <Link to="/admin/chat" className="block hover:text-black">Manage Chat</Link>
            <Link to="/admin/reports" className="block hover:text-black">View Reports</Link>
            <Link to="/admin/admin-change-password" className="block hover:text-black">Change Password</Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-semibold mb-6">Welcome, Admin</h1>
          <p className="text-gray-700 mb-4">Use the sidebar to manage your store.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard label="Total Products" value={stats.totalProducts} />
            <StatCard label="Processing Orders" value={stats.pendingOrders} />
            <StatCard label="Confirmed Orders" value={stats.confirmedOrders} />
            <StatCard label="Declined Orders" value={stats.declinedOrders} />
            <StatCard label="Users" value={stats.users} />
            <StatCard label="Admins" value={stats.admins} />
            <StatCard
              label="Monthly Revenue"
              value={`$${stats.monthlyRevenue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
            />
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
