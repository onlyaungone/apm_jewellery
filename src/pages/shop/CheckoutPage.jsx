import React, { useEffect, useState } from "react";
import { useCart } from "../../context/CartContext";
import { collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../utils/firebaseConfig";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const CheckoutPage = () => {
  const { cartItems, setCartItems } = useCart();
  const [validating, setValidating] = useState(false);
  const navigate = useNavigate();

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const discountedPrice = item.price * (1 - item.discount / 100);
      return total + discountedPrice * item.quantity;
    }, 0).toFixed(2);
  };

  const validateStockAndCheckout = async () => {
    setValidating(true);

    try {
      for (const item of cartItems) {
        const docRef = doc(db, "products", item.productId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          toast.error(`Product ${item.productName} no longer exists.`);
          setValidating(false);
          return;
        }

        const data = docSnap.data();
        const sizeEntry = data.sizes.find((s) => s.size === item.size);

        if (!sizeEntry || sizeEntry.stock < item.quantity) {
          toast.error(`Only ${sizeEntry?.stock || 0} left for ${item.productName} (${item.size})`);
          setValidating(false);
          return;
        }
      }

      // Update stock and clear cart
      for (const item of cartItems) {
        const productRef = doc(db, "products", item.productId);
        const productSnap = await getDoc(productRef);
        const productData = productSnap.data();
        const updatedSizes = productData.sizes.map((s) => {
          if (s.size === item.size) {
            return { ...s, stock: s.stock - item.quantity };
          }
          return s;
        });
        await updateDoc(productRef, { sizes: updatedSizes });
      }

      toast.success("Order placed successfully!");
      setCartItems([]); // clear cart
      navigate("/order-success");
    } catch (err) {
      console.error(err);
      toast.error("Checkout failed. Please try again.");
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Review & Confirm Your Order</h1>
      {cartItems.map((item) => (
        <div key={item.key} className="mb-4 border p-4 rounded">
          <p><strong>{item.productName}</strong> (Size: {item.size})</p>
          <p>Qty: {item.quantity}</p>
          <p>
            Price: ${(item.price * (1 - item.discount / 100)).toFixed(2)}
          </p>
        </div>
      ))}
      <p className="text-xl font-bold mt-4">
        Total: <span className="text-green-600">${calculateTotal()}</span>
      </p>
      <button
        onClick={validateStockAndCheckout}
        disabled={validating}
        className="mt-4 bg-black text-white px-6 py-3 rounded hover:bg-gray-800"
      >
        {validating ? "Processing..." : "Confirm & Checkout"}
      </button>
    </div>
  );
};

export default CheckoutPage;
