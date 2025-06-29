import { db } from "../utils/firebaseConfig";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  getDocs,
  getDoc
} from "firebase/firestore";

/**
 * Send a message and update unread metadata.
 */
export const sendMessage = async (chatId, message) => {
  const messagesRef = collection(db, "chats", chatId, "messages");

  await addDoc(messagesRef, {
    ...message,
    timestamp: serverTimestamp(),
    seen: false,
  });

  const metaRef = doc(db, "chats", chatId, "meta", "info");
  await setDoc(
    metaRef,
    {
      lastMessage: message.text,
      lastSender: message.sender,
      lastUpdated: serverTimestamp(),
      unreadByAdmin: message.sender === "user",
      unreadByUser: message.sender === "admin",
    },
    { merge: true }
  );
};

/**
 * Subscribe to messages in real-time.
 */
export const subscribeToMessages = (chatId, callback) => {
  const q = query(
    collection(db, "chats", chatId, "messages"),
    orderBy("timestamp", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(messages);
  });
};

/**
 * Mark all unseen messages (from the other party) as seen.
 */
export const markMessagesAsSeen = async (chatId, viewerRole) => {
  const messagesRef = collection(db, "chats", chatId, "messages");
  const snapshot = await getDocs(messagesRef);

  const unseenMessages = snapshot.docs.filter(
    (doc) => !doc.data().seen && doc.data().sender !== viewerRole
  );

  const updatePromises = unseenMessages.map((docRef) =>
    updateDoc(docRef.ref, { seen: true })
  );

  const metaRef = doc(db, "chats", chatId, "meta", "info");
  const unreadField = viewerRole === "admin" ? "unreadByAdmin" : "unreadByUser";

  await Promise.all([
    ...updatePromises,
    setDoc(metaRef, { [unreadField]: false }, { merge: true }), // ✅ fixed
  ]);
};

/**
 * Get chat metadata (e.g. for unread indicator).
 */
export const getChatMeta = async (chatId) => {
  const metaRef = doc(db, "chats", chatId, "meta", "info");
  const metaSnap = await getDoc(metaRef);
  return metaSnap.exists() ? metaSnap.data() : null;
};
