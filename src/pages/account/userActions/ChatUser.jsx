import React, { useEffect, useState } from "react";
import { auth } from "../../../utils/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { sendMessage, subscribeToMessages } from "../../../services/chatService";
import ChatBox from "../../../components/ChatBox";

const ChatUser = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });

    return () => unsubscribe();
  }, []);

  if (!user) return <p className="text-center mt-10 text-gray-500">Loading user...</p>;

  return (
    <div className="max-w-xl mx-auto mt-10">
      <h2 className="text-xl font-semibold mb-4">Chat with Admin</h2>
      <ChatBox
        chatId={user.uid}
        userId={user.uid}
        sendMessageFn={sendMessage}
        subscribeFn={subscribeToMessages}
        sender="user"
        otherUserName="Admin"
      />
    </div>
  );
};

export default ChatUser;
