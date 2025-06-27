import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../utils/firebaseConfig";
import { format } from "date-fns";

const UserOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const docRef = doc(db, "orders", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setOrder({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (err) {
        console.error("Failed to fetch order details", err);
      }
    };

    fetchOrder();
  }, [id]);

  if (!order) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Your Order Details</h2>
      <div className="bg-white p-4 shadow rounded">
        <p><strong>Order ID:</strong> {order.id}</p>
        <p><strong>Status:</strong> {order.status || "Processing"}</p>
        <p><strong>Total:</strong> ${Number(order.total || 0).toFixed(2)}</p>
        <p>
          <strong>Date:</strong>{" "}
          {order.createdAt?.toDate ? format(order.createdAt.toDate(), "dd/MM/yyyy hh:mm a") : "N/A"}
        </p>

        <h3 className="text-xl mt-4 font-semibold">Items:</h3>
        <ul className="mt-2 space-y-2">
          {(order.items || []).map((item, index) => (
            <li key={index} className="border p-2 rounded">
              <p><strong>Product:</strong> {item.productName || "N/A"}</p>
              <p><strong>Size:</strong> {item.size || "N/A"}</p>
              <p><strong>Quantity:</strong> {item.quantity || 0}</p>
              <p><strong>Price:</strong> ${Number(item.price || 0).toFixed(2)}</p>
              <p><strong>Discount:</strong> {item.discount || 0}%</p>
            </li>
          ))}
        </ul>

        {order.address && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold">Shipping Address:</h3>
            <p>{order.address.firstName} {order.address.lastName}</p>
            <p>{order.address.address1}</p>
            <p>{order.address.suburb}, {order.address.town}, {order.address.postalCode}</p>
            <p>{order.address.country}</p>
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={() => navigate("/orders")}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
          >
            ← Back to Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserOrderDetails;
