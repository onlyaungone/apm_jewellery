import React, { useState, useEffect, useRef } from "react";
import { markMessagesAsSeen } from "../services/chatService";

const ChatBox = ({ chatId, sendMessageFn, subscribeFn, sender }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!chatId) return;

    const unsubscribe = subscribeFn(chatId, setMessages);
    markMessagesAsSeen(chatId, sender); // Mark as seen on mount

    return () => unsubscribe();
  }, [chatId, sender, subscribeFn]);

  const handleSend = async () => {
    if (!text.trim()) return;
    await sendMessageFn(chatId, { text, sender });
    setText("");
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTimestamp = (ts) => {
    if (!ts?.toDate) return "";
    const date = ts.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-4 border rounded shadow max-w-xl mx-auto">
      <div className="h-64 overflow-y-auto space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={msg.id || idx}
            className={`p-2 rounded-md w-fit text-sm ${
              msg.sender === sender ? "bg-blue-100 ml-auto text-right" : "bg-gray-200"
            }`}
          >
            <p>{msg.text}</p>
            <div className="text-xs text-gray-500 mt-1">
              {formatTimestamp(msg.timestamp)}
              {msg.sender === sender && msg.seen && <span className="ml-1">✓ Seen</span>}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>
      <div className="flex mt-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="border px-2 py-1 flex-1 mr-2 rounded"
          placeholder="Type a message"
        />
        <button onClick={handleSend} className="bg-black text-white px-4 rounded">
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
