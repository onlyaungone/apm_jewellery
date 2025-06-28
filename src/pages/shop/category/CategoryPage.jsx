import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import { db, auth } from "../../../utils/firebaseConfig";
import ProductGrid from "../../../components/ProductGrid";
import Breadcrumb from "../../../components/Breadcrumb";
import { FaFilter } from "react-icons/fa";

// Map for subcategories
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

const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

const CategoryPage = () => {
  const { type } = useParams();
  const category = capitalize(type);

  const [products, setProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [sortOption, setSortOption] = useState("default");
  const [showFilter, setShowFilter] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState("All");

  // Fetch products by category
  useEffect(() => {
    const fetchCategoryProducts = async () => {
      const snapshot = await getDocs(collection(db, "products"));
      const filtered = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((p) =>
          p.category?.toLowerCase().trim() === category.toLowerCase().trim()
        );
      setProducts(filtered);
    };

    fetchCategoryProducts();
    setSelectedSubcategory("All");
  }, [category]);

  // Sync wishlist
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const wishlistRef = collection(db, "users", user.uid, "wishlist");
    const unsubscribe = onSnapshot(wishlistRef, (snapshot) => {
      const ids = snapshot.docs.map((doc) => doc.id);
      setWishlistIds(ids);
    });

    return () => unsubscribe();
  }, []);

  // Toggle wishlist heart
  const handleToggleWishlist = async (productId) => {
    const user = auth.currentUser;
    if (!user) return alert("Please login to use wishlist.");

    const wishlistRef = doc(db, "users", user.uid, "wishlist", productId);
    const exists = await getDoc(wishlistRef);

    if (exists.exists()) {
      await deleteDoc(wishlistRef);
    } else {
      const product = products.find((p) => p.id === productId);
      if (product) {
        await setDoc(wishlistRef, {
          name: product.name,
          price: product.price,
          images: product.images,
          sizes: product.sizes || [],
        });
      }
    }
  };

  // Filter + Sort
  let filtered = [...products]
    .filter((p) =>
      selectedSubcategory === "All"
        ? true
        : p.subCategory?.toLowerCase().trim() === selectedSubcategory.toLowerCase().trim()
    )
    .map((p) => ({
      ...p,
      isWished: wishlistIds.includes(p.id),
    }));

  switch (sortOption) {
    case "priceLowHigh":
      filtered.sort((a, b) => a.price - b.price);
      break;
    case "priceHighLow":
      filtered.sort((a, b) => b.price - a.price);
      break;
    case "nameAZ":
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "nameZA":
      filtered.sort((a, b) => b.name.localeCompare(a.name));
      break;
    default:
      break;
  }

  return (
    <div className="py-8">
      <Breadcrumb />

      <div className="flex justify-between items-center px-4 mb-6">
        <h1 className="text-3xl font-bold">
          {category}
          {selectedSubcategory !== "All" && ` - ${selectedSubcategory}`}
        </h1>
        <button
          className="flex items-center gap-2 border px-4 py-2 rounded hover:bg-gray-100"
          onClick={() => setShowFilter(true)}
        >
          <FaFilter /> Filter <span className="text-gray-500">{filtered.length} products</span>
        </button>
      </div>

      {/* Sidebar Filter */}
      {showFilter && (
        <>
          {/* Background */}
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-40"
            onClick={() => setShowFilter(false)}
          />

          {/* Sidebar */}
          <div className="fixed top-0 right-0 h-full w-full sm:w-80 bg-white z-50 p-6 shadow-lg overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">FILTER</h2>
              <button onClick={() => setShowFilter(false)} className="text-2xl">&times;</button>
            </div>

            {/* Subcategory */}
            <div className="mb-4">
              <label className="font-medium">Subcategory</label>
              <select
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                className="w-full border px-3 py-2 rounded mt-1"
              >
                <option value="All">All</option>
                {(CATEGORY_MAP[category] || []).map((sub, idx) => (
                  <option key={idx} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="font-medium">Sort by</label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full border px-3 py-2 rounded mt-1"
              >
                <option value="default">Default</option>
                <option value="priceLowHigh">Price: Low to High</option>
                <option value="priceHighLow">Price: High to Low</option>
                <option value="nameAZ">Name: A to Z</option>
                <option value="nameZA">Name: Z to A</option>
              </select>
            </div>

            <button
              onClick={() => setShowFilter(false)}
              className="w-full mt-6 bg-black text-white py-3 font-semibold rounded"
            >
              View Products ({filtered.length})
            </button>
          </div>
        </>
      )}

      <ProductGrid
        products={filtered}
        showHeart
        onToggleWishlist={handleToggleWishlist}
      />

      {products.length === 0 && (
        <p className="text-center text-gray-500 mt-10">No products found in this category.</p>
      )}
    </div>
  );
};

export default CategoryPage;
