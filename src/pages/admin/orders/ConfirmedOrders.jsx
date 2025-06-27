import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../../utils/firebaseConfig";
import { format } from "date-fns";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import AdminNavbar from "../../../components/AdminNavbar";
import logo from "../../../assets/web_logo.png";

const ConfirmedOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchConfirmedOrders = async () => {
      const q = query(
        collection(db, "orders"),
        where("status", "==", "Completed"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const confirmed = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setOrders(confirmed);
    };

    fetchConfirmedOrders();
  }, []);

  const getUserInfo = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      const userData = userDoc.data();
      const addressSnap = await getDocs(collection(db, "users", userId, "addresses"));
      const addressData = addressSnap.docs[0]?.data();

      return {
        fullName: `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
        email: userData.email || "N/A",
        address: addressData
          ? `${addressData.address1}, ${addressData.suburb}, ${addressData.town}, ${addressData.postalCode}`
          : "N/A",
      };
    } catch {
      return { fullName: "N/A", email: "N/A", address: "N/A" };
    }
  };

  const getProductName = async (productId) => {
    try {
      const productDoc = await getDoc(doc(db, "products", productId));
      return productDoc.exists() ? productDoc.data().name || "Unnamed Item" : "Unnamed Item";
    } catch {
      return "Unnamed Item";
    }
  };

  const generatePDF = async (order) => {
    const input = document.getElementById(`order-detail-${order.id}`);
    if (!input) return;

    const userInfo = await getUserInfo(order.userId);
    const resolvedItems = await Promise.all(
      (order.items || []).map(async (item) => {
        const name = item.name || (item.productId ? await getProductName(item.productId) : "Unnamed Item");
        return { ...item, name };
      })
    );

    input.querySelector(".order-name").innerText = userInfo.fullName;
    input.querySelector(".order-email").innerText = userInfo.email;
    input.querySelector(".order-address").innerText = userInfo.address;
    input.querySelector(".order-total").innerText = resolvedItems
      .reduce((sum, item) => sum + item.quantity * item.price, 0)
      .toFixed(2);

    const itemsContainer = input.querySelector(".order-items");
    itemsContainer.innerHTML = "";
    resolvedItems.forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="border px-4 py-2">${item.name}</td>
        <td class="border px-4 py-2">${item.quantity}</td>
        <td class="border px-4 py-2">$${item.price.toFixed(2)}</td>
        <td class="border px-4 py-2">$${(item.quantity * item.price).toFixed(2)}</td>
      `;
      itemsContainer.appendChild(row);
    });

    const canvas = await html2canvas(input, { scale: 2 });
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`order-${order.id}.pdf`);
  };

  return (
    <>
      <AdminNavbar />
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Confirmed Orders</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded shadow">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="py-2 px-4 border-b">Order ID</th>
                <th className="py-2 px-4 border-b">Customer ID</th>
                <th className="py-2 px-4 border-b">Total</th>
                <th className="py-2 px-4 border-b">Date</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500">No confirmed orders.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <React.Fragment key={order.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">{order.id}</td>
                      <td className="py-2 px-4 border-b">{order.userId}</td>
                      <td className="py-2 px-4 border-b">${order.total.toFixed(2)}</td>
                      <td className="py-2 px-4 border-b">
                        {order.createdAt?.toDate ? format(order.createdAt.toDate(), "dd/MM/yyyy hh:mm a") : "N/A"}
                      </td>
                      <td className="py-2 px-4 border-b">
                        <button
                          onClick={() => generatePDF(order)}
                          className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
                        >
                          Download PDF
                        </button>
                      </td>
                    </tr>
                    <tr style={{ position: "absolute", left: "-9999px", top: "0" }}>
                      <td colSpan="5">
                        <div
                          id={`order-detail-${order.id}`}
                          className="p-8 w-[800px] text-black bg-white border rounded shadow font-sans"
                        >
                          <div className="flex items-center justify-between mb-6">
                            <img src={logo} alt="Web Logo" className="h-24" />
                            <p className="text-sm">123 South Melbourne, Melbourne VIC 3000</p>
                            <p className="text-sm">(+61) 1234 5678 | sales@apmjewellery.com</p>
                          </div>

                          <div className="mb-4">
                            <h2 className="text-xl font-bold mb-4 border-b pb-2">Order Receipt</h2>
                            <p><strong>Order ID:</strong> {order.id}</p>
                            <p><strong>Name:</strong> <span className="order-name"></span></p>
                            <p><strong>Email:</strong> <span className="order-email"></span></p>
                            <p><strong>Address:</strong> <span className="order-address"></span></p>
                            <p><strong>Status:</strong> {order.status}</p>
                            <p><strong>Date:</strong> {order.createdAt?.toDate ? format(order.createdAt.toDate(), "dd/MM/yyyy hh:mm a") : "N/A"}</p>
                          </div>

                          <table className="min-w-full table-fixed border border-collapse mb-4">
                            <thead className="bg-gray-200">
                              <tr>
                                <th className="border px-4 py-2">Product</th>
                                <th className="border px-4 py-2">Qty</th>
                                <th className="border px-4 py-2">Price</th>
                                <th className="border px-4 py-2">Total</th>
                              </tr>
                            </thead>
                            <tbody className="order-items"></tbody>
                          </table>

                          <div className="text-right text-lg">
                            <p>
                                <strong>Total Paid:</strong> $
                                <span className="order-total"></span>
                            </p>
                          </div>

                          <div className="mt-6 text-sm text-gray-600">
                            <p>Thank you for shopping with APM Jewellery!</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default ConfirmedOrders;
