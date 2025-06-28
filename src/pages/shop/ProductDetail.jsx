import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, deleteDoc, getDoc as fetchDoc } from "firebase/firestore";
import { db } from "../../utils/firebaseConfig";
import { useCart } from "../../context/CartContext";
import toast from "react-hot-toast";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  FaGem,
  FaHeart,
  FaInfoCircle,
  FaHandHoldingHeart,
  FaStar,
  FaRulerCombined,
  FaPencilAlt,
  FaRegHeart,
} from "react-icons/fa";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [user, setUser] = useState(null);
  const [wishlistAdded, setWishlistAdded] = useState(false);
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

    const checkWishlist = async (userId) => {
      const wishDoc = await fetchDoc(doc(db, "users", userId, "wishlist", id));
      setWishlistAdded(wishDoc.exists());
    };

    fetchProduct();

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) checkWishlist(currentUser.uid);
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

  const handleWishlistToggle = async () => {
    if (!user) {
      toast.error("Please log in to add to wishlist.");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }

    const wishRef = doc(db, "users", user.uid, "wishlist", product.docId);
    try {
      if (wishlistAdded) {
        await deleteDoc(wishRef);
        toast.success("Removed from Wishlist.");
        setWishlistAdded(false);
      } else {
        await setDoc(wishRef, {
          ...product,
          addedAt: new Date(),
        });
        toast.success("Added to Wishlist!");
        setWishlistAdded(true);
      }
    } catch (error) {
      toast.error("Wishlist update failed.");
      console.error(error);
    }
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
                selectedImage === img ? "ring-2 ring-gray-500" : ""
              }`}
              onClick={() => setSelectedImage(img)}
            />
          ))}
        </div>
      </div>

      {/* Info */}
      <div>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <button
            onClick={handleWishlistToggle}
            className={`w-12 aspect-square flex items-center justify-center rounded-full border transition duration-200 ${
              wishlistAdded ? "bg-red-100 border-red-300" : "bg-white border-gray-300"
            } hover:shadow-md`}
            title={wishlistAdded ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            {wishlistAdded ? (
              <FaHeart className="text-red-500 text-lg" />
            ) : (
              <FaRegHeart className="text-gray-600 text-lg" />
            )}
          </button>
        </div>

        {product.productId && (
          <p className="text-sm text-gray-500 mb-2">
            Product ID: <span className="font-mono">{product.productId}</span>
          </p>
        )}

        {/* Price */}
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

        {/* Description */}
        {product.description && (
          <p className="mb-4 text-gray-700">{product.description}</p>
        )}

        {/* Highlights */}
        <div className="mb-6 space-y-5">
          {product.highlights?.shiningExample && (
            <Highlight icon={<FaStar />} title="Setting a shining example" desc={product.highlights.shiningExample} />
          )}
          {product.highlights?.love && (
            <Highlight icon={<FaHeart />} title="Why you'll love it" desc={product.highlights.love} />
          )}
          {product.highlights?.importantInformation && (
            <Highlight icon={<FaInfoCircle />} title="Important Information" desc={product.highlights.importantInformation} />
          )}
          {product.highlights?.handFinished && (
            <Highlight icon={<FaHandHoldingHeart />} title="Hand-finished" desc={product.highlights.handFinished} />
          )}
          {product.highlights?.keepPerfect && (
            <Highlight icon={<FaGem />} title="Keep it perfect" desc={product.highlights.keepPerfect} />
          )}
          {product.highlights?.dimensions && (
            <Highlight icon={<FaRulerCombined />} title="Dimensions" desc={product.highlights.dimensions} />
          )}
        </div>

        {/* Special Features */}
        <div className="space-y-3 mb-6">
          {product.engravable === "Yes" && (
            <Feature icon={<FaPencilAlt />} label="Engravable" />
          )}
          {product.isLabGrown && (
            <div className="flex items-start gap-3 text-gray-700 text-sm">
              <div>
                <p className="font-semibold">Lab-Grown Diamond</p>
                {product.caratWeight && <p>Carat: {product.caratWeight}</p>}
                {product.clarity && <p>Clarity: {product.clarity}</p>}
                {product.color && <p>Color: {product.color}</p>}
                {product.shape && <p>Shape: {product.shape}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Metal Details */}
        {product.metals.map((metal, idx) => (
          <div key={idx} className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 rounded-full overflow-hidden border shadow-sm flex items-center justify-center bg-white">
              <img
                src={metal.imageUrl}
                alt={`Metal ${idx}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-sm text-gray-800">
              {metal.type && <p className="font-semibold">{metal.type}</p>}
              {metal.feature && metal.feature.includes('\n') ? (
                metal.feature.split('\n').map((line, i) => (
                  <p key={i} className="text-gray-600">{line}</p>
                ))
              ) : (
                <p className="text-gray-600">{metal.feature}</p>
              )}
            </div>
          </div>
        ))}

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
          className="mt-4 bg-gray-700 hover:bg-gray-800 text-white font-semibold px-6 py-3 rounded"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

// Highlight Component
const Highlight = ({ icon, title, desc }) => (
  <div className="flex items-start gap-4">
    <div className="w-10 h-10 rounded-full border flex items-center justify-center text-lg text-gray-600">
      {icon}
    </div>
    <div>
      <p className="font-semibold">{title}</p>
      <p className="text-gray-600 text-sm">{desc}</p>
    </div>
  </div>
);

// Feature Tag Component
const Feature = ({ icon, label }) => (
  <div className="flex items-center gap-2 text-gray-700 text-sm">
    {icon}
    <span className="font-medium">{label}</span>
  </div>
);

export default ProductDetail;
