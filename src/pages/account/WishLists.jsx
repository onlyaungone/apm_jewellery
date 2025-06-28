import React, { useEffect, useState } from "react";
import { auth, db } from "../../utils/firebaseConfig";
import {
  collection,
  doc,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const WishLists = () => {
  const [wishlist, setWishlist] = useState([]);
  const navigate = useNavigate();

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
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Wishlist</h1>
      {wishlist.length === 0 ? (
        <p className="text-gray-600">Your wishlist is empty.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {wishlist.map((item) => {
            const firstImage = item.images?.[0] || item.image || "https://via.placeholder.com/300";
            const displayPrice = item.sizes?.[0]?.price || item.price || "N/A";

            return (
              <div
                key={item.id}
                className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition"
              >
                <img
                  src={firstImage}
                  alt={item.name}
                  className="h-48 w-full object-cover cursor-pointer"
                  onClick={() => navigate(`/product/${item.id}`)}
                />
                <div className="p-4">
                  <h2 className="font-semibold text-lg truncate">{item.name}</h2>
                  <p className="text-gray-600 text-sm mb-1">
                    A$ {parseFloat(displayPrice).toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WishLists;
