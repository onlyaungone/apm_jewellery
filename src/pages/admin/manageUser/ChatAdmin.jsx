import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../utils/firebaseConfig";
import { sendMessage, subscribeToMessages } from "../../../services/chatService";
import ChatBox from "../../../components/ChatBox";
import AdminNavbar from "../../../components/AdminNavbar";

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
      <AdminNavbar />

      <div className="flex flex-col md:flex-row max-w-6xl mx-auto mt-6 gap-4 px-4">
        {/* Sidebar: List of users */}
        <div className="md:w-1/3 w-full border-b md:border-b-0 md:border-r pb-4 md:pb-0 md:pr-4">
          <h3 className="text-lg font-bold mb-2">User Chats</h3>
          <ul className="space-y-2 max-h-64 md:max-h-screen overflow-y-auto">
            {users.map((user) => (
              <li
                key={user.id}
                onClick={() => setSelectedChatId(user.id)}
                className="cursor-pointer hover:underline text-blue-600"
              >
                {user.firstName && user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user.email || user.id}
              </li>
            ))}
          </ul>
        </div>

        {/* Main chat window */}
        <div className="md:w-2/3 w-full">
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
