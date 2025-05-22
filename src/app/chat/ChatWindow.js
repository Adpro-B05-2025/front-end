'use client';

import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/utils/api';
import {
  connectWS,
  initRoom,
  subscribeRoom,
  sendWS,
  editWS,
  deleteWS,
  disconnectWS
} from '@/utils/socketService';

export default function ChatWindow({
                                     myId,
                                     contactId,
                                     onNewConversation
                                   }) {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [doctorName, setDoctorName] = useState('');
  const [loading, setLoading] = useState(true);
  const [roomId, setRoomId] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const bottomRef = useRef(null);

  // Handler for incoming WebSocket messages (new, edited, or deleted)
  function handleIncoming(msg) {
    console.log('Handling incoming message:', msg);
    setMessages(prev => {
      const idx = prev.findIndex(m => m.id === msg.id);
      if (idx !== -1) {
        // update existing message
        const updated = [...prev];
        updated[idx] = msg;
        return updated;
      } else {
        // append new message
        return [...prev, msg];
      }
    });
    // scroll to bottom on every update
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  // 1) Fetch doctor profile for header
  useEffect(() => {
    if (!contactId || isNaN(contactId)) {
      console.error('Invalid contactId in ChatWindow:', contactId);
      setDoctorName(`Invalid Contact`);
      setLoading(false);
      return;
    }

    console.log('Fetching profile for contactId:', contactId);
    
    // Try getCareGiverProfile first (since this is likely a doctor)
    api.getCareGiverProfile(contactId)
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          // If caregiver profile fails, try regular user profile
          return api.getUserProfile(contactId).then(res => res.ok ? res.json() : null);
        }
      })
      .then(data => {
        if (data) {
          setDoctorName(data.name || `User ${contactId}`);
        } else {
          setDoctorName(`User ${contactId}`);
        }
      })
      .catch(error => {
        console.error('Error fetching profile:', error);
        setDoctorName(`User ${contactId}`);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [contactId]);

  // 2) Initialize WebSocket connection
  useEffect(() => {
    if (!contactId || isNaN(contactId) || !myId) {
      console.error('Cannot initialize WebSocket - invalid IDs:', { contactId, myId });
      return;
    }

    console.log('=== INITIALIZING WEBSOCKET ===');
    console.log('Connecting to chat with doctor ID:', contactId);
    
    connectWS(
      { subscribeTopics: () => {} }, // We'll subscribe after getting room ID
      () => {
        console.log('✅ WebSocket connected successfully');
        setWsConnected(true);
        
        // Initialize room with doctor
        console.log('Initializing room with doctor:', contactId);
        initRoom(contactId, (receivedRoomId) => {
          console.log('✅ Room initialized with ID:', receivedRoomId);
          setRoomId(receivedRoomId);
          
          // Now subscribe to this room
          console.log('Subscribing to room:', receivedRoomId);
          subscribeRoom(receivedRoomId, handleIncoming);
          
          // Request message history after subscribing
          setTimeout(() => {
            console.log('Requesting message history for room:', receivedRoomId);
            // Send history request
            if (window.stompClient && window.stompClient.active) {
              window.stompClient.publish({
                destination: `/app/chat.history.${receivedRoomId}`,
                body: JSON.stringify({})
              });
            }
          }, 500); // Small delay to ensure subscription is ready
        });
      },
      err => {
        console.error('❌ WebSocket connection error:', err);
        setWsConnected(false);
      }
    );
    
    return () => {
      console.log('=== CLEANING UP WEBSOCKET ===');
      console.log('Disconnecting from chat with doctor ID:', contactId);
      disconnectWS();
      setWsConnected(false);
      setRoomId(null);
    };
  }, [contactId, myId]);

  // 3) Send or edit a message
  const handleSubmit = async e => {
    e.preventDefault();
    const text = content.trim();
    if (!text || !roomId) {
      console.error('Cannot send message - missing text or room ID:', { text, roomId });
      return;
    }

    if (editingMessageId) {
      console.log('Editing message:', editingMessageId);
      editWS(roomId, { id: editingMessageId, newContent: text });
      setEditingMessageId(null);
    } else {
      console.log('Sending new message to room:', roomId);
      sendWS(roomId, {
        senderId: myId,
        receiverId: contactId,
        content: text
      });
      
      // notify parent that this contact now has messages
      if (onNewConversation) {
        onNewConversation(contactId);
      }
    }

    setContent('');
    setSelectedMessageId(null);
  };

  // 4) Begin editing an existing message
  const handleBeginEdit = msg => {
    setSelectedMessageId(null);
    setEditingMessageId(msg.id);
    setContent(msg.content);
    setTimeout(() => document.getElementById('chat-input')?.focus(), 0);
  };

  // 5) Delete a message
  const handleDelete = id => {
    if (!roomId) {
      console.error('Cannot delete message - no room ID');
      return;
    }
    console.log('Deleting message:', id);
    deleteWS(roomId, { id });
    setSelectedMessageId(null);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="p-4 border-b bg-white flex-shrink-0">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-1/3"></div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="loading-spinner"></div>
            <p className="mt-2 text-gray-600">Loading chat...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state for invalid contactId
  if (!contactId || isNaN(contactId)) {
    return (
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="p-4 border-b bg-red-50 flex-shrink-0">
          <h2 className="font-bold text-lg text-red-600">Error</h2>
        </div>
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-red-600">Invalid contact ID. Cannot load chat.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* HEADER */}
        <div className="p-4 border-b bg-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg">{doctorName}</h2>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs text-gray-500">
                {wsConnected ? 'Connected' : 'Disconnected'}
              </span>
              {roomId && (
                <span className="text-xs text-gray-400">Room: {roomId}</span>
              )}
            </div>
          </div>
        </div>

        {/* MESSAGE LIST */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 min-h-0">
          {!wsConnected && (
            <div className="text-center py-4">
              <div className="text-yellow-600 bg-yellow-100 px-4 py-2 rounded-lg inline-block">
                Connecting to chat server...
              </div>
            </div>
          )}
          
          {wsConnected && !roomId && (
            <div className="text-center py-4">
              <div className="text-blue-600 bg-blue-100 px-4 py-2 rounded-lg inline-block">
                Initializing chat room...
              </div>
            </div>
          )}

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
              placeholder={
                !roomId ? 'Connecting...' :
                !editingMessageId && messages.length === 0
                    ? 'Halo Dokter! Saya mau konsul hari ini.'
                    : ''
              }
              className="flex-1 border rounded px-3 py-2 focus:outline-none"
              disabled={!wsConnected || !roomId}
              required
          />
          <button
              type="submit"
              disabled={!wsConnected || !roomId}
              className={`ml-2 px-4 py-2 rounded text-white ${
                  !wsConnected || !roomId ? 'bg-gray-400 cursor-not-allowed' :
                  editingMessageId ? 'bg-green-500' : 'bg-blue-500'
              }`}
          >
            {editingMessageId ? 'Update' : 'Kirim'}
          </button>
        </form>
      </div>
  );
}