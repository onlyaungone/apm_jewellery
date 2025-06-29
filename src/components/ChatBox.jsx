import React, { useState, useEffect, useRef } from "react";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";
import { markMessagesAsSeen } from "../services/chatService";

const ChatBox = ({ chatId, sendMessageFn, subscribeFn, sender, otherUserName = "User" }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  const audioRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const otherParty = sender === "admin" ? "user" : "admin";

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const isUserNearBottom = () => {
    const el = scrollRef.current?.parentElement;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 60;
  };

  useEffect(() => {
    if (!chatId) return;

    const unsubscribeMessages = subscribeFn(chatId, (newMessages) => {
      const lastMsg = newMessages[newMessages.length - 1];
      if (lastMsg?.sender !== sender && audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
      setMessages(newMessages);
    });

    markMessagesAsSeen(chatId, sender);

    const unsubscribeTyping = onSnapshot(doc(db, "chats", chatId), (docSnap) => {
      const data = docSnap.data();
      if (data?.typing) {
        setIsTyping(data.typing[otherParty] === true);
      }
    });

    return () => {
      unsubscribeMessages();
      unsubscribeTyping();
    };
  }, [chatId, sender, subscribeFn, otherParty]);

  useEffect(() => {
    if (isUserNearBottom()) {
      scrollToBottom();
    }
  }, [messages, isTyping]);

  const formatTimestamp = (ts) => {
    if (!ts?.toDate) return "";
    const date = ts.toDate();
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleSend = async () => {
    if (!text.trim()) return;

    await sendMessageFn(chatId, {
      text,
      sender,
      delivered: true,
      seen: false,
      timestamp: new Date(),
    });

    setText("");

    await setDoc(doc(db, "chats", chatId), {
      typing: { [sender]: false },
    }, { merge: true });
  };

  const handleTyping = async (e) => {
    const val = e.target.value;
    setText(val);

    await setDoc(doc(db, "chats", chatId), {
      typing: { [sender]: true },
    }, { merge: true });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setDoc(doc(db, "chats", chatId), {
        typing: { [sender]: false },
      }, { merge: true });
    }, 1500);
  };

  return (
    <div className="p-4 border rounded shadow mx-auto max-w-3xl w-full h-full flex flex-col">
      <audio ref={audioRef} src="/sounds/notification.mp3" preload="auto" />

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-2 px-2">
        {messages.map((msg, idx) => {
          const isSender = msg.sender === sender;
            msg.sender === otherParty &&
            (idx === messages.length - 1 ||
              messages.slice(idx + 1).every((m) => m.sender === sender));

          return (
            <React.Fragment key={msg.id || idx}>
              <div
                className={`relative p-2 rounded-md w-fit text-sm max-w-[80%] break-words
                  ${isSender ? "bg-blue-100 ml-auto text-right" : "bg-gray-200"}
                  ${isSender ? "rounded-tr-none" : "rounded-tl-none"}
                  before:absolute before:bottom-0 before:w-0 before:h-0
                  ${isSender
                    ? "before:right-[-6px] before:border-t-[6px] before:border-l-[6px] before:border-t-transparent before:border-l-blue-100"
                    : "before:left-[-6px] before:border-t-[6px] before:border-r-[6px] before:border-t-transparent before:border-r-gray-200"}
                `}
              >
                <p>{msg.text}</p>
                <div className="text-xs text-gray-500 mt-1 flex justify-between items-center">
                  <span>{formatTimestamp(msg.timestamp)}</span>
                  <span className="ml-2">
                    {msg.seen ? (
                      <span className="font-medium text-green-600">✓✓ Seen</span>
                    ) : msg.delivered ? (
                      <span className="text-gray-400">✓ Delivered</span>
                    ) : null}
                  </span>
                </div>
              </div>
            </React.Fragment>
          );
        })}

        {/* Typing indicator bubble */}
        {isTyping && (
          <div
            className={`relative p-2 rounded-md w-fit text-sm max-w-[80%] break-words mt-1
              bg-gray-200 text-left rounded-tl-none
              before:absolute before:bottom-0 before:w-0 before:h-0
              before:left-[-6px] before:border-t-[6px] before:border-r-[6px] before:border-t-transparent before:border-r-gray-200
            `}
          >
            <div className="text-sm font-medium mb-1">
              {otherParty === "admin" ? "Admin is typing..." : `${otherUserName} is typing...`}
            </div>
            <div className="flex space-x-1 justify-center">
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 mt-auto">
        <input
          value={text}
          onChange={handleTyping}
          className="border px-3 py-2 rounded flex-1 text-sm"
          placeholder="Type a message"
        />
        <button
          onClick={handleSend}
          className="bg-black text-white px-4 py-2 rounded text-sm"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
