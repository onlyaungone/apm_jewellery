import { db } from "../utils/firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

//Add a new card
export const addCard = async (userId, cardData) => {
  const cardsRef = collection(db, "users", userId, "cards");
  await addDoc(cardsRef, cardData);
};

//Get all saved cards
export const getCards = async (userId) => {
  const cardsRef = collection(db, "users", userId, "cards");
  const snapshot = await getDocs(cardsRef);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

//Delete a specific card
export const deleteCard = async (userId, cardId) => {
  const cardDoc = doc(db, "users", userId, "cards", cardId);
  await deleteDoc(cardDoc);
};

// Update a specific card
export const updateCard = async (userId, cardId, updatedData) => {
  const cardRef = doc(db, "users", userId, "cards", cardId);
  await updateDoc(cardRef, updatedData);
};
