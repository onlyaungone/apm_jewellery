import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../utils/firebaseConfig";
import { useNavigate } from "react-router-dom";

const AddProduct = () => {
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    image: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, "products"), {
        ...form,
        price: parseFloat(form.price),
        createdAt: serverTimestamp(),
      });
      alert("Product added successfully!");
      navigate("/admin/products");
    } catch (error) {
      alert("Error adding product: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-lg mx-auto bg-white shadow-md p-6 rounded">
        <h2 className="text-2xl font-semibold mb-4">Add New Product</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            className="w-full border px-4 py-2 rounded"
            required
            onChange={handleChange}
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            className="w-full border px-4 py-2 rounded"
            required
            onChange={handleChange}
          />
          <input
            type="text"
            name="category"
            placeholder="Category"
            className="w-full border px-4 py-2 rounded"
            required
            onChange={handleChange}
          />
          <input
            type="url"
            name="image"
            placeholder="Image URL"
            className="w-full border px-4 py-2 rounded"
            required
            onChange={handleChange}
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
          >
            Add Product
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
