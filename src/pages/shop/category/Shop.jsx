import React, { useEffect, useState } from "react";
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

// Category to Subcategory Mapping
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

const ITEMS_PER_PAGE = 8;

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState("All");
  const [sortOption, setSortOption] = useState("default");
  const [allCategories, setAllCategories] = useState([]);

  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      const snapshot = await getDocs(collection(db, "products"));
      const productList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProducts(productList);

      const uniqueCategories = [...new Set(productList.map((p) => p.category).filter(Boolean))];
      setAllCategories(uniqueCategories);
    };
    fetchProducts();
  }, []);

  // Wishlist sync
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

  // Wishlist toggle
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

  // Filtering logic
  let filteredProducts = products
    .filter((p) =>
      selectedCategories.length === 0 ? true : selectedCategories.includes(p.category)
    )
    .filter((p) =>
      selectedSubcategory === "All"
        ? true
        : p.subCategory?.toLowerCase().trim() === selectedSubcategory.toLowerCase().trim()
    )
    .map((p) => ({ ...p, isWished: wishlistIds.includes(p.id) }));

  // Sorting
  switch (sortOption) {
    case "priceLowHigh":
      filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case "priceHighLow":
      filteredProducts.sort((a, b) => b.price - a.price);
      break;
    case "nameAZ":
      filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "nameZA":
      filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
      break;
    default:
      break;
  }

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo(0, 0);
    }
  };

  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedCategories((prev) => [...prev, value]);
    } else {
      setSelectedCategories((prev) => prev.filter((cat) => cat !== value));
    }
    setSelectedSubcategory("All");
  };

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setSelectedSubcategory("All");
    setSortOption("default");
  };

  return (
    <div className="py-8">
      <Breadcrumb />
      <div className="flex justify-between items-center px-4 mb-6">
        <h1 className="text-3xl font-bold">
          {selectedCategories.length === 0 ? "All Jewellery" : selectedCategories.join(", ")}
          {selectedSubcategory !== "All" ? ` - ${selectedSubcategory}` : ""}
        </h1>
        <button
          className="flex items-center gap-2 border px-4 py-2 rounded hover:bg-gray-100"
          onClick={() => setShowFilter(true)}
        >
          <FaFilter /> Filter <span className="text-gray-500">{filteredProducts.length} products</span>
        </button>
      </div>

      {/* Filter Sidebar */}
      {showFilter && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-40"
            onClick={() => setShowFilter(false)}
          />
          <div className="fixed top-0 right-0 h-full w-full sm:w-80 bg-white z-50 p-6 shadow-lg overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">FILTER</h2>
              <button onClick={() => setShowFilter(false)} className="text-2xl">&times;</button>
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <label className="font-medium">Categories</label>
              {allCategories.map((cat, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={cat}
                    checked={selectedCategories.includes(cat)}
                    onChange={handleCategoryChange}
                  />
                  <span>{cat}</span>
                </div>
              ))}
            </div>

            {/* Subcategories */}
            {selectedCategories.length === 1 && (
              <div className="mt-4">
                <label className="font-medium">Subcategory</label>
                <select
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  className="w-full border px-3 py-2 rounded mt-1"
                >
                  <option value="All">All</option>
                  {(CATEGORY_MAP[selectedCategories[0]] || []).map((sub, idx) => (
                    <option key={idx} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort */}
            <div className="mt-4">
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

            {/* Reset + Apply */}
            <div className="mt-6 space-y-2">
              <button
                onClick={handleResetFilters}
                className="w-full bg-gray-300 text-black py-2 rounded hover:bg-gray-400"
              >
                Reset Filters
              </button>
              <button
                onClick={() => setShowFilter(false)}
                className="w-full bg-black text-white py-2 rounded"
              >
                View Products ({filteredProducts.length})
              </button>
            </div>
          </div>
        </>
      )}

      <ProductGrid
        products={paginatedProducts}
        showHeart
        onToggleWishlist={handleToggleWishlist}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-1 text-sm">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded-md bg-white hover:bg-gray-100 disabled:opacity-50"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={`px-3 py-1 border rounded-md ${
                currentPage === i + 1
                  ? "bg-black text-white font-semibold"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded-md bg-white hover:bg-gray-100 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Shop;
