import React, { useEffect, useState, useCallback } from "react";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../utils/firebaseConfig";
import AdminNavbar from "../../components/AdminNavbar";
import { CSVLink } from "react-csv";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const AdminReports = () => {
  const [report, setReport] = useState({});
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [csvData, setCsvData] = useState([]);

  // Load default last 7 days on mount
  useEffect(() => {
    const now = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(now.getDate() - 7);
    setStartDate(lastWeek);
    setEndDate(now);
  }, []);

  const generateReport = useCallback(async () => {
    if (!startDate || !endDate) return;
    setLoading(true);

    const startTimestamp = Timestamp.fromDate(new Date(startDate));
    const endTimestamp = Timestamp.fromDate(new Date(endDate));

    const ordersQuery = query(
      collection(db, "orders"),
      where("createdAt", ">=", startTimestamp),
      where("createdAt", "<=", endTimestamp)
    );

    const ordersSnap = await getDocs(ordersQuery);

    const productCount = {};
    const productRevenue = {};
    const userSpend = {};
    const userMap = {};
    const statusCount = { Processing: 0, Completed: 0, Cancelled: 0 };

    let totalRevenue = 0;
    let totalOrderCount = 0;
    const productCache = {};

    const getProductName = async (productId) => {
      if (productCache[productId]) return productCache[productId];
      const productSnap = await getDoc(doc(db, "products", productId));
      if (productSnap.exists()) {
        const name = productSnap.data().name || "Unnamed";
        productCache[productId] = name;
        return name;
      }
      return "Unnamed";
    };

    for (const docSnap of ordersSnap.docs) {
      const data = docSnap.data();
      const { status, items = [], userId } = data;

      if (status in statusCount) statusCount[status]++;
      if (status === "Cancelled") continue;

      totalOrderCount++;
      const orderTotal = Number(data.total || 0);
      totalRevenue += orderTotal;

      const userRef = await getDoc(doc(db, "users", userId));
      const userEmail = userRef.exists() ? userRef.data().email : userId;
      userMap[userId] = userEmail;

      for (const item of items) {
        const name = item.name || (await getProductName(item.productId));
        const qty = Number(item.quantity || 0);
        const price = Number(item.price || 0);
        const discount = Number(item.discount || 0);
        const finalPrice = price * (1 - discount / 100);
        const lineTotal = finalPrice * qty;

        productCount[name] = (productCount[name] || 0) + qty;
        productRevenue[name] = (productRevenue[name] || 0) + lineTotal;
        userSpend[userEmail] = (userSpend[userEmail] || 0) + lineTotal;
      }
    }

    const sortedProducts = Object.entries(productCount)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

    const sortedUsers = Object.entries(userSpend)
      .sort((a, b) => b[1] - a[1])
      .map(([email, amount]) => ({
        email,
        amount: amount.toFixed(2),
      }));

    const consolidatedCSV = [
      ["Metric", "Value"],
      ["Total Revenue", totalRevenue.toFixed(2)],
      [
        "Average Order Value",
        totalOrderCount === 0
          ? "0.00"
          : (totalRevenue / totalOrderCount).toFixed(2),
      ],
      ...sortedProducts.map((p) => ["Top Product: " + p.name, p.count]),
      ...sortedUsers.map((u) => ["Top Customer: " + u.email, u.amount]),
    ];

    setCsvData(consolidatedCSV);

    setReport({
      topProducts: sortedProducts.slice(0, 5),
      revenueByProduct: productRevenue,
      topUsers: sortedUsers.slice(0, 5),
      orderStatus: statusCount,
      totalRevenue: totalRevenue.toFixed(2),
      avgOrderValue:
        totalOrderCount === 0
          ? "0.00"
          : (totalRevenue / totalOrderCount).toFixed(2),
    });

    setLoading(false);
  }, [startDate, endDate]);

  useEffect(() => {
    generateReport();
  }, [generateReport]);

  return (
    <>
      <AdminNavbar />
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Store Reports</h2>

        <div className="flex gap-4 mb-4 items-center">
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            placeholderText="Start Date"
            className="border p-2 rounded"
          />
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            placeholderText="End Date"
            className="border p-2 rounded"
          />
          {csvData.length > 0 && (
            <CSVLink
              data={csvData}
              filename="consolidated_report.csv"
              className="bg-indigo-600 text-white px-4 py-2 rounded"
            >
              Download Full CSV
            </CSVLink>
          )}
        </div>

        {loading ? (
          <p>Select a date range to view reports...</p>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-lg font-semibold">
                📈 Total Revenue: ${report.totalRevenue}
              </p>
              <p className="text-md text-gray-600">
                💸 Avg Order Value: ${report.avgOrderValue}
              </p>
            </div>

            <section className="mb-8">
              <h3 className="text-xl font-semibold mb-2">🛒 Top Sold Products</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={report.topProducts}>
                  <XAxis dataKey="name" tick={false} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold mb-2">💰 Revenue by Product</h3>
              <ul className="bg-white p-4 rounded shadow">
                {Object.entries(report.revenueByProduct).map(
                  ([name, revenue], idx) => (
                    <li key={idx} className="mb-1">
                      {name} — ${revenue.toFixed(2)}
                    </li>
                  )
                )}
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold mb-2">👤 Top Customers</h3>
              <ul className="bg-white p-4 rounded shadow">
                {report.topUsers.map((user, idx) => (
                  <li key={idx}>
                    Email: {user.email} — Spent: ${user.amount}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold mb-2">📦 Orders by Status</h3>
              <ul className="bg-white p-4 rounded shadow">
                {Object.entries(report.orderStatus).map(([status, count], idx) => (
                  <li key={idx}>
                    {status}: {count} orders
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </div>
    </>
  );
};

export default AdminReports;
