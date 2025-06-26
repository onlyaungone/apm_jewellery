import React from "react";
import { useCart } from "../../context/CartContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../utils/firebaseConfig";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity /* , clearCart */ } = useCart();
  const navigate = useNavigate();

  const calculateTotal = () => {
    return cartItems
      .reduce((total, item) => {
        const discountedPrice = item.price * (1 - item.discount / 100);
        return total + discountedPrice * item.quantity;
      }, 0)
      .toFixed(2);
  };

  const handleCheckout = async () => {
    try {
      for (const item of cartItems) {
        const docRef = doc(db, "products", item.productId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          toast.error(`Product "${item.productName}" not found.`);
          return;
        }

        const productData = docSnap.data();
        const sizeIndex = productData.sizes.findIndex((s) => s.size === item.size);

        if (sizeIndex === -1) {
          toast.error(`Size ${item.size} not available for "${item.productName}".`);
          return;
        }

        const stock = productData.sizes[sizeIndex].stock;
        if (item.quantity > stock) {
          toast.error(
            `"${item.productName}" (${item.size}) has only ${stock} in stock.`
          );
          return;
        }
      }

      // ✅ Update stock if all items are valid
      for (const item of cartItems) {
        const docRef = doc(db, "products", item.productId);
        const docSnap = await getDoc(docRef);
        const productData = docSnap.data();

        const updatedSizes = productData.sizes.map((s) =>
          s.size === item.size
            ? { ...s, stock: s.stock - item.quantity }
            : s
        );

        await updateDoc(docRef, { sizes: updatedSizes });
      }

      toast.success("Order placed successfully!");
      // clearCart(); // Uncomment if your CartContext supports it
      navigate("/order-success"); // Optional: Create a thank you page
    } catch (error) {
      console.error("Checkout failed:", error);
      toast.error("Something went wrong during checkout.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your Shopping Bag</h1>

      {cartItems.length === 0 ? (
        <p className="text-gray-500">Your cart is empty.</p>
      ) : (
        <>
          {cartItems.map((item) => (
            <div key={item.key} className="flex items-center border-b py-4 gap-4">
              <img
                src={item.image}
                alt={item.productName}
                className="w-20 h-20 object-cover rounded"
              />
              <div className="flex-1">
                <h2 className="font-semibold">{item.productName}</h2>
                <p className="text-sm text-gray-600">Size: {item.size}</p>
                <p className="text-sm">
                  Price:{" "}
                  <span className="text-red-600 font-medium">
                    ${(item.price * (1 - item.discount / 100)).toFixed(2)}
                  </span>{" "}
                  {item.discount > 0 && (
                    <span className="line-through text-gray-400 ml-2 text-sm">
                      ${item.price.toFixed(2)}
                    </span>
                  )}
                </p>
                <div className="flex items-center mt-2 gap-2">
                  <label className="text-sm">Qty:</label>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.key, parseInt(e.target.value))
                    }
                    className="w-16 border rounded px-2 py-1 text-sm"
                  />
                  <button
                    onClick={() => removeFromCart(item.key)}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="mt-6 text-right">
            <p className="text-xl font-bold">
              Total: <span className="text-green-600">${calculateTotal()}</span>
            </p>
            <button
              onClick={handleCheckout}
              className="mt-4 px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
            >
              Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
