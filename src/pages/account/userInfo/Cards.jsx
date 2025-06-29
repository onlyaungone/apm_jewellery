import React, { useEffect, useState } from "react";
import { auth } from "../../../utils/firebaseConfig";
import {
  addCard,
  getCards,
  deleteCard,
  updateCard,
} from "../../../services/cardsService";
import toast from "react-hot-toast";

const getCardBrand = (number) => {
  const raw = number.replace(/\s/g, "");
  if (/^4/.test(raw)) return "Visa";
  if (/^5[1-5]/.test(raw)) return "MasterCard";
  if (/^3[47]/.test(raw)) return "American Express";
  if (/^6(?:011|5)/.test(raw)) return "Discover";
  return "Card";
};

const luhnCheck = (num) => {
  let sum = 0;
  let shouldDouble = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let digit = parseInt(num[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
};

const Cards = () => {
  const [cards, setCards] = useState([]);
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [editCardId, setEditCardId] = useState(null);

  useEffect(() => {
    if (auth.currentUser) fetchCards();
  }, []);

  const fetchCards = async () => {
    const list = await getCards(auth.currentUser.uid);
    setCards(list);
  };

  const validateInputs = () => {
    const rawCardNumber = cardNumber.replace(/\s/g, "");

    if (!cardHolder.trim()) {
      toast.error("Cardholder name is required.");
      return false;
    }

    if (!/^\d{16}$/.test(rawCardNumber)) {
      toast.error("Card number must be 16 digits.");
      return false;
    }

    if (!luhnCheck(rawCardNumber)) {
      toast.error("Card number is invalid.");
      return false;
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      toast.error("Expiry must be in MM/YY format.");
      return false;
    }

    const [month, year] = expiry.split("/").map(Number);
    const now = new Date();
    const expDate = new Date(2000 + year, month);
    if (expDate <= now) {
      toast.error("Card has expired.");
      return false;
    }

    if (!/^\d{3}$/.test(cvv)) {
      toast.error("CVV must be 3 digits.");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    const rawCardNumber = cardNumber.replace(/\s/g, "");
    if (!validateInputs()) return;

    const cardData = {
      cardHolder,
      cardNumber: "**** **** **** " + rawCardNumber.slice(-4),
      expiry,
      brand: getCardBrand(cardNumber),
      cvv,
    };

    if (editCardId) {
      await updateCard(auth.currentUser.uid, editCardId, cardData);
      toast.success("Card updated.");
    } else {
      await addCard(auth.currentUser.uid, cardData);
      toast.success("Card added.");
    }

    setCardHolder("");
    setCardNumber("");
    setExpiry("");
    setCvv("");
    setEditCardId(null);
    fetchCards();
  };

  const handleEdit = (card) => {
    setCardHolder(card.cardHolder);
    setCardNumber("");
    setExpiry(card.expiry);
    setCvv("");
    setEditCardId(card.id);
  };

  const handleDelete = async (id) => {
    await deleteCard(auth.currentUser.uid, id);
    toast.success("Card deleted.");
    fetchCards();
  };

  const handleCardNumberChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = rawValue.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formatted.trim());
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/[^\d]/g, "");
    if (value.length >= 3) value = value.slice(0, 2) + "/" + value.slice(2, 4);
    setExpiry(value.slice(0, 5));
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">
        {editCardId ? "Edit Card" : "Saved Cards"}
      </h2>

      <div className="grid gap-2 mb-4">
        <input
          value={cardHolder}
          onChange={(e) => setCardHolder(e.target.value)}
          placeholder="Cardholder Name"
          className="border p-2 rounded"
        />
        <input
          value={cardNumber}
          onChange={handleCardNumberChange}
          placeholder="Card Number"
          className="border p-2 rounded"
          maxLength={19}
          inputMode="numeric"
        />
        <input
          value={expiry}
          onChange={handleExpiryChange}
          placeholder="Expiry (MM/YY)"
          className="border p-2 rounded"
          maxLength={5}
        />
        <input
          value={cvv}
          onChange={(e) =>
            setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))
          }
          placeholder="CVV"
          className="border p-2 rounded"
          maxLength={3}
          inputMode="numeric"
        />
        <button
          onClick={handleSave}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          {editCardId ? "Update Card" : "Add Card"}
        </button>
        {editCardId && (
          <button
            onClick={() => {
              setCardHolder("");
              setCardNumber("");
              setExpiry("");
              setCvv("");
              setEditCardId(null);
            }}
            className="text-sm text-gray-600 underline"
          >
            Cancel Edit
          </button>
        )}
      </div>

      <ul className="space-y-2">
        {cards.map((card) => (
          <li
            key={card.id}
            className="flex justify-between items-center border p-3 rounded"
          >
            <div>
              <p className="font-medium">{card.cardHolder}</p>
              <p className="text-sm text-gray-600">
                {getCardBrand(card.cardNumber)} &middot; {card.cardNumber} &middot;{" "}
                {card.expiry}
              </p>
            </div>
            <div className="flex gap-3 items-center">
              <button
                onClick={() => handleEdit(card)}
                className="text-blue-600 hover:underline text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(card.id)}
                className="text-red-600 hover:underline text-sm"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Cards;
