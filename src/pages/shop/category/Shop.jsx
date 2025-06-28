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

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);

  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      const snapshot = await getDocs(collection(db, "products"));
      const productList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productList);
    };

    fetchProducts();
  }, []);

  // Fetch wishlist items for the logged-in user
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

  // Toggle heart/wishlist
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

  // Enrich product list with `isWished` flag
  const productsWithWishlistFlag = products.map((p) => ({
    ...p,
    isWished: wishlistIds.includes(p.id),
  }));

  return (
    <div className="py-8">
      <Breadcrumb />
      <h1 className="text-3xl font-bold text-center mb-8">All Jewellery</h1>
      <ProductGrid
        products={productsWithWishlistFlag}
        showHeart
        onToggleWishlist={handleToggleWishlist}
      />
    </div>
  );
};

export default Shop;
