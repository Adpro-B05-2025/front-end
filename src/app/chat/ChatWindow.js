// src/app/chat/ChatWindow.js
'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  getMessagesBetween,
  sendMessage
} from '@/utils/chatService';

export default function ChatWindow({ myId, contactId }) {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const bottomRef = useRef();

  const fetchChat = async () => {
    try {
      const list = await getMessagesBetween(myId, contactId);
      setMessages(list);
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchChat();
    const iv = setInterval(fetchChat, 5000);
    return () => clearInterval(iv);
  }, [myId, contactId]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!content.trim()) return;
    await sendMessage({
      senderId: myId,
      receiverId: contactId,
      content: content.trim()
    });
    setContent('');
    fetchChat();
  };

  return (
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b bg-white flex-shrink-0">
          <h2 className="font-bold text-lg">{contactId}</h2>
        </div>

        {/* Messages (scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {messages.map(msg => {
            const isMe = msg.senderId === myId;
            return (
                <div
                    key={msg.id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2`}
                >
                  <div
                      className={`max-w-[70%] p-2 rounded-lg ${
                          isMe ? 'bg-blue-200' : 'bg-gray-200'
                      }`}
                  >
                    <p>{msg.content}</p>
                    <span className="block text-xs text-gray-600 text-right mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
                  </div>
                </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input fixed di bawah */}
        <form
            onSubmit={handleSubmit}
            className="flex p-4 border-t bg-white flex-shrink-0"
        >
          <input
              type="text"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Ketik pesan…"
              className="flex-1 border rounded px-3 py-2 focus:outline-none"
              required
          />
          <button
              type="submit"
              className="ml-2 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Kirim
          </button>
        </form>
      </div>
  );
}
