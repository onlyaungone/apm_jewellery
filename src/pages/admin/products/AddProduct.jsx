import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, storage } from "../../../utils/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const CATEGORY_MAP = {
  Charms: [
    "Clip charms", "Dangle charms", "Engravable charms", "Spacer charms",
    "Safety chains", "Letter charms", "Birthstone Charms", "Symbols"
  ],
  Bracelets: [
    "Charm bracelets", "Bangles", "Chain bracelets", "Leather bracelets",
    "Adjustable bracelets", "Lab-grown diamond bracelets",
    "Tennis bracelets", "Pearl bracelets"
  ],
  Rings: [
    "Promise Rings", "Stacking Rings", "Statement Rings",
    "Lab-grown Diamond Rings", "Pearl Rings"
  ],
  Necklaces: [
    "Pendant Necklaces", "Chain Necklaces", "Lab-grown Diamond Necklaces",
    "Pendants", "Pearl Necklaces"
  ],
  Earrings: [
    "Hoop Earrings", "Stud Earrings", "Drop Earrings",
    "Lab-grown Diamond Earrings", "Pearl Earrings"
  ]
};

const SYMBOL_TYPES = [
  "Family & friends",
  "Travel & hobbies",
  "Occasions & celebrations",
  "Love",
  "Animals & pets",
  "Nature & celestial"
];

const SIZE_OPTIONS = [
  "One Size", "48", "50", "52", "54", "56", "58", "60",
  "16 CM", "17 CM", "18 CM", "19 CM", "20 CM", "21 CM", "23 CM",
  "45 CM", "60 CM", "75 CM"
];

const generateProductId = () => {
  const digits = Math.floor(100000 + Math.random() * 900000).toString();
  const letters = Array.from({ length: 3 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26))
  ).join("");
  return digits + letters;
};

const AddProduct = () => {
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    subCategory: "",
    symbolType: "",
    description: "",
    engravable: "No",
    isLabGrown: false,
    caratWeight: "",
    metals: [{ type: "", feature: "", image: null }],
    highlights: {
      love: "",
      handFinished: "",
      keepPerfect: "",
      workWith: "",
      dimensions: ""
    },
    sizes: []
  });

  const [selectedCategory, setSelectedCategory] = useState("");
  const [subcategories, setSubcategories] = useState([]);
  const [mainImages, setMainImages] = useState(Array(6).fill(null));
  const [mainImagePreviews, setMainImagePreviews] = useState(Array(6).fill(null));
  const [metalImagePreviews, setMetalImagePreviews] = useState([""]);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    if (name in form.highlights) {
      setForm((prev) => ({
        ...prev,
        highlights: { ...prev.highlights, [name]: val },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: val }));
    }
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSubcategories(CATEGORY_MAP[category] || []);
    setForm((prev) => ({ ...prev, category, subCategory: "", symbolType: "" }));
    setSelectedCategory(category);
  };

  const handleSubCategoryChange = (e) => {
  const subCategory = e.target.value;
  setForm((prev) => ({ ...prev, subCategory }));
};

  const handleMetalChange = (index, field, value) => {
    const updated = [...form.metals];
    updated[index][field] = value;
    setForm((prev) => ({ ...prev, metals: updated }));
  };

  const handleMetalImageChange = (index, file) => {
    const updated = [...form.metals];
    updated[index].image = file;
    const previews = [...metalImagePreviews];
    previews[index] = file ? URL.createObjectURL(file) : null;
    setForm((prev) => ({ ...prev, metals: updated }));
    setMetalImagePreviews(previews);
  };

  const handleAddMetal = () => {
    setForm((prev) => ({
      ...prev,
      metals: [...prev.metals, { type: "", feature: "", image: null }],
    }));
    setMetalImagePreviews((prev) => [...prev, null]);
  };

  const handleMainImageChange = (index, file) => {
    const updated = [...mainImages];
    const previews = [...mainImagePreviews];
    updated[index] = file;
    previews[index] = file ? URL.createObjectURL(file) : null;
    setMainImages(updated);
    setMainImagePreviews(previews);
  };

  const handleAddSize = () => {
    setForm((prev) => ({
      ...prev,
      sizes: [...prev.sizes, { size: "", price: "", quantity: "" }],
    }));
  };

  const handleSizeChange = (index, field, value) => {
    const updated = [...form.sizes];
    updated[index][field] = value;
    setForm((prev) => ({ ...prev, sizes: updated }));
  };

  const uploadFile = async (path, file) => {
    const fileRef = ref(storage, path);
    const metadata = { contentType: file.type };
    await uploadBytes(fileRef, file, metadata);
    return await getDownloadURL(fileRef);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!mainImages[0]) return alert("Upload at least one image");
      if (!form.metals[0].type || !form.metals[0].image) return alert("At least one metal type with image is required");

      const mainImageUrls = await Promise.all(
        mainImages.filter(Boolean).map((image) => {
          const path = `products/main/${uuidv4()}-${image.name}`;
          return uploadFile(path, image);
        })
      );

      const metalData = await Promise.all(
        form.metals.map(async (metal) => {
          const path = `products/metals/${uuidv4()}-${metal.image.name}`;
          const url = await uploadFile(path, metal.image);
          return { type: metal.type, feature: metal.feature, imageUrl: url };
        })
      );

      await addDoc(collection(db, "products"), {
        ...form,
        productId: generateProductId(),
        price: parseFloat(form.price),
        caratWeight: form.isLabGrown ? form.caratWeight : "",
        metals: metalData,
        images: mainImageUrls,
        sizes: form.sizes.map((s) => ({
          ...s,
          price: parseFloat(s.price),
          quantity: parseInt(s.quantity, 10)
        })),
        createdAt: serverTimestamp(),
      });

      alert("Product added successfully!");
      navigate("/admin/products");
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Error adding product: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Add New Product</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" placeholder="Product Name" required onChange={handleChange} className="w-full border px-4 py-2 rounded" />
          <input
            name="price"
            type="number"
            min="0"
            step="0.01"
            placeholder="Base Price"
            required
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          />

          <select value={form.category} onChange={handleCategoryChange} required className="w-full border px-4 py-2 rounded">
            <option value="">Select Category</option>
            {Object.keys(CATEGORY_MAP).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select value={form.subCategory} onChange={handleSubCategoryChange} required disabled={!selectedCategory} className="w-full border px-4 py-2 rounded">
            <option value="">Select Subcategory</option>
            {subcategories.map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>

          {/* Symbol Type Dropdown */}
          {form.category === "Charms" && form.subCategory === "Symbols" && (
            <select name="symbolType" value={form.symbolType} onChange={handleChange} required className="w-full border px-4 py-2 rounded">
              <option value="">Select Symbol Type</option>
              {SYMBOL_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          )}

          <textarea name="description" placeholder="Product Description" required onChange={handleChange} className="w-full border px-4 py-2 rounded" />

          <select name="engravable" value={form.engravable} onChange={handleChange} className="w-full border px-4 py-2 rounded">
            <option value="No">Engravable: No</option>
            <option value="Yes">Engravable: Yes</option>
          </select>

          <div className="flex items-center gap-2">
            <input type="checkbox" name="isLabGrown" checked={form.isLabGrown} onChange={handleChange} />
            <label>Includes Lab-Grown Diamond</label>
          </div>

          {form.isLabGrown && (
            <input
              name="caratWeight"
              placeholder="Carat Weight (e.g., 0.25 carat)"
              value={form.caratWeight}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded"
            />
          )}

          <p className="text-sm text-gray-600">Upload 1 to 6 main images</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mainImages.map((_, i) => (
              <div key={i} className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  required={i === 0}
                  onChange={(e) => handleMainImageChange(i, e.target.files[0])}
                  className="border px-4 py-2 rounded"
                />
                {mainImagePreviews[i] && (
                  <img src={mainImagePreviews[i]} alt={`Main Preview ${i}`} className="h-24 rounded object-cover" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-4">
            <p className="text-sm font-semibold">Metals *</p>
            {form.metals.map((metal, index) => (
              <div key={index} className="space-y-2 mb-4">
                <input placeholder="Metal Type" value={metal.type} onChange={(e) => handleMetalChange(index, "type", e.target.value)} className="w-full border px-4 py-2 rounded" required={index === 0} />
                
                <textarea
                  placeholder="Special Feature"
                  value={metal.feature}
                  onChange={(e) => handleMetalChange(index, "feature", e.target.value)}
                  className="w-full border px-4 py-2 rounded"
                />

                
                <input type="file" accept="image/*" onChange={(e) => handleMetalImageChange(index, e.target.files[0])} className="w-full border px-4 py-2 rounded" required={index === 0} />
                {metalImagePreviews[index] && (
                  <img src={metalImagePreviews[index]} alt={`Metal Preview ${index}`} className="h-20 rounded object-cover" />
                )}
              </div>
            ))}
            <button type="button" onClick={handleAddMetal} className="text-blue-600 text-sm">+ Add Metal</button>
          </div>

          <input name="love" placeholder="Why you’ll love it" onChange={handleChange} className="w-full border px-4 py-2 rounded" />
          <input name="handFinished" placeholder="Hand-finished" onChange={handleChange} className="w-full border px-4 py-2 rounded" />
          <input name="keepPerfect" placeholder="Keep it perfect" onChange={handleChange} className="w-full border px-4 py-2 rounded" />
          <input name="workWith" placeholder="Work with" onChange={handleChange} className="w-full border px-4 py-2 rounded" />
          <input name="dimensions" placeholder="Dimensions (e.g., 8.3mm deep, 10.5mm high, 11.5mm wide)" onChange={handleChange} className="w-full border px-4 py-2 rounded" />

          <div className="mt-4">
            <p className="text-sm font-semibold">Sizes (Optional)</p>
            {form.sizes.map((size, index) => (
              <div key={index} className="grid grid-cols-3 gap-2 mb-2">
                <select
                  value={size.size}
                  onChange={(e) => handleSizeChange(index, "size", e.target.value)}
                  className="border px-2 py-1 rounded"
                >
                  <option value="">Select Size</option>
                  {SIZE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Price"
                  value={size.price}
                  onChange={(e) => handleSizeChange(index, "price", e.target.value)}
                  className="border px-2 py-1 rounded"
                />
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Quantity"
                  value={size.quantity}
                  onChange={(e) => handleSizeChange(index, "quantity", e.target.value)}
                  className="border px-2 py-1 rounded"
                />
              </div>
            ))}
            <button type="button" onClick={handleAddSize} className="text-blue-600 text-sm">+ Add Size</button>
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 mt-4">
            Add Product
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
