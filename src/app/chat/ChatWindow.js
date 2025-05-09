'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  getMessagesBetween,
  sendMessage,
  editMessage,
  deleteMessage
} from '@/utils/chatService';
import { api } from '@/utils/api';

export default function ChatWindow({
                                     myId,
                                     contactId,
                                     onNewConversation  // <-- prop to notify parent about a new contact
                                   }) {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [doctorName, setDoctorName] = useState('');
  const bottomRef = useRef(null);

  // 1) Fetch doctor profile for header
  useEffect(() => {
    api.getUserProfile(contactId)
        .then(res => res.ok && res.json())
        .then(data => setDoctorName(data.name || contactId))
        .catch(() => setDoctorName(contactId));
  }, [contactId]);

  // 2) Fetch chat history and scroll
  const fetchChat = async () => {
    try {
      const list = await getMessagesBetween(myId, contactId);
      setMessages(list);
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (e) {
      console.error('Fetch chat failed', e);
    }
  };

  // on mount & every 5s
  useEffect(() => {
    fetchChat();
    const iv = setInterval(fetchChat, 5000);
    return () => clearInterval(iv);
  }, [myId, contactId]);

  const handleSubmit = async e => {
    e.preventDefault();
    const text = content.trim();
    if (!text) return;

    try {
      if (editingMessageId) {
        await editMessage(editingMessageId, text);
        setEditingMessageId(null);
      } else {
        await sendMessage({
          senderId: myId,
          receiverId: contactId,
          content: text
        });
        // 2) immediately notify parent that this contact now has messages
        onNewConversation(contactId);
      }
      setContent('');
      setSelectedMessageId(null);
      fetchChat();
    } catch (err) {
      console.error('Submit failed', err);
    }
  };

  const handleBeginEdit = msg => {
    setSelectedMessageId(null);
    setEditingMessageId(msg.id);
    setContent(msg.content);
    setTimeout(() => document.getElementById('chat-input')?.focus(), 0);
  };

  const handleDelete = async id => {
    try {
      await deleteMessage(id);
      setSelectedMessageId(null);
      fetchChat();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  return (
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* HEADER now shows doctor's name */}
        <div className="p-4 border-b bg-white flex-shrink-0">
          <h2 className="font-bold text-lg">{doctorName}</h2>
        </div>

        {/* MESSAGE LIST */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 min h-0">
          {messages.map(msg => {
            const isMe = msg.senderId === myId;
            return (
                <div
                    key={msg.id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2`}
                >
                  <div className="relative max-w-[70%]">
                    <div className={`p-2 pr-8 rounded-lg ${isMe ? 'bg-blue-200' : 'bg-gray-200'}`}>
                      <p>
                        {msg.status === 'deleted'
                            ? <em className="text-gray-500">message deleted</em>
                            : msg.content}
                      </p>
                      <span className="block text-xs text-gray-600 text-right mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                        {msg.status === 'edited' && (
                            <span className="ml-1 italic text-gray-500">(edited)</span>
                        )}
                  </span>
                    </div>

                    {isMe && msg.status !== 'deleted' && (
                        <button
                            onClick={() => setSelectedMessageId(msg.id)}
                            className="absolute top-1.5 right-1.5 text-gray-600 hover:text-gray-800"
                        >
                          ⋮
                        </button>
                    )}

                    {selectedMessageId === msg.id && (
                        <div className="flex justify-end space-x-2 mt-1">
                          <button
                              onClick={() => handleBeginEdit(msg)}
                              className="text-sm text-blue-600 hover:underline"
                          >
                            Edit
                          </button>
                          <button
                              onClick={() => handleDelete(msg.id)}
                              className="text-sm text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                    )}
                  </div>
                </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* INPUT / FORM */}
        <form onSubmit={handleSubmit} className="flex p-4 border-t bg-white flex-shrink-0">
          <input
              id="chat-input"
              type="text"
              value={content}
              onChange={e => setContent(e.target.value)}
              // 1) only show greeting placeholder when there are NO prior messages and not editing
              placeholder={
                !editingMessageId && messages.length === 0
                    ? 'Halo Dokter! Saya mau konsul hari ini.'
                    : ''
              }
              className="flex-1 border rounded px-3 py-2 focus:outline-none"
              required
          />
          <button
              type="submit"
              className={`ml-2 px-4 py-2 rounded text-white ${
                  editingMessageId ? 'bg-green-500' : 'bg-blue-500'
              }`}
          >
            {editingMessageId ? 'Update' : 'Kirim'}
          </button>
        </form>
      </div>
  );
}
