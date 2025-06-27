import React, { useEffect, useState } from "react";
import { auth, db } from "../../../utils/firebaseConfig";
import {
  collection,
  getDocs,
  orderBy,
  query,
  limit,
  where,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom"; // ✅ Add this

const OrderHistory = ({ limitCount }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // ✅ Define navigate

  useEffect(() => {
    const fetchOrders = async () => {
      const user = auth.currentUser;

      if (!user) {
        console.warn("No user is authenticated.");
        setLoading(false);
        return;
      }

      console.log("Fetching orders for UID:", user.uid);

      try {
        const ordersRef = collection(db, "orders");

        let q = query(
          ordersRef,
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        if (typeof limitCount === "number") {
          q = query(q, limit(limitCount));
        }

        const snapshot = await getDocs(q);

        const orderList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Fetched orders:", orderList);
        setOrders(orderList);
      } catch (error) {
        console.error("Failed to fetch orders:", error.message || error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [limitCount]);

  const renderDate = (createdAt) => {
    if (!createdAt) return "N/A";
    try {
      return createdAt.toDate?.().toLocaleString?.() || createdAt;
    } catch {
      return "Invalid date";
    }
  };

  return (
    <div className="border rounded p-4">
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-md font-semibold">RECENT ORDERS</h3>
      </div>

      {loading ? (
        <p className="text-sm text-gray-600">Loading...</p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-gray-600">No orders available</p>
      ) : (
        <div className="text-sm text-gray-700 space-y-2">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border p-2 rounded cursor-pointer hover:bg-gray-50"
              onClick={() => navigate(`/orders/${order.id}`)} // ✅ Works now
            >
              <div><strong>Order ID:</strong> {order.id}</div>
              <div><strong>Total:</strong> ${Number(order.total || 0).toFixed(2)}</div>
              <div><strong>Status:</strong> {order.status || "Processing"}</div>
              <div><strong>Date:</strong> {renderDate(order.createdAt)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
