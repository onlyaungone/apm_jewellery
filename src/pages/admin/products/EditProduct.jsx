import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../utils/firebaseConfig";
import toast from "react-hot-toast";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setForm({
            ...data,
            sizes: data.sizes || [],
            promoStart: data.promoStart || "",
            promoEnd: data.promoEnd || "",
            images: data.images || [],
          });
        } else {
          toast.error("Product not found.");
          navigate("/admin/products");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error loading product.");
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSizeChange = (index, field, value) => {
    const updatedSizes = [...form.sizes];
    updatedSizes[index][field] = value;
    setForm((prev) => ({ ...prev, sizes: updatedSizes }));
  };

  const handleAddSize = () => {
    setForm((prev) => ({
      ...prev,
      sizes: [...prev.sizes, { size: "", price: "", discount: "" }],
    }));
  };

  const handleRemoveSize = (index) => {
    const updatedSizes = form.sizes.filter((_, i) => i !== index);
    setForm((prev) => ({ ...prev, sizes: updatedSizes }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!form.name || !form.price || !form.category) {
      toast.error("Please fill all required fields.");
      return;
    }

    try {
      await updateDoc(doc(db, "products", id), {
        ...form,
        price: parseFloat(form.price),
        sizes: form.sizes.map((s) => ({
          ...s,
          price: parseFloat(s.price),
          discount: s.discount ? parseFloat(s.discount) : 0,
        })),
        promoStart: form.promoStart,
        promoEnd: form.promoEnd,
      });
      toast.success("Product updated successfully!");
      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      toast.error("Update failed.");
    }
  };

  if (!form) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Edit Product</h2>
      <form onSubmit={handleUpdate} className="space-y-4">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Product Name *"
          required
          className="w-full border px-4 py-2 rounded"
        />
        <input
          name="price"
          type="number"
          value={form.price}
          onChange={handleChange}
          placeholder="Base Price *"
          required
          className="w-full border px-4 py-2 rounded"
        />
        <input
          name="category"
          value={form.category}
          onChange={handleChange}
          placeholder="Category *"
          required
          className="w-full border px-4 py-2 rounded"
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full border px-4 py-2 rounded"
        />

        <div>
          <h4 className="font-semibold text-sm mb-2">Sizes & Discounts</h4>
          {form.sizes.map((s, index) => {
            const originalPrice = parseFloat(s.price) || 0;
            const discount = parseFloat(s.discount) || 0;
            const discountedPrice = originalPrice - (originalPrice * discount) / 100;

            return (
              <div key={index} className="grid grid-cols-5 gap-2 mb-2 items-center">
                <input
                  type="text"
                  value={s.size}
                  onChange={(e) => handleSizeChange(index, "size", e.target.value)}
                  placeholder="Size"
                  className="border px-2 py-1 rounded"
                />
                <input
                  type="number"
                  value={s.price}
                  onChange={(e) => handleSizeChange(index, "price", e.target.value)}
                  placeholder="Price"
                  className="border px-2 py-1 rounded"
                />
                <input
                  type="number"
                  value={s.discount || ""}
                  onChange={(e) => handleSizeChange(index, "discount", e.target.value)}
                  placeholder="% Discount"
                  className="border px-2 py-1 rounded"
                />
                <p
                  className={`text-sm font-medium ${discount > 0 ? "text-red-600 font-semibold" : "text-gray-600"}`}
                >
                  ${discountedPrice.toFixed(2)}
                </p>
                <button
                  type="button"
                  onClick={() => handleRemoveSize(index)}
                  className="text-red-600 text-xs"
                >
                  Remove
                </button>
              </div>
            );
          })}

          <button
            type="button"
            onClick={handleAddSize}
            className="text-blue-600 text-sm mt-1"
          >
            + Add Size
          </button>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Promotional Start Date
          </label>
          <input
            type="date"
            name="promoStart"
            value={form.promoStart}
            onChange={handleChange}
            disabled={!form.sizes.some((s) => parseFloat(s.discount) > 0)}
            className={`w-full border px-4 py-2 rounded ${
              !form.sizes.some((s) => parseFloat(s.discount) > 0)
                ? "bg-gray-100 cursor-not-allowed opacity-70"
                : ""
            }`}
          />

          <label className="block text-sm font-medium text-gray-700">
            Promotional End Date
          </label>
          <input
            type="date"
            name="promoEnd"
            value={form.promoEnd}
            onChange={handleChange}
            disabled={!form.sizes.some((s) => parseFloat(s.discount) > 0)}
            className={`w-full border px-4 py-2 rounded ${
              !form.sizes.some((s) => parseFloat(s.discount) > 0)
                ? "bg-gray-100 cursor-not-allowed opacity-70"
                : ""
            }`}
          />
        </div>

        {form.images && form.images.length > 0 && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Preview Images</label>
            <div className="flex gap-4 flex-wrap">
              {form.images.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Product ${i}`}
                  className="h-20 w-20 object-cover border rounded"
                />
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
        >
          Update Product
        </button>
      </form>
    </div>
  );
};

export default EditProduct;