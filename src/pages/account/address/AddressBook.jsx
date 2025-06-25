import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../../utils/firebaseConfig";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";

const AddressBook = () => {
  const [addresses, setAddresses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAddresses = async () => {
      const user = auth.currentUser;
      if (!user) return navigate("/login");

      const addrSnap = await getDocs(collection(db, "users", user.uid, "addresses"));
      const addressList = addrSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAddresses(addressList);
    };

    fetchAddresses();
  }, [navigate]);

  const handleEdit = (id) => navigate(`/edit-address/${id}`);
  const handleAdd = () => {
    if (addresses.length === 0) {
      navigate("/add-address");
    }
  };

  const handleDelete = async (id) => {
    const user = auth.currentUser;
    await deleteDoc(doc(db, "users", user.uid, "addresses", id));
    setAddresses([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12">
      <h1 className="text-3xl font-bold mb-6">My Address Book</h1>

      {addresses.length === 0 ? (
        <div>
          <p className="text-gray-600 mb-4">You have no saved addresses.</p>
          <button
            onClick={handleAdd}
            className="bg-black text-white px-6 py-2 font-semibold"
          >
            Add New
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {addresses.map((addr) => (
            <div key={addr.id} className="border p-4 rounded shadow-sm">
              <p><strong>{addr.addressTitle}</strong></p>
              <p>{addr.firstName} {addr.lastName}</p>
              <p>{addr.address1} {addr.address2}</p>
              <p>{addr.suburb}, {addr.town} {addr.postalCode}</p>
              <p>{addr.country}</p>
              <p>Phone: {addr.phone}</p>
              <div className="mt-2 flex gap-2">
                <button onClick={() => handleEdit(addr.id)} className="text-blue-600 underline">Edit</button>
                <button onClick={() => handleDelete(addr.id)} className="text-red-600 underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ← Back to Account link */}
      <p onClick={() => navigate("/account")} className="mt-6 text-sm underline cursor-pointer">
        ← Back to Account
      </p>
    </div>
  );
};

export default AddressBook;
