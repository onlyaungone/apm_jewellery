import React, { useEffect, useState } from "react";
import { auth, db } from "../../utils/firebaseConfig";
import {
  collection,
  doc,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore";
import Breadcrumb from "../../components/Breadcrumb";
import ProductGrid from "../../components/ProductGrid";

const WishLists = () => {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const wishlistRef = collection(db, "users", user.uid, "wishlist");
    const unsubscribe = onSnapshot(wishlistRef, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setWishlist(items);
    });

    return () => unsubscribe();
  }, []);

  const removeFromWishlist = async (id) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await deleteDoc(doc(db, "users", user.uid, "wishlist", id));
    } catch (err) {
      console.error("Failed to remove from wishlist:", err);
    }
  };

  return (
    <div className="py-8">
      <Breadcrumb />
      <h1 className="text-3xl font-bold text-center mb-8">My Wishlist</h1>

      {wishlist.length === 0 ? (
        <p className="text-center text-gray-600">Your wishlist is currently empty.</p>
      ) : (
        <ProductGrid
          products={wishlist.map((p) => ({ ...p, isWished: true }))}
          onToggleWishlist={removeFromWishlist}
          showHeart
        />
      )}
    </div>
  );
};

export default WishLists;
