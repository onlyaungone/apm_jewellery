import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../utils/firebaseConfig";
import { sendMessage, subscribeToMessages } from "../../../services/chatService";
import ChatBox from "../../../components/ChatBox";
import AdminNavbar from "../../../components/AdminNavbar"; // ✅ Import AdminNavbar

const ChatAdmin = () => {
  const [users, setUsers] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchUsers();
  }, []);

  return (
    <>
      <AdminNavbar /> {/* ✅ Add AdminNavbar here */}

      <div className="flex max-w-6xl mx-auto mt-10 gap-6 px-4">
        {/* Sidebar: List of users */}
        <div className="w-1/3 border-r pr-4">
          <h3 className="text-lg font-bold mb-2">User Chats</h3>
          <ul className="space-y-2">
            {users.map((user) => (
              <li
                key={user.id}
                onClick={() => setSelectedChatId(user.id)}
                className="cursor-pointer hover:underline text-blue-600"
              >
                {user.email || user.id}
              </li>
            ))}
          </ul>
        </div>

        {/* Main chat window */}
        <div className="w-2/3">
          {selectedChatId ? (
            <ChatBox
              chatId={selectedChatId}
              sendMessageFn={sendMessage}
              subscribeFn={subscribeToMessages}
              sender="admin"
            />
          ) : (
            <p className="text-gray-500">Select a user to start chatting.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatAdmin;
