import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../../utils/firebaseConfig";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../../../components/AdminNavbar";
import { toast } from "react-hot-toast";

const ManageOrders = () => {

  const calculateTotalFromItems = (items = []) => {
  return items.reduce((sum, item) => {
    const quantity = Number(item.quantity) || 0;
    const price = Number(item.price) || 0;
    const discount = Number(item.discount) || 0;
    const discountedPrice = price * (1 - discount / 100);
    return sum + quantity * discountedPrice;
  }, 0);
};

  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const fetchedOrders = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(fetchedOrders);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const totalMatch = order.total?.toString().includes(searchTerm);
    const createdAtMatch = order.createdAt?.toDate &&
      format(order.createdAt.toDate(), "dd/MM/yyyy hh:mm a").includes(searchTerm);
    return (
      order.id.includes(searchTerm) ||
      order.userId.includes(searchTerm) ||
      totalMatch ||
      createdAtMatch
    );
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortField === "total") {
      return b.total - a.total;
    } else if (sortField === "createdAt") {
      return b.createdAt?.seconds - a.createdAt?.seconds;
    }
    return 0;
  });

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = sortedOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getStatusColor = (status) => {
    switch (status) {
      case "Processing": return "text-yellow-600";
      case "Completed": return "text-green-600";
      case "Cancelled": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const handleConfirm = async (order) => {
    try {
        for (const item of order.items || []) {
        const productRef = doc(db, "products", item.productId);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
            const productData = productSnap.data();
            const sizes = productData.sizes || [];

            // Find the size object and update its quantity
            const updatedSizes = sizes.map((s) => {
            if (s.size.toLowerCase() === item.size.toLowerCase()) {
                const currentQty = parseInt(s.quantity, 10) || 0;
                const newQty = Math.max(currentQty - item.quantity, 0);
                return { ...s, quantity: newQty };
            }
            return s;
            });
            const sizeMatched = sizes.some(s => s.size.toLowerCase() === item.size.toLowerCase());
            if (!sizeMatched) {
            console.warn(`No matching size found for "${item.size}" in product ${item.productId}`);
            }
            await updateDoc(productRef, { sizes: updatedSizes });
        }
        }

        // Update the order status to "Completed"
        await updateDoc(doc(db, "orders", order.id), { status: "Completed" });

        // Reflect the change in UI
        setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: "Completed" } : o))
        );

        toast.success("Order confirmed and inventory updated.");
    } catch (err) {
        console.error("Error confirming order:", err);
        toast.error("Failed to confirm order.");
    }
  };

  const handleDecline = async (orderId) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: "Cancelled" });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "Cancelled" } : o))
      );
      toast.success("Order declined.");
    } catch (err) {
      console.error("Error declining order:", err);
      toast.error("Failed to decline order.");
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Manage Orders</h2>
          <input
            type="text"
            placeholder="Search by ID, User ID, Total or Date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border px-3 py-2 rounded w-80"
          />
        </div>

        <div className="mb-4">
          <label className="mr-2 font-medium">Sort by:</label>
          <select value={sortField} onChange={(e) => setSortField(e.target.value)} className="border rounded px-2 py-1">
            <option value="createdAt">Date</option>
            <option value="total">Total</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded shadow">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="py-2 px-4 border-b">Order ID</th>
                <th className="py-2 px-4 border-b">User ID</th>
                <th className="py-2 px-4 border-b">Total</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Date</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-500">
                    No orders found.
                  </td>
                </tr>
              ) : (
                currentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{order.id}</td>
                    <td className="py-2 px-4 border-b">{order.userId}</td>
                    <td className="py-2 px-4 border-b">
                        ${calculateTotalFromItems(order.items).toFixed(2)}
                    </td>
                    <td className={`py-2 px-4 border-b font-semibold ${getStatusColor(order.status)}`}>
                      {order.status}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {order.createdAt?.toDate
                        ? format(order.createdAt.toDate(), "dd/MM/yyyy hh:mm a")
                        : "N/A"}
                    </td>
                    <td className="py-2 px-4 border-b space-x-2">
                      <button
                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                        className="px-3 py-1 bg-blue-600 text-white rounded"
                      >
                        View
                      </button>
                      {order.status === "Processing" && (
                        <>
                          <button
                            onClick={() => handleConfirm(order)}
                            className="px-3 py-1 bg-green-500 text-white rounded"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleDecline(order.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded"
                          >
                            Decline
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: Math.ceil(sortedOrders.length / ordersPerPage) }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => paginate(num)}
              className={`px-3 py-1 rounded ${
                currentPage === num ? "bg-indigo-600 text-white" : "bg-gray-200"
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default ManageOrders;