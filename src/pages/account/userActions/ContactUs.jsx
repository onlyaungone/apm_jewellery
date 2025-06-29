import React, { useState, useEffect } from "react";
import { auth, db, storage } from "../../../utils/firebaseConfig";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FaPaperclip } from "react-icons/fa";
import toast from "react-hot-toast";

const categories = [
  "Shipping & Delivery",
  "Instore enquiry",
  "Brand/Product Enquiry",
  "Pandora Club Enquiry",
];

const ContactUs = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    category: categories[0],
    email: "",
    name: "",
    subject: "",
    referenceId: "",
    message: "",
    attachment: null,
  });

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
      setFormData((prev) => ({
        ...prev,
        email: currentUser.email || "",
        name: currentUser.displayName || "",
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "attachment") {
      setFormData((prev) => ({ ...prev, attachment: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let attachmentUrl = null;

      // ✅ Upload to Firebase Storage if there's a file
      if (formData.attachment) {
        const fileRef = ref(
          storage,
          `enquiries/${user.uid}/${Date.now()}_${formData.attachment.name}`
        );
        const snapshot = await uploadBytes(fileRef, formData.attachment);
        attachmentUrl = await getDownloadURL(snapshot.ref);
      }

      const enquiryData = {
        category: formData.category,
        email: formData.email,
        name: formData.name,
        subject: formData.subject,
        referenceId: formData.referenceId,
        message: formData.message,
        attachmentUrl,
        userId: user.uid,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "enquiries"), enquiryData);
      toast.success("Enquiry sent successfully!");

      setFormData((prev) => ({
        ...prev,
        subject: "",
        referenceId: "",
        message: "",
        attachment: null,
      }));
    } catch (error) {
      console.error("Error submitting enquiry:", error);
      toast.error("Failed to send enquiry.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        >
          {categories.map((cat, i) => (
            <option key={i} value={cat}>{cat}</option>
          ))}
        </select>

        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />

        <input
          type="text"
          name="subject"
          placeholder="Subject"
          value={formData.subject}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />

        <input
          type="text"
          name="referenceId"
          placeholder="Order ID / Product ID (optional)"
          value={formData.referenceId}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />

        <textarea
          name="message"
          placeholder="Your message"
          value={formData.message}
          onChange={handleChange}
          rows="5"
          className="w-full border px-3 py-2 rounded"
          required
        ></textarea>

        <label className="flex items-center gap-2 text-sm">
          <FaPaperclip />
          <span>Attach file (PDF/image):</span>
          <input
            type="file"
            name="attachment"
            accept=".pdf,image/*"
            onChange={handleChange}
            className="ml-2"
          />
        </label>

        <button
          type="submit"
          className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
        >
          Send Enquiry
        </button>
      </form>
    </div>
  );
};

export default ContactUs;
