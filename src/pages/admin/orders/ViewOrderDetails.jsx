import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../utils/firebaseConfig";
import { format } from "date-fns";
import toast from "react-hot-toast";

const ViewOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [updating, setUpdating] = useState(false);

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

  const handleBack = () => navigate("/admin/orders");

  const handleConfirm = async () => {
    if (!order || order.status !== "Processing") return;
    setUpdating(true);
    try {
      for (const item of order.items || []) {
        const productRef = doc(db, "products", item.productId);
        const productSnap = await getDoc(productRef);
        if (productSnap.exists()) {
          const currentStock = productSnap.data().stock || 0;
          const newStock = Math.max(currentStock - item.quantity, 0);
          await updateDoc(productRef, { stock: newStock });
        }
      }

      await updateDoc(doc(db, "orders", order.id), { status: "Completed" });
      setOrder((prev) => ({ ...prev, status: "Completed" }));
      toast.success("Order confirmed and stock updated.");
    } catch (err) {
      console.error("Error confirming order:", err);
      toast.error("Failed to confirm order.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDecline = async () => {
    if (!order || order.status !== "Processing") return;
    setUpdating(true);
    try {
      await updateDoc(doc(db, "orders", order.id), { status: "Cancelled" });
      setOrder((prev) => ({ ...prev, status: "Cancelled" }));
      toast.success("Order declined.");
    } catch (err) {
      console.error("Error declining order:", err);
      toast.error("Failed to decline order.");
    } finally {
      setUpdating(false);
    }
  };

  if (!order) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Order Details</h2>
      <div className="bg-white p-4 shadow rounded">
        <p><strong>Order ID:</strong> {order.id}</p>
        <p><strong>User ID:</strong> {order.userId}</p>
        <p><strong>Status:</strong> {order.status}</p>
        <p><strong>Total:</strong> ${Number(order.total).toFixed(2)}</p>
        <p><strong>Date:</strong> {order.createdAt?.toDate ? format(order.createdAt.toDate(), "dd/MM/yyyy hh:mm a") : "N/A"}</p>

        <h3 className="text-xl mt-4 font-semibold">Items:</h3>
        <ul className="mt-2 space-y-2">
          {order.items?.map((item, index) => (
            <li key={index} className="border p-2 rounded">
              <p><strong>Product:</strong> {item.productName}</p>
              <p><strong>Size:</strong> {item.size}</p>
              <p><strong>Quantity:</strong> {item.quantity}</p>
              <p><strong>Price:</strong> ${item.price}</p>
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

        <div className="mt-6 flex space-x-3">
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-gray-600 text-white rounded"
          >
            ← Back
          </button>

          <button
            onClick={handleConfirm}
            disabled={order.status !== "Processing" || updating}
            className={`px-4 py-2 rounded text-white ${
              order.status !== "Processing" ? "bg-gray-400 cursor-not-allowed" : "bg-green-600"
            }`}
          >
            Confirm
          </button>

          <button
            onClick={handleDecline}
            disabled={order.status !== "Processing" || updating}
            className={`px-4 py-2 rounded text-white ${
              order.status !== "Processing" ? "bg-gray-400 cursor-not-allowed" : "bg-red-600"
            }`}
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewOrderDetails;
