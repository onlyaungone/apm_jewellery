import { db } from "../utils/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  deleteDoc,
  doc
} from "firebase/firestore";

// Add or update a size (ensures only one entry per hand+part)
export const addSize = async (userId, { hand, part, value }) => {
  const sizesRef = collection(db, "users", userId, "sizes");

  // Check if size already exists for hand + part
  const existingQuery = query(
    sizesRef,
    where("hand", "==", hand),
    where("part", "==", part)
  );
  const snapshot = await getDocs(existingQuery);

  if (!snapshot.empty) {
    // Update the existing one
    const docId = snapshot.docs[0].id;
    await setDoc(doc(db, "users", userId, "sizes", docId), {
      hand,
      part,
      value
    });
  } else {
    // Create new document with random ID
    const newDocRef = doc(collection(db, "users", userId, "sizes"));
    await setDoc(newDocRef, { hand, part, value });
  }
};

// Fetch all sizes for a user
export const getSizes = async (userId) => {
  const sizesRef = collection(db, "users", userId, "sizes");
  const snapshot = await getDocs(sizesRef);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Delete a size by ID
export const deleteSize = async (userId, sizeId) => {
  const sizeDoc = doc(db, "users", userId, "sizes", sizeId);
  await deleteDoc(sizeDoc);
};
