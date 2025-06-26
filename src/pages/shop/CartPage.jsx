import React, { useEffect, useState } from "react";
import { useCart } from "../../context/CartContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../utils/firebaseConfig";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity /* , clearCart */ } = useCart();
  const navigate = useNavigate();
  const [stockMap, setStockMap] = useState({}); // { itemKey: availableQty }

  useEffect(() => {
    const fetchStockLevels = async () => {
      const stockData = {};
      for (const item of cartItems) {
        const docRef = doc(db, "products", item.productId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const product = docSnap.data();
          const sizeObj = product.sizes.find(
            (s) => s.size.toLowerCase().trim() === item.size.toLowerCase().trim()
          );
          if (!sizeObj) {
            console.warn(`Size "${item.size}" not matched in Firestore for product: ${item.productId}`);
          }

          stockData[item.key] = sizeObj?.quantity || 0;
        }
      }
      setStockMap(stockData);
    };

    if (cartItems.length > 0) fetchStockLevels();
  }, [cartItems]);

  const calculateTotal = () => {
    return cartItems
      .reduce((total, item) => {
        const discountedPrice = item.price * (1 - item.discount / 100);
        return total + discountedPrice * item.quantity;
      }, 0)
      .toFixed(2);
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  const isOverStock = cartItems.some(
    (item) => stockMap[item.key] !== undefined && item.quantity > stockMap[item.key]
  );

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your Shopping Bag</h1>

      {cartItems.length === 0 ? (
        <p className="text-gray-500">Your cart is empty.</p>
      ) : (
        <>
          {cartItems.map((item) => {
            const maxAvailable = stockMap[item.key] ?? 1;
            const isExceeding = item.quantity > maxAvailable;

            return (
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
                    </span>
                    {item.discount > 0 && (
                      <span className="line-through text-gray-400 ml-2 text-sm">
                        ${item.price.toFixed(2)}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">
                    Max Available: {maxAvailable}
                  </p>
                  <div className="flex items-center mt-2 gap-2">
                    <label className="text-sm">Qty:</label>
                    <input
                      type="number"
                      min={1}
                      max={maxAvailable}
                      value={item.quantity}
                      onChange={(e) => {
                        const newQty = parseInt(e.target.value);
                        if (newQty > maxAvailable) {
                          toast.error(`Max available: ${maxAvailable}`);
                          updateQuantity(item.key, maxAvailable);
                        } else {
                          updateQuantity(item.key, newQty);
                        }
                      }}
                      className={`w-16 border rounded px-2 py-1 text-sm ${
                        isExceeding ? "border-red-500" : ""
                      }`}
                    />
                    <button
                      onClick={() => removeFromCart(item.key)}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  {isExceeding && (
                    <p className="text-xs text-red-500 mt-1">
                      Quantity exceeds available stock.
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          <div className="mt-6 text-right">
            <p className="text-xl font-bold">
              Total: <span className="text-green-600">${calculateTotal()}</span>
            </p>
            <button
              onClick={handleCheckout}
              disabled={isOverStock}
              className={`mt-4 px-6 py-2 text-white rounded ${
                isOverStock
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black hover:bg-gray-800"
              }`}
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
