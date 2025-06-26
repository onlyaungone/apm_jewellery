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
            highlights: data.highlights || {
              love: "",
              handFinished: "",
              keepPerfect: "",
              workWith: "",
              dimensions: "",
            },
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
    const { name, value, type } = e.target;
    const val = type === "number" ? Number(value) : value;
    if (name in form.highlights) {
      setForm((prev) => ({
        ...prev,
        highlights: {
          ...prev.highlights,
          [name]: val,
        },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: val }));
    }
  };

  const handleSizeChange = (index, field, value) => {
    const updatedSizes = [...form.sizes];
    updatedSizes[index][field] = value;
    setForm((prev) => ({ ...prev, sizes: updatedSizes }));
  };

  const handleAddSize = () => {
    setForm((prev) => ({
      ...prev,
      sizes: [...prev.sizes, { size: "", price: "", discount: "", quantity: "" }],
    }));
  };

  const handleRemoveSize = (index) => {
    const updatedSizes = form.sizes.filter((_, i) => i !== index);
    setForm((prev) => ({ ...prev, sizes: updatedSizes }));
  };

  const getTotalQuantity = () => {
    return form.sizes.reduce((total, s) => total + (parseInt(s.quantity, 10) || 0), 0);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!form.name || !form.category || form.sizes.length === 0) {
      toast.error("Please fill all required fields and add at least one size.");
      return;
    }

    const firstSize = form.sizes[0];
    if (!firstSize.size || !firstSize.price || isNaN(parseFloat(firstSize.price))) {
      toast.error("First size must have size and valid price.");
      return;
    }

    const totalQuantity = getTotalQuantity();
    if (totalQuantity <= 0) {
      toast.error("Total quantity must be greater than 0.");
      return;
    }

    for (const s of form.sizes) {
      const price = parseFloat(s.price);
      const quantity = parseInt(s.quantity, 10);
      if (price < 0 || quantity < 0) {
        toast.error("Price and quantity must be non-negative.");
        return;
      }
    }

    const basePrice = parseFloat(firstSize.price);

    try {
      await updateDoc(doc(db, "products", id), {
        ...form,
        price: basePrice,
        sizes: form.sizes.map((s) => ({
          ...s,
          price: parseFloat(s.price),
          quantity: parseInt(s.quantity, 10) || 0,
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
      <button
        type="button"
        onClick={() => navigate("/admin/products")}
        className="mb-4 text-sm text-indigo-600 hover:underline"
      >
        ← Back to Product List
      </button>
      <h2 className="text-2xl font-bold mb-6">Edit Product</h2>
      <form onSubmit={handleUpdate} className="space-y-4">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Product Name *" required className="w-full border px-4 py-2 rounded" />
        <input name="category" value={form.category} onChange={handleChange} placeholder="Category *" required className="w-full border px-4 py-2 rounded" />
        <input name="subCategory" value={form.subCategory || ""} onChange={handleChange} placeholder="Subcategory" className="w-full border px-4 py-2 rounded" />
        <input name="symbolType" value={form.symbolType || ""} onChange={handleChange} placeholder="Symbol Type (if applicable)" className="w-full border px-4 py-2 rounded" />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="w-full border px-4 py-2 rounded" />

        <select name="engravable" value={form.engravable} onChange={handleChange} className="w-full border px-4 py-2 rounded">
          <option value="No">Engravable: No</option>
          <option value="Yes">Engravable: Yes</option>
        </select>

        <div className="flex items-center gap-2">
          <input type="checkbox" name="isLabGrown" checked={form.isLabGrown} onChange={(e) => setForm((prev) => ({ ...prev, isLabGrown: e.target.checked }))} />
          <label>Includes Lab-Grown Diamond</label>
        </div>

        {form.isLabGrown && (
          <input name="caratWeight" value={form.caratWeight} onChange={handleChange} placeholder="Carat Weight (e.g., 0.25 carat)" className="w-full border px-4 py-2 rounded" />
        )}

        <input name="love" value={form.highlights.love} onChange={handleChange} placeholder="Why you’ll love it" className="w-full border px-4 py-2 rounded" />
        <input name="handFinished" value={form.highlights.handFinished} onChange={handleChange} placeholder="Hand-finished" className="w-full border px-4 py-2 rounded" />
        <input name="keepPerfect" value={form.highlights.keepPerfect} onChange={handleChange} placeholder="Keep it perfect" className="w-full border px-4 py-2 rounded" />
        <input name="workWith" value={form.highlights.workWith} onChange={handleChange} placeholder="Work with" className="w-full border px-4 py-2 rounded" />
        <input name="dimensions" value={form.highlights.dimensions} onChange={handleChange} placeholder="Dimensions (e.g., 8.3mm deep, 10.5mm high, 11.5mm wide)" className="w-full border px-4 py-2 rounded" />

        <div>
          <h4 className="font-semibold text-sm mb-2">Sizes, Quantity & Discounts</h4>
          {form.sizes.map((s, index) => {
            const price = parseFloat(s.price);
            const quantity = parseInt(s.quantity, 10);
            const discount = parseFloat(s.discount) || 0;
            const isInvalidPrice = isNaN(price) || price < 0;
            const isInvalidQuantity = isNaN(quantity) || quantity < 0;
            const isInvalidDiscount = discount < 0 || discount > 100;
            const discountedPrice = price > 0 ? price - (price * discount) / 100 : 0;

            return (
              <div key={index} className="grid grid-cols-6 gap-2 mb-2 items-center">
                <input
                  type="text"
                  value={s.size}
                  onChange={(e) => handleSizeChange(index, "size", e.target.value)}
                  placeholder="Size"
                  className="border px-2 py-1 rounded"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={s.price}
                  onChange={(e) => handleSizeChange(index, "price", e.target.value)}
                  placeholder="Price"
                  className={`border px-2 py-1 rounded ${isInvalidPrice ? "border-red-500" : ""}`}
                  title={isInvalidPrice ? "Price must be a non-negative number" : ""}
                />
                <input
                  type="number"
                  min="0"
                  value={s.quantity || ""}
                  onChange={(e) => handleSizeChange(index, "quantity", e.target.value)}
                  placeholder="Quantity"
                  className={`border px-2 py-1 rounded ${isInvalidQuantity ? "border-red-500" : ""}`}
                  title={isInvalidQuantity ? "Quantity must be a non-negative number" : ""}
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={s.discount || ""}
                  onChange={(e) => handleSizeChange(index, "discount", e.target.value)}
                  placeholder="% Discount"
                  className={`border px-2 py-1 rounded ${isInvalidDiscount ? "border-red-500" : ""}`}
                  title={isInvalidDiscount ? "Discount must be between 0 and 100" : ""}
                />
                <p className={`text-sm font-medium ${discount > 0 ? "text-red-600 font-semibold" : "text-gray-600"}`}>
                  ${discountedPrice.toFixed(2)}
                </p>
                <button type="button" onClick={() => handleRemoveSize(index)} className="text-red-600 text-xs">
                  Remove
                </button>
              </div>
            );
          })}

          <button type="button" onClick={handleAddSize} className="text-blue-600 text-sm mt-1">+ Add Size</button>
          <p className="text-sm text-gray-700 mt-2">
            Total Quantity: <span className="font-semibold">{getTotalQuantity()}</span>
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Promotional Start Date</label>
          <input type="date" name="promoStart" value={form.promoStart} onChange={handleChange} disabled={!form.sizes.some((s) => parseFloat(s.discount) > 0)} className={`w-full border px-4 py-2 rounded ${!form.sizes.some((s) => parseFloat(s.discount) > 0) ? "bg-gray-100 cursor-not-allowed opacity-70" : ""}`} />

          <label className="block text-sm font-medium text-gray-700">Promotional End Date</label>
          <input type="date" name="promoEnd" value={form.promoEnd} onChange={handleChange} disabled={!form.sizes.some((s) => parseFloat(s.discount) > 0)} className={`w-full border px-4 py-2 rounded ${!form.sizes.some((s) => parseFloat(s.discount) > 0) ? "bg-gray-100 cursor-not-allowed opacity-70" : ""}`} />
        </div>

        {form.images && form.images.length > 0 && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Preview Images</label>
            <div className="flex gap-4 flex-wrap">
              {form.images.map((url, i) => (
                <img key={i} src={url} alt={`Product ${i}`} className="h-20 w-20 object-cover border rounded" />
              ))}
            </div>
          </div>
        )}

        <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
          Update Product
        </button>
      </form>
    </div>
  );
};

export default EditProduct;