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

const isWithinPromo = (promoStart, promoEnd) => {
  if (!promoStart || !promoEnd) return false;
  const today = new Date();
  const start = new Date(promoStart);
  const end = new Date(promoEnd);
  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return today >= start && today <= end;
};

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

  const promoActive = isWithinPromo(product?.promoStart, product?.promoEnd);
  const discount = promoActive ? selectedSizeObj?.discount || 0 : 0;
  const basePrice = parseFloat(selectedSizeObj?.price || 0);
  const finalPrice = (basePrice - (basePrice * discount) / 100).toFixed(2);

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
    <div className="max-w-6xl mx-auto px-4 py-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Images */}
      <div>
        <img
          src={selectedImage}
          alt={product.name}
          className="w-full h-auto rounded-lg border object-cover"
        />
        <div className="flex flex-wrap gap-2 mt-4">
          {product.images?.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`Preview ${idx}`}
              className={`w-16 h-16 sm:w-20 sm:h-20 border rounded object-cover cursor-pointer ${
                selectedImage === img ? "ring-2 ring-gray-500" : ""
              }`}
              onClick={() => setSelectedImage(img)}
            />
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="space-y-4">
        {/* Title & Wishlist */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold">{product.name}</h1>
          <button
            onClick={handleWishlistToggle}
            className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full border transition duration-200 ${
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

        {/* Product ID */}
        {product.productId && (
          <p className="text-sm text-gray-500">
            Product ID: <span className="font-mono">{product.productId}</span>
          </p>
        )}

        {/* Price */}
        {selectedSizeObj && (
          <div className="mb-2">
            {discount > 0 ? (
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-red-600 text-2xl font-semibold">A${finalPrice}</span>
                <span className="line-through text-black text-lg">A${basePrice.toFixed(2)}</span>
                <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
                  SAVE {discount}%
                </span>
              </div>
            ) : (
              <span className="text-black text-2xl font-semibold">A${basePrice.toFixed(2)}</span>
            )}
          </div>
        )}

        {/* Description */}
        {product.description && (
          <p className="text-gray-700 text-sm sm:text-base">{product.description}</p>
        )}

        {/* Highlights */}
        <div className="space-y-4">
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
        <div className="space-y-3">
          {product.engravable === "Yes" && (
            <Feature icon={<FaPencilAlt />} label="Engravable" />
          )}
          {product.isLabGrown && (
            <div className="text-sm text-gray-700">
              <p className="font-semibold">Lab-Grown Diamond</p>
              {product.caratWeight && <p>Carat: {product.caratWeight}</p>}
              {product.clarity && <p>Clarity: {product.clarity}</p>}
              {product.color && <p>Color: {product.color}</p>}
              {product.shape && <p>Shape: {product.shape}</p>}
            </div>
          )}
        </div>

        {/* Metals */}
        {product.metals?.map((metal, idx) => (
          <div key={idx} className="flex flex-col sm:flex-row gap-3 mb-3 sm:items-start">
            <div className="w-12 h-12 rounded-full overflow-hidden border bg-white shadow-sm flex items-center justify-center mx-auto sm:mx-0">
              <img src={metal.imageUrl} alt={`Metal ${idx}`} className="w-full h-full object-cover" />
            </div>
            <div className="text-sm text-center sm:text-left text-gray-800">
              <p className="font-semibold">{metal.type}</p>
              {metal.feature?.includes('\n') ? (
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
        <div>
          <label className="block font-medium mb-1">Select Size:</label>
          <div className="flex flex-wrap gap-2">
            {product.sizes?.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedSize(item.size)}
                className={`px-3 py-1 border rounded text-sm ${
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

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          className="w-full sm:w-auto mt-4 bg-gray-800 hover:bg-black text-white font-semibold px-6 py-3 rounded"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );

};

// Highlight Component
const Highlight = ({ icon, title, desc }) => (
  <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
    <div className="w-10 h-10 rounded-full border flex items-center justify-center text-lg text-gray-600 shrink-0">
      {icon}
    </div>
    <div>
      <p className="font-semibold text-sm sm:text-base">{title}</p>
      <p className="text-gray-600 text-sm sm:text-[15px]">{desc}</p>
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
