import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, storage } from "../../../utils/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

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
    description: "",
    metals: [{ type: "", feature: "", image: null }],
    highlights: {
      love: "",
      handFinished: "",
      keepPerfect: "",
      workWith: "",
      dimensions: "",
    },
    sizes: [],
  });

  const [mainImages, setMainImages] = useState(Array(6).fill(null));
  const [mainImagePreviews, setMainImagePreviews] = useState(Array(6).fill(null));
  const [metalImagePreviews, setMetalImagePreviews] = useState([""]);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in form.highlights) {
      setForm((prev) => ({
        ...prev,
        highlights: { ...prev.highlights, [name]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleMetalChange = (index, field, value) => {
    const updatedMetals = [...form.metals];
    updatedMetals[index][field] = value;
    setForm((prev) => ({ ...prev, metals: updatedMetals }));
  };

  const handleMetalImageChange = (index, file) => {
    const updatedMetals = [...form.metals];
    updatedMetals[index].image = file;

    const updatedPreviews = [...metalImagePreviews];
    updatedPreviews[index] = file ? URL.createObjectURL(file) : null;

    setForm((prev) => ({ ...prev, metals: updatedMetals }));
    setMetalImagePreviews(updatedPreviews);
  };

  const handleAddMetal = () => {
    setForm((prev) => ({
      ...prev,
      metals: [...prev.metals, { type: "", feature: "", image: null }],
    }));
    setMetalImagePreviews((prev) => [...prev, null]);
  };

  const handleMainImageChange = (index, file) => {
    const updatedImages = [...mainImages];
    const updatedPreviews = [...mainImagePreviews];
    updatedImages[index] = file;
    updatedPreviews[index] = file ? URL.createObjectURL(file) : null;
    setMainImages(updatedImages);
    setMainImagePreviews(updatedPreviews);
  };

  const handleAddSize = () => {
    setForm((prev) => ({
      ...prev,
      sizes: [...prev.sizes, { size: "", price: "" }],
    }));
  };

  const handleSizeChange = (index, field, value) => {
    const updatedSizes = [...form.sizes];
    updatedSizes[index][field] = value;
    setForm((prev) => ({ ...prev, sizes: updatedSizes }));
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
      const selectedMainImages = mainImages.filter((img) => img);
      if (selectedMainImages.length === 0) {
        alert("Please upload at least one main image.");
        return;
      }

      if (!form.metals[0].type || !form.metals[0].image) {
        alert("At least one metal type with image is required.");
        return;
      }

      const mainImageUrls = await Promise.all(
        selectedMainImages.map(async (image) => {
          const path = `products/main/${uuidv4()}-${image.name}`;
          return await uploadFile(path, image);
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
        images: mainImageUrls,
        metals: metalData,
        sizes: form.sizes.map((s) => ({ ...s, price: parseFloat(s.price) })),
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
          <input name="price" type="number" placeholder="Base Price" required onChange={handleChange} className="w-full border px-4 py-2 rounded" />
          <input name="category" placeholder="Category" required onChange={handleChange} className="w-full border px-4 py-2 rounded" />
          <textarea name="description" placeholder="Product Description" required onChange={handleChange} className="w-full border px-4 py-2 rounded" />

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
                <input placeholder="Special Feature" value={metal.feature} onChange={(e) => handleMetalChange(index, "feature", e.target.value)} className="w-full border px-4 py-2 rounded" />
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
              <div key={index} className="flex gap-2 mb-2">
                <input placeholder="Size" value={size.size} onChange={(e) => handleSizeChange(index, "size", e.target.value)} className="border px-2 py-1 rounded w-1/2" />
                <input type="number" placeholder="Price" value={size.price} onChange={(e) => handleSizeChange(index, "price", e.target.value)} className="border px-2 py-1 rounded w-1/2" />
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
