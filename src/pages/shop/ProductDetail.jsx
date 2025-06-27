import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../utils/firebaseConfig";
import { useCart } from "../../context/CartContext";
import toast from "react-hot-toast";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [user, setUser] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      const docRef = doc(db, "products", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProduct({ ...data, docId: docSnap.id });
        setSelectedImage(data.images?.[0] || "");
        setSelectedSize(data.sizes?.[0]?.size || "");
      }
    };

    fetchProduct();

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, [id]);

  const selectedSizeObj = product?.sizes?.find(
    (item) => item.size === selectedSize
  );

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please log in to add items to your cart.");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }

    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }

    addToCart(product, selectedSizeObj);
    toast.success(
      `Added "${product.name}" (size: ${selectedSizeObj.size}) to cart for $${selectedSizeObj.price}`
    );
  };

  if (!product) {
    return <div className="p-8 text-center">Loading product...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Images */}
      <div>
        <img
          src={selectedImage}
          alt={product.name}
          className="w-full rounded-lg border"
        />
        <div className="flex gap-2 mt-4">
          {product.images?.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`Preview ${idx}`}
              className={`w-20 h-20 border rounded cursor-pointer ${
                selectedImage === img ? "ring-2 ring-indigo-500" : ""
              }`}
              onClick={() => setSelectedImage(img)}
            />
          ))}
        </div>
      </div>

      {/* Info */}
      <div>
        <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
        {product.productId && (
          <p className="text-sm text-gray-500 mb-2">
            Product ID: <span className="font-mono">{product.productId}</span>
          </p>
        )}

        {/* Price Section */}
        {selectedSizeObj && (
          <div className="mb-4">
            {selectedSizeObj.discount > 0 ? (
              <div className="flex items-center gap-4">
                <span className="text-red-600 text-2xl font-semibold">
                  A$
                  {(
                    selectedSizeObj.price -
                    (selectedSizeObj.price * selectedSizeObj.discount) / 100
                  ).toFixed(2)}
                </span>
                <span className="line-through text-black text-lg">
                  A${parseFloat(selectedSizeObj.price).toFixed(2)}
                </span>
                <span className="bg-red-100 text-red-700 text-sm font-bold px-3 py-1 rounded-full">
                  SAVE {selectedSizeObj.discount}%
                </span>
              </div>
            ) : (
              <span className="text-black text-2xl font-semibold">
                A${parseFloat(selectedSizeObj.price).toFixed(2)}
              </span>
            )}
          </div>
        )}

        {product.description && (
          <p className="mb-4 text-gray-700">{product.description}</p>
        )}

        {/* Highlights */}
        <ul className="list-disc pl-5 mb-4 text-sm text-gray-600">
          {product.highlights?.shiningExample && (
            <li>{product.highlights.shiningExample}</li>
          )}
          {product.highlights?.love && <li>{product.highlights.love}</li>}
          {product.highlights?.importantInformation && (
            <li>{product.highlights.importantInformation}</li>
          )}
          {product.highlights?.handFinished && (
            <li>{product.highlights.handFinished}</li>
          )}
          {product.highlights?.keepPerfect && (
            <li>{product.highlights.keepPerfect}</li>
          )}
          {product.highlights?.workWith && (
            <li>{product.highlights.workWith}</li>
          )}
          {product.highlights?.dimensions && (
            <li>Dimensions: {product.highlights.dimensions}</li>
          )}
        </ul>

        {/* Special features */}
        {product.engravable === "Yes" && (
          <p className="mb-2 text-green-600 font-medium">Engravable</p>
        )}
        {product.isLabGrown && product.caratWeight && (
          <p className="mb-2 text-blue-600 font-medium">
            Lab-Grown Diamond: {product.caratWeight}
          </p>
        )}

        {/* Metal details */}
        {product.metals?.length > 0 && (
          <div className="mb-4">
            <p className="font-semibold mb-2">Metal Details</p>
            {product.metals.map((metal, idx) => (
              <div key={idx} className="mb-2">
                {metal.type && <p>Type: {metal.type}</p>}
                {metal.feature && <p>Feature: {metal.feature}</p>}
                {metal.imageUrl && (
                  <img
                    src={metal.imageUrl}
                    alt={`Metal ${idx}`}
                    className="h-20 mt-1 rounded border"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Size Selection */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Select Size:</label>
          <div className="flex flex-wrap gap-2">
            {product.sizes?.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedSize(item.size)}
                className={`px-4 py-2 border rounded ${
                  selectedSize === item.size
                    ? "bg-black text-white"
                    : "bg-white text-black"
                }`}
              >
                {item.size}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;
