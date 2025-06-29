import React from "react";
import { auth } from "../../../utils/firebaseConfig";
import { sendMessage, subscribeToMessages } from "../../../services/chatService";
import ChatBox from "../../../components/ChatBox";

const ChatUser = () => {
  const user = auth.currentUser;
  if (!user) return <p>Loading user...</p>;

  return (
    <div className="max-w-xl mx-auto mt-10">
      <h2 className="text-xl font-semibold mb-4">Chat with Admin</h2>
      <ChatBox
        chatId={user.uid}
        userId={user.uid}
        sendMessageFn={sendMessage}
        subscribeFn={subscribeToMessages}
        sender="user"
      />
    </div>
  );
};

export default ChatUser;
