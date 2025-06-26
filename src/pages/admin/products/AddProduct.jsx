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
  "One Size", "48 MM", "50 MM", "52 MM", "54 MM", "56 MM", "58 MM", "60 MM",
  "16 CM", "17 CM", "18 CM", "19 CM", "20 CM", "21 CM", "23 CM",
  "45 CM", "60 CM", "75 CM"
];

const COLOR_OPTIONS = [
  "No Color", "Black", "Blue", "Clear", "Green", "Grey", "Multicolour",
  "Orange", "Pink", "Purple", "Red", "White", "Yellow"
];

const METAL_OPTIONS = [
  "Ceramic", "Gold", "Meteorite", "Palladium", "Platinum", "Sterling Silver",
  "Stainless Steel", "Tantalum", "Titanium", "Tungsten"
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
      dimensions: "",
      shiningExample: "",
      importantInformation: "",
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
      sizes: [...prev.sizes, { size: "", price: "", quantity: "", color: "", metal: "" }],
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

  const handleRemoveMetal = (index) => {
    setForm((prev) => {
      const updated = [...prev.metals];
      updated.splice(index, 1);
      return { ...prev, metals: updated };
    });
    setMetalImagePreviews((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleRemoveSize = (index) => {
    setForm((prev) => {
      const updated = [...prev.sizes];
      updated.splice(index, 1);
      return { ...prev, sizes: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
    if (!mainImages[0]) return alert("Upload at least one image");
    if (!form.metals[0].type || !form.metals[0].image)
      return alert("At least one metal type with image is required");
    if (form.sizes.length === 0)
      return alert("At least one size is required");

      const firstSize = form.sizes[0];

      if (
        !firstSize.size ||
        !firstSize.price ||
        isNaN(parseFloat(firstSize.price)) ||
        !firstSize.quantity ||
        isNaN(parseInt(firstSize.quantity, 10))
      ) {
        return alert("Please fill all fields (size, price, quantity) for the first size.");
      }

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

      const formattedSizes = Array.from(form.sizes).map((s) => ({
        ...s,
        price: parseFloat(s.price),
        quantity: parseInt(s.quantity, 10),
        color: s.color || "",
        metal: s.metal || "",
      }));

      const basePrice = formattedSizes[0]?.price || 0;

      await addDoc(collection(db, "products"), {
        ...form,
        productId: generateProductId(),
        price: basePrice,
        caratWeight: form.isLabGrown ? form.caratWeight : "",
        metals: metalData,
        images: mainImageUrls,
        sizes: formattedSizes,
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
        <button
          type="button"
          onClick={() => navigate("/admin/products")}
          className="mb-4 text-sm text-indigo-600 hover:underline"
        >
          ← Back to Product List
        </button>
        <h2 className="text-2xl font-semibold mb-6">Add New Product</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" placeholder="Product Name" required onChange={handleChange} className="w-full border px-4 py-2 rounded" />

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
            <p className="text-sm font-semibold">Metal Descriptions *</p>
            {form.metals.map((metal, index) => (
              <div key={index} className="space-y-2 mb-4 border rounded p-3 relative">
                <input
                  placeholder="Metal Type"
                  value={metal.type}
                  onChange={(e) => handleMetalChange(index, "type", e.target.value)}
                  className="w-full border px-4 py-2 rounded"
                  required={index === 0}
                />

                <textarea
                  placeholder="Special Feature"
                  value={metal.feature}
                  onChange={(e) => handleMetalChange(index, "feature", e.target.value)}
                  className="w-full border px-4 py-2 rounded"
                />

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleMetalImageChange(index, e.target.files[0])}
                  className="w-full border px-4 py-2 rounded"
                  required={index === 0}
                />

                {/* Preview Image */}
                {metalImagePreviews[index] && (
                  <img
                    src={metalImagePreviews[index]}
                    alt={`Metal Preview ${index}`}
                    className="h-20 rounded object-cover"
                  />
                )}

                {/* Remove button BELOW file input */}
                {form.metals.length > 1 && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveMetal(index)}
                      className="text-red-500 text-sm"
                    >
                      REMOVE
                    </button>
                  </div>
                )}
              </div>

            ))}
            <button type="button" onClick={handleAddMetal} className="text-blue-600 text-sm">+ Add Metal</button>
          </div>

          <p className="text-sm font-semibold">Highlights</p>
          <input
            name="shiningExample"
            placeholder="Setting a shining example"
            value={form.highlights.shiningExample}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          />
          <input
            name="love"
            placeholder="Why you’ll love it"
            value={form.highlights.love}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          />
          <input
            name="importantInformation"
            placeholder="Important information"
            value={form.highlights.importantInformation}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          />
          <input
            name="handFinished"
            placeholder="Hand-finished"
            value={form.highlights.handFinished}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          />
          <input
            name="keepPerfect"
            placeholder="Keep it perfect"
            value={form.highlights.keepPerfect}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          />
          <input
            name="workWith"
            placeholder="Work with"
            value={form.highlights.workWith}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          />
          <input
            name="dimensions"
            placeholder="Dimensions (e.g., 8.3mm deep, 10.5mm high, 11.5mm wide)"
            value={form.highlights.dimensions}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          />


          <div className="mt-4">
            <p className="text-sm font-semibold">Sizes</p>
            {form.sizes.map((size, index) => (
              <div key={index} className="grid grid-cols-6 gap-2 mb-2 items-center">
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

                <select
                  value={size.color}
                  onChange={(e) => handleSizeChange(index, "color", e.target.value)}
                  className="border px-2 py-1 rounded"
                >
                  <option value="">Select Color</option>
                  {COLOR_OPTIONS.map((color) => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>

                <select
                  value={size.metal}
                  onChange={(e) => handleSizeChange(index, "metal", e.target.value)}
                  className="border px-2 py-1 rounded"
                >
                  <option value="">Select Metal</option>
                  {METAL_OPTIONS.map((metal) => (
                    <option key={metal} value={metal}>{metal}</option>
                  ))}
                </select>

                {/* Remove button */}
                {form.sizes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSize(index)}
                    className="text-red-500 text-small"
                  >
                    REMOVE
                  </button>
                )}
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
