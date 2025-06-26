import React, { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product, sizeObj) => {
    const key = `${product.docId}-${sizeObj.size}`;
    const existingIndex = cartItems.findIndex((item) => item.key === key);

    if (existingIndex !== -1) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += 1;
      setCartItems(updated);
    } else {
      setCartItems((prev) => [
        ...prev,
        {
          key,
          docId: product.docId,
          productId: product.docId,
          productName: product.name,
          image: product.images?.[0],
          size: sizeObj.size,
          price: parseFloat(sizeObj.price),
          discount: parseFloat(sizeObj.discount) || 0,
          quantity: 1,
        },
      ]);
    }
  };

  const removeFromCart = (key) => {
    setCartItems((prev) => prev.filter((item) => item.key !== key));
  };

  const updateQuantity = (key, newQty) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, quantity: Math.max(1, newQty) } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
