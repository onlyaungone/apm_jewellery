import React, { useState } from "react";
import { useCart } from "../../context/CartContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../utils/firebaseConfig";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const CheckoutPage = () => {
  const { cartItems, setCartItems } = useCart();
  const [validating, setValidating] = useState(false);
  const [email, setEmail] = useState("");
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const calculateTotal = () => {
    return cartItems
      .reduce((total, item) => {
        const discountedPrice = item.price * (1 - item.discount / 100);
        return total + discountedPrice * item.quantity;
      }, 0)
      .toFixed(2);
  };

  const validateStockAndCheckout = async (e) => {
    e.preventDefault();
    setValidating(true);

    try {
      // 🔎 Validate stock
      for (const item of cartItems) {
        const docRef = doc(db, "products", item.productId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          toast.error(`${item.productName} no longer exists.`);
          setValidating(false);
          return;
        }

        const product = docSnap.data();
        const sizeObj = product.sizes.find((s) => s.size === item.size);
        if (!sizeObj || sizeObj.stock < item.quantity) {
          toast.error(`Only ${sizeObj?.stock || 0} left for ${item.productName} (${item.size})`);
          setValidating(false);
          return;
        }
      }

      // 💳 Stripe payment simulation (no server-side intent in this mock)
      if (!stripe || !elements) {
        toast.error("Stripe not initialized.");
        setValidating(false);
        return;
      }

      const cardElement = elements.getElement(CardElement);
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: { email },
      });

      if (error) {
        toast.error(error.message);
        setValidating(false);
        return;
      }

      // ✅ Simulate order success and update stock
      for (const item of cartItems) {
        const docRef = doc(db, "products", item.productId);
        const docSnap = await getDoc(docRef);
        const product = docSnap.data();

        const updatedSizes = product.sizes.map((s) =>
          s.size === item.size ? { ...s, stock: s.stock - item.quantity } : s
        );

        await updateDoc(docRef, { sizes: updatedSizes });
      }

      toast.success("Payment successful. Order placed!");
      setCartItems([]);
      navigate("/order-success");
    } catch (err) {
      console.error(err);
      toast.error("Checkout failed.");
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
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

      <form onSubmit={validateStockAndCheckout} className="space-y-4 mt-6">
        <label className="block text-sm font-medium">
          Email:
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </label>

        <label className="block text-sm font-medium">
          Card Information:
          <CardElement className="mt-1 border px-3 py-2 rounded" />
        </label>

        <p className="text-xl font-bold mt-4">
          Total: <span className="text-green-600">${calculateTotal()}</span>
        </p>

        <button
          type="submit"
          disabled={validating}
          className="w-full bg-black text-white px-6 py-3 rounded hover:bg-gray-800"
        >
          {validating ? "Processing..." : "Confirm & Checkout"}
        </button>
      </form>
    </div>
  );
};

export default CheckoutPage;
