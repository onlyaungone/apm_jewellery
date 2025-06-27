import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../utils/firebaseConfig";
import AdminNavbar from "../../../components/AdminNavbar";

const DeclinedOrders = () => {
  const [declinedOrders, setDeclinedOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeclinedOrders = async () => {
      try {
        const q = query(
          collection(db, "orders"),
          where("status", "==", "Cancelled")
        );
        const querySnapshot = await getDocs(q);
        const orders = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDeclinedOrders(orders);
      } catch (error) {
        console.error("Error fetching declined orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeclinedOrders();
  }, []);

  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-2xl font-bold mb-4">Declined Orders</h1>

        {loading ? (
          <p>Loading...</p>
        ) : declinedOrders.length === 0 ? (
          <p>No declined orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded shadow">
              <thead>
                <tr className="bg-gray-200 text-left text-sm font-semibold">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {declinedOrders.map((order) => (
                  <tr key={order.id} className="border-t">
                    <td className="p-4">{order.id}</td>
                    <td className="p-4">{order.customerName || "N/A"}</td>
                    <td className="p-4">${order.total?.toFixed(2)}</td>
                    <td className="p-4 text-red-500 font-medium">
                      {order.status}
                    </td>
                    <td className="p-4">
                      {order.createdAt?.toDate
                        ? order.createdAt.toDate().toLocaleString()
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default DeclinedOrders;
