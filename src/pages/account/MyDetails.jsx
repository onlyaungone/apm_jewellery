import React, { useEffect, useState } from "react";
import { auth, db } from "../../utils/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const MyDetails = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    postalCode: "",
    gender: "prefer",
    birthday: "",
    weddingDay: "",
    anniversary: "",
    email: "",
    newsletter: false,
  });

  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (user) {
        setUserId(user.uid);
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            phone: data.phone || "",
            postalCode: data.postalCode || "",
            gender: data.gender || "prefer",
            birthday: data.birthday || "",
            weddingDay: data.weddingDay || "",
            anniversary: data.anniversary || "",
            email: data.email || "",
            newsletter: data.newsletter || false,
          });
        }
      } else {
        navigate("/login");
      }
    };
    fetchUser();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    if (!formData.phone.match(/^\d{8,15}$/)) {
      alert("Please enter a valid phone number");
      return;
    }

    const dataToUpdate = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      postalCode: formData.postalCode,
      gender: formData.gender,
      birthday: formData.birthday,
      weddingDay: formData.weddingDay,
      anniversary: formData.anniversary,
      newsletter: formData.newsletter,
    };

    try {
      await updateDoc(doc(db, "users", userId), dataToUpdate);
      alert("Profile updated!");
      navigate("/account");
    } catch (err) {
      alert("Update failed: " + err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12">
      <h1 className="text-3xl font-bold mb-2">PROFILE</h1>
      <p className="text-sm text-gray-500 mb-6">Home › My Account › Profile</p>

      <h2 className="text-xl font-semibold mb-4">EDIT PROFILE</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />
        <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
        <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} required />
        <Input label="Postal Code" name="postalCode" value={formData.postalCode} onChange={handleChange} />
      </div>

      {/* Gender */}
      <div className="mt-4">
        <label className="block font-medium">Gender</label>
        <div className="flex gap-6 mt-2">
          <label><input type="radio" name="gender" value="male" checked={formData.gender === "male"} onChange={handleChange} /> Male</label>
          <label><input type="radio" name="gender" value="female" checked={formData.gender === "female"} onChange={handleChange} /> Female</label>
          <label><input type="radio" name="gender" value="prefer" checked={formData.gender === "prefer"} onChange={handleChange} /> Prefer not to say</label>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <Input label="Birthday" name="birthday" value={formData.birthday} onChange={handleChange} placeholder="DD/MM/YYYY" />
        <Input label="Wedding Day" name="weddingDay" value={formData.weddingDay} onChange={handleChange} placeholder="DD/MM/YYYY" />
        <Input label="Anniversary date" name="anniversary" value={formData.anniversary} onChange={handleChange} placeholder="DD/MM/YYYY" />
      </div>

      {/* Email Display (Read-only) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Input label="Email" name="email" value={formData.email} readOnly />
      </div>

      {/* Newsletter */}
      <div className="mt-4">
        <label className="flex gap-2">
          <input type="checkbox" name="newsletter" checked={formData.newsletter} onChange={handleChange} />
          Yes, sign me up for the APM Newsletter...
        </label>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <button onClick={() => navigate("/account")} className="border px-4 py-2">Cancel</button>
        <button onClick={handleSave} className="bg-black text-white px-6 py-2 font-semibold">Save</button>
      </div>

      {/* Account Options */}
      <div className="mt-6 border-t pt-4 text-sm text-gray-600">
        <p className="underline cursor-pointer">Remove my data</p>
        <p className="underline cursor-pointer mt-1 text-red-600">Delete my account</p>
      </div>
    </div>
  );
};

const Input = ({ label, name, type = "text", ...props }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <input
      type={type}
      name={name}
      className={`w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-black ${props.readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      {...props}
    />
  </div>
);

export default MyDetails;
