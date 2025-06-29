import React, { useEffect, useState } from "react";
import { useCart } from "../../context/CartContext";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../utils/firebaseConfig";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useAuth } from "../../context/AuthContext";

const CheckoutPage = () => {
  const { currentUser } = useAuth();
  const { cartItems, clearCart } = useCart();
  const [validating, setValidating] = useState(false);
  const [address, setAddress] = useState(null);
  const [productImages, setProductImages] = useState({});
  const [savedCards, setSavedCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState("");

  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const calculateTotal = () =>
    cartItems
      .reduce((total, item) => {
        const discountedPrice = item.price * (1 - item.discount / 100);
        return total + discountedPrice * item.quantity;
      }, 0)
      .toFixed(2);

  useEffect(() => {
    const fetchAddress = async () => {
      if (!currentUser?.uid) return;
      const addressRef = collection(db, `users/${currentUser.uid}/addresses`);
      const snapshot = await getDocs(addressRef);
      if (!snapshot.empty) {
        setAddress(snapshot.docs[0].data());
      }
    };
    fetchAddress();
  }, [currentUser]);

  useEffect(() => {
    const fetchCards = async () => {
      if (!currentUser?.uid) return;
      const cardSnap = await getDocs(collection(db, `users/${currentUser.uid}/cards`));
      const cardList = cardSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSavedCards(cardList);
    };
    fetchCards();
  }, [currentUser]);

  useEffect(() => {
    const fetchImages = async () => {
      const imagesMap = {};
      for (const item of cartItems) {
        const docRef = doc(db, "products", item.productId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          imagesMap[item.productId] = data.images?.[0] || null;
        }
      }
      setProductImages(imagesMap);
    };
    if (cartItems.length > 0) fetchImages();
  }, [cartItems]);

  const validateStockAndCheckout = async (e) => {
    e.preventDefault();
    setValidating(true);

    try {
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

      if (!selectedCardId) {
        if (!stripe || !elements) {
          toast.error("Stripe not initialized.");
          setValidating(false);
          return;
        }

        const cardNumberElement = elements.getElement(CardNumberElement);
        const { error } = await stripe.createPaymentMethod({
          type: "card",
          card: cardNumberElement,
          billing_details: { email: currentUser?.email },
        });

        if (error) {
          toast.error(error.message);
          setValidating(false);
          return;
        }
      } else {
        toast.success("Saved card selected. Proceeding with mock payment.");
      }

      for (const item of cartItems) {
        const docRef = doc(db, "products", item.productId);
        const product = (await getDoc(docRef)).data();
        const updatedSizes = product.sizes.map((s) =>
          s.size === item.size ? { ...s, stock: s.stock - item.quantity } : s
        );
        await updateDoc(docRef, { sizes: updatedSizes });
      }

      const orderData = {
        userId: currentUser.uid,
        email: currentUser?.email || "",
        address,
        items: cartItems.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          size: item.size,
          price: item.price,
          discount: item.discount,
          quantity: item.quantity,
          image: item.image || null,
        })),
        total: parseFloat(calculateTotal()),
        status: "Processing",
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "orders"), orderData);
      await addDoc(collection(db, `users/${currentUser.uid}/orders`), orderData);

      toast.success("Payment successful. Order placed!");
      clearCart();
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

      {address ? (
        <div className="mb-6 border p-4 rounded bg-gray-50 text-sm">
          <h2 className="font-semibold mb-1">Shipping Address</h2>
          <p>{`${address.firstName} ${address.lastName}`}</p>
          <p>{address.phone}</p>
          <p>{address.address1}</p>
          <p>{`${address.suburb}, ${address.town}, ${address.postalCode}`}</p>
          <p>{address.country}</p>
        </div>
      ) : (
        <p className="text-sm mb-6 text-red-600">
          No address found. Please add it in your account.
        </p>
      )}

      {cartItems.map((item) => (
        <div key={item.key} className="mb-4 border p-4 rounded">
          <div className="flex gap-4">
            {productImages[item.productId] && (
              <img
                src={productImages[item.productId]}
                alt={item.productName}
                className="w-20 h-20 object-cover rounded border"
              />
            )}
            <div>
              <p>
                <strong>{item.productName}</strong> (Size: {item.size})
              </p>
              <p>Qty: {item.quantity}</p>
              <p>
                Price: ${
                  (item.price * (1 - item.discount / 100)).toFixed(2)
                }
              </p>
            </div>
          </div>
        </div>
      ))}

      <form onSubmit={validateStockAndCheckout} className="space-y-4 mt-6">
        <label className="block text-sm font-medium">
          Email:
          <input
            type="email"
            value={currentUser?.email || ""}
            disabled
            className="mt-1 w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed text-gray-500"
          />
        </label>

        {savedCards.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-1">Select a saved card:</label>
            <select
              value={selectedCardId}
              onChange={(e) => setSelectedCardId(e.target.value)}
              className="border px-3 py-2 rounded w-full mb-4"
            >
              <option value="">Select a card</option>
              {savedCards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.brand || "Card"} - {card.cardNumber} (Exp: {card.expiry})
                </option>
              ))}
            </select>
          </div>
        )}

        {!selectedCardId && (
          <div className="space-y-4">
            <label className="block text-sm font-medium">
              Card Number:
              <CardNumberElement className="mt-1 border px-3 py-2 rounded w-full" />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm font-medium">
                Expiry:
                <CardExpiryElement className="mt-1 border px-3 py-2 rounded w-full" />
              </label>
              <label className="block text-sm font-medium">
                CVC:
                <CardCvcElement className="mt-1 border px-3 py-2 rounded w-full" />
              </label>
            </div>
          </div>
        )}

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
