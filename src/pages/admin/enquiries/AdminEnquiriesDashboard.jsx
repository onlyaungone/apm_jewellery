import React, { useEffect, useState } from "react";
import { db } from "../../../utils/firebaseConfig";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Link } from "react-router-dom";
import AdminNavbar from "../../../components/AdminNavbar";

const AdminEnquiriesDashboard = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnquiries = async () => {
      const q = query(collection(db, "enquiries"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => {
        const enquiry = doc.data();
        return {
          id: doc.id,
          name: enquiry.name,
          email: enquiry.email,
          category: enquiry.category,
          timestamp: enquiry.createdAt?.toDate()?.toLocaleString() || "",
        };
      });

      setEnquiries(data);
      setLoading(false);
    };

    fetchEnquiries();
  }, []);

  return (
    <>
      <AdminNavbar />
      <div className="max-w-4xl mx-auto mt-6 p-4">
        <h2 className="text-2xl font-semibold mb-4">All Enquiries</h2>

        {loading ? (
          <p>Loading enquiries...</p>
        ) : (
          <ul className="space-y-3">
            {enquiries.map((enq) => (
              <li
                key={enq.id}
                className="p-4 border rounded shadow-sm bg-white hover:bg-gray-50"
              >
                <Link to={`/admin/enquiries/${enq.id}`} className="block">
                  <div className="flex justify-between items-center mb-1">
                    <div>
                      <strong>{enq.name}</strong>{" "}
                      <span className="text-sm text-gray-500">({enq.email})</span>
                    </div>
                    <span className="text-xs text-gray-500">{enq.timestamp}</span>
                  </div>
                  <div className="text-sm text-gray-700">
                    <em>Category:</em> {enq.category}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default AdminEnquiriesDashboard;
