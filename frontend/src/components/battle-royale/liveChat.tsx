"use client";
import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useParams } from "next/navigation";
import {
  Send,
  ChevronLeft,
  ChevronRight,
  MessageCircle
} from "lucide-react";

const socket = io(
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001"
);

interface Message {
  userId: string;
  text: string;
}

export default function LiveChat() {
  const { id: roomId } = useParams();
  const [chat, setChat] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [uuid, setUuid] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    import("uuid").then(({ v4 }) => {
      setUuid(v4().slice(0, 4));
    });

    if (roomId) {
      socket.emit("join_room", roomId);
      socket.on("prev_msgs", (history: Message[]) => setMessages(history));
      socket.on("receive_message", (msg: Message) => {
        setMessages((prev) => [...prev, msg]);
      });
    }

    return () => {
      socket.off("prev_msgs");
      socket.off("receive_message");
    };
  }, [roomId]);

  const send = () => {
    if (chat.trim() !== "") {
      const newMessage = { roomId, userId: uuid, text: chat.trim() };
      socket.emit("send_message", newMessage);
      setChat("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div
      className={`fixed top-16 right-0 bottom-0 transition-all duration-300 ease-in-out
        ${
          isMinimized ? "w-12" : "w-96"
        } bg-white shadow-lg border-l border-gray-200`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsMinimized(!isMinimized)}
        className="absolute -left-4 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md border border-gray-200 hover:bg-gray-50 transition-colors duration-150 z-10"
      >
        {isMinimized ? (
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-600" />
        )}
      </button>

      {/* Minimized View */}
      <div className={`p-2 ${!isMinimized ? "hidden" : ""}`}>
        <MessageCircle className="w-8 h-8 text-blue-600 mx-auto mt-2" />
      </div>

      {/* Main Content */}
      <div className={`h-full flex flex-col ${isMinimized ? "hidden" : ""}`}>
        {/* Room Header */}
        <div className="bg-red-600 p-3 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-500 opacity-50" />
          <h2 className="text-white font-bold text-center relative z-10">
            LIVE CHAT ROOM {roomId}
          </h2>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.userId === uuid ? "justify-end" : "justify-start"
              } animate-fade-in-up`}
            >
              <div
                className={`max-w-xs transform transition-all duration-300 hover:scale-105
                  ${
                    msg.userId === uuid
                      ? "bg-blue-600 text-white rounded-t-2xl rounded-l-2xl"
                      : "bg-gray-100 rounded-t-2xl rounded-r-2xl"
                  } px-4 py-2 shadow-sm hover:shadow-md`}
              >
                <div className="text-xs opacity-75 mb-1 font-medium">
                  {msg.userId}
                </div>
                <div className="break-words">{msg.text}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white flex items-center gap-2 border-t border-gray-200">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 bg-gray-100 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            value={chat}
            onChange={(e) => setChat(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <button
            className="p-3 bg-blue-600 hover:bg-blue-700 rounded-full text-white transition-all duration-300 transform hover:scale-110 hover:rotate-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={send}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}