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

const capitalize = (str) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

const CategoryPage = () => {
  const { type } = useParams();
  const category = capitalize(type);

  const [products, setProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);

  // Fetch category-specific products
  useEffect(() => {
    const fetchCategoryProducts = async () => {
      const snapshot = await getDocs(collection(db, "products"));
      const filtered = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((p) => p.category?.toLowerCase() === type.toLowerCase());

      setProducts(filtered);
    };

    fetchCategoryProducts();
  }, [type]);

  // Fetch wishlist for current user
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

  // Toggle heart state
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

  // Mark products with `isWished`
  const productsWithHeart = products.map((p) => ({
    ...p,
    isWished: wishlistIds.includes(p.id),
  }));

  return (
    <div className="py-8">
      <Breadcrumb />
      <h1 className="text-3xl font-bold text-center mb-8">{category}</h1>

      <ProductGrid
        products={productsWithHeart}
        showHeart
        onToggleWishlist={handleToggleWishlist}
      />

      {products.length === 0 && (
        <p className="text-center text-gray-500">No products found in this category.</p>
      )}
    </div>
  );
};

export default CategoryPage;
