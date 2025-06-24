import React, { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const MyAccount = () => {
  const [userData, setUserData] = useState(null);
  const [addressData, setAddressData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndAddress = async () => {
      const user = auth.currentUser;
      if (!user) return navigate("/login");

      const userDoc = await getDoc(doc(db, "users", user.uid));
      setUserData(userDoc.data());

      const addressSnapshot = await getDocs(collection(db, "users", user.uid, "addresses"));
      if (!addressSnapshot.empty) {
        const firstDoc = addressSnapshot.docs[0];
        setAddressData({ id: firstDoc.id, ...firstDoc.data() });
      }
    };

    fetchUserAndAddress();
  }, [navigate]);

  const formatGender = (g) => {
    if (g === "male") return "Male";
    if (g === "female") return "Female";
    if (g === "prefer") return "Prefer not to say";
    return "None";
  };

  if (!userData) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto">
      <h1 className="text-2xl md:text-4xl font-bold mb-4">Welcome {userData.firstName}</h1>
      <p className="text-sm text-gray-500 mb-8">Home › My Account</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sizes */}
        <Section title="SIZES" subtitle="Save and share your jewellery sizes here" link="View Sizes" to="/sizes" />

        {/* Address Book */}
        {addressData ? (
          <Section
            title="ADDRESS BOOK"
            subtitle={
              <>
                <div className="text-xs text-gray-500">{addressData.addressTitle}</div>
                <div>{addressData.firstName} {addressData.lastName}</div>
                <div>{addressData.phone}</div>
                <div>{addressData.address1}, {addressData.suburb}, {addressData.town} {addressData.postalCode}</div>
              </>
            }
            link="View"
            to={`/address-book/`}
          />
        ) : (
          <Section
            title="ADDRESS BOOK"
            subtitle="Manage your delivery address"
            link="Add New"
            to="/add-address"
          />
        )}

        {/* Recent Orders */}
        <Section title="RECENT ORDER" subtitle="No orders are available" link="View All Orders" to="/orders" />

        {/* Wishlist */}
        <Section title="WISHLIST" subtitle="This list is empty." />

        {/* Password */}
        <Section title="PASSWORD" subtitle="**********" link="Edit" to="/password" />

        {/* Profile */}
        <div className="border rounded p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-md font-semibold">PROFILE</h3>
            <button
              className="text-blue-600 text-sm underline"
              onClick={() => navigate("/details")}
            >
              Edit
            </button>
          </div>
          <div className="grid grid-cols-2 text-sm gap-2 text-gray-700">
            <div><strong>First Name:</strong> {userData.firstName}</div>
            <div><strong>Last Name:</strong> {userData.lastName}</div>
            <div><strong>Email:</strong> {userData.email}</div>
            <div><strong>Gender:</strong> {formatGender(userData.gender)}</div>
            <div><strong>Phone:</strong> {userData.phone || "None"}</div>
            <div><strong>Postal Code:</strong> {userData.postalCode || "None"}</div>
            <div><strong>Birthday:</strong> {userData.birthday || "None"}</div>
            <div><strong>Wedding Day:</strong> {userData.weddingDay || "None"}</div>
            <div><strong>Anniversary:</strong> {userData.anniversary || "None"}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, subtitle, link, to }) => {
  const navigate = useNavigate();
  return (
    <div className="border rounded p-4">
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-md font-semibold">{title}</h3>
        {to && (
          <button
            className="text-blue-600 text-sm underline"
            onClick={() => navigate(to)}
          >
            {link}
          </button>
        )}
      </div>
      <p className="text-sm text-gray-600">{subtitle}</p>
    </div>
  );
};

export default MyAccount;
