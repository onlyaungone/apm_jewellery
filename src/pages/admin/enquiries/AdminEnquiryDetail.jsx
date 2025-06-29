import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../../utils/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import AdminNavbar from "../../../components/AdminNavbar";

const AdminEnquiryDetail = () => {
  const { id: enquiryId } = useParams();
  const navigate = useNavigate();
  const [enquiry, setEnquiry] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const enquiryDoc = await getDoc(doc(db, "enquiries", enquiryId));
      if (enquiryDoc.exists()) {
        setEnquiry(enquiryDoc.data());
      }
    };
    fetchData();
  }, [enquiryId]);

  return (
    <>
      <AdminNavbar />
      <div className="max-w-3xl mx-auto p-4">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-sm text-indigo-600 hover:underline"
        >
          ← Back to all enquiries
        </button>

        {enquiry && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold">{enquiry.name}</h2>
            <p className="text-sm text-gray-600">{enquiry.email}</p>
            <p className="mt-2"><strong>Subject:</strong> {enquiry.subject}</p>
            <p><strong>Category:</strong> {enquiry.category}</p>
            <p><strong>Message:</strong> {enquiry.message}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminEnquiryDetail;
