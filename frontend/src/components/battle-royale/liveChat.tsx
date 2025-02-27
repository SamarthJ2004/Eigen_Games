"use client";
import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useParams } from "next/navigation";
import {
  Send,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  User,
  X,
  AlertCircle
} from "lucide-react";

const socket = io(
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001"
);

interface Message {
  userId: string;
  text: string;
  timestamp?: number;
}

export default function LiveChat() {
  const { id: roomId } = useParams();
  const [chat, setChat] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [uuid, setUuid] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    if (messages.length > 0 && isMinimized) {
      setUnreadCount(prev => prev + 1);
    }
  }, [messages]);

  useEffect(() => {
    if (!isMinimized) {
      setUnreadCount(0);
    }
  }, [isMinimized]);

  useEffect(() => {
    import("uuid").then(({ v4 }) => {
      setUuid(v4().slice(0, 4));
    });

    if (roomId) {
      socket.emit("join_room", roomId);
      
      socket.on("connect", () => {
        setIsConnected(true);
        setConnectionError(false);
      });
      
      socket.on("connect_error", () => {
        setConnectionError(true);
        setIsConnected(false);
      });
      
      socket.on("prev_msgs", (history: Message[]) => {
        // Add timestamps to messages if they don't have them
        const messagesWithTimestamps = history.map(msg => ({
          ...msg,
          timestamp: msg.timestamp || Date.now()
        }));
        setMessages(messagesWithTimestamps);
      });
      
      socket.on("receive_message", (msg: Message) => {
        setMessages((prev) => [...prev, {
          ...msg,
          timestamp: Date.now()
        }]);
      });
    }

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("prev_msgs");
      socket.off("receive_message");
    };
  }, [roomId]);

  const send = () => {
    if (chat.trim() !== "") {
      const timestamp = Date.now();
      const newMessage = { 
        roomId, 
        userId: uuid, 
        text: chat.trim(),
        timestamp
      };
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

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isUserActive = (userId: string) => {
    // Just a simple example of showing user status
    // In a real app, you might track this with socket events
    return userId === uuid || Math.random() > 0.3;
  };

  return (
    <div
      className={`fixed top-16 right-0 bottom-0 transition-all duration-300 ease-in-out z-50
        ${isMinimized ? "w-12" : "w-96"} bg-white shadow-xl border-l border-gray-200`}
      style={{
        transform: isMinimized ? 'translateX(calc(100% - 48px))' : 'translateX(0)'
      }}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsMinimized(!isMinimized)}
        className="absolute left-0 top-20 transform -translate-x-1/2 -translate-y-1/2 bg-purple-700 p-2 rounded-full shadow-md hover:bg-purple-600 transition-colors duration-150 z-10 group"
      >
        {isMinimized ? (
          <div className="relative">
            <ChevronLeft className="w-5 h-5 text-white" />
            {unreadCount > 0 && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
          </div>
        ) : (
          <ChevronRight className="w-5 h-5 text-white" />
        )}
      </button>

      {/* Minimized View */}
      <div className={`p-3 flex flex-col items-center ${!isMinimized ? "hidden" : ""}`}>
        <MessageCircle className="w-6 h-6 text-blue-600 mx-auto mt-2" />
        <span className="text-xs font-medium text-blue-600 mt-1 rotate-90 origin-center">Chat</span>
      </div>

      {/* Main Content */}
      <div className={`h-full flex flex-col ${isMinimized ? "hidden" : ""}`}>
        {/* Room Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-white" />
              <h2 className="text-white font-bold">
                LIVE CHAT
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-xs text-white opacity-90">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          <div className="text-xs text-white opacity-75 mt-1">
            Room: {roomId} • User: {uuid}
          </div>
        </div>

        {/* Connection Error */}
        {connectionError && (
          <div className="bg-red-50 p-3 flex items-center text-red-700 text-sm border-b border-red-100">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            <p>Connection error. Trying to reconnect...</p>
          </div>
        )}

        {/* Messages Container */}
        <div 
          ref={messageContainerRef}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50"
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-400">
                <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No messages yet</p>
                <p className="text-xs mt-1">Be the first to say hello!</p>
              </div>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isCurrentUser = msg.userId === uuid;
              const isFirstInGroup = index === 0 || messages[index - 1].userId !== msg.userId;
              const isLastInGroup = index === messages.length - 1 || messages[index + 1].userId !== msg.userId;
              
              return (
                <div
                  key={index}
                  className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} 
                    ${isFirstInGroup ? 'mt-4' : 'mt-1'}`}
                >
                  {!isCurrentUser && isFirstInGroup && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2 mt-2">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                  <div className="flex flex-col max-w-[75%]">
                    {isFirstInGroup && !isCurrentUser && (
                      <div className="flex items-center ml-2 mb-1">
                        <span className="text-xs font-semibold text-gray-700">{msg.userId}</span>
                        <span className={`ml-2 w-2 h-2 rounded-full ${isUserActive(msg.userId) ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      </div>
                    )}
                    <div
                      className={`px-4 py-2 shadow-sm ${isFirstInGroup ? `${isCurrentUser ? 'rounded-tl-2xl' : 'rounded-tr-2xl'}` : ''} 
                      ${isLastInGroup ? `${isCurrentUser ? 'rounded-bl-2xl' : 'rounded-br-2xl'}` : ''}
                      ${isCurrentUser 
                        ? 'bg-blue-600 text-white rounded-l-2xl' 
                        : 'bg-white text-gray-800 rounded-r-2xl'}`}
                    >
                      <div className="break-words text-sm">{msg.text}</div>
                    </div>
                    {isLastInGroup && (
                      <div className={`text-xs mt-1 text-gray-500 ${isCurrentUser ? 'text-right mr-1' : 'ml-1'}`}>
                        {msg.timestamp ? formatTime(msg.timestamp) : ''}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white flex items-center gap-2 border-t border-gray-200">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
            value={chat}
            onChange={(e) => setChat(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <button
            className={`p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500
              ${chat.trim() 
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform hover:scale-105' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            onClick={send}
            disabled={!chat.trim()}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}