import React, { useState } from 'react';
import { sendWS } from '@/utils/socketService';

/**
 * roomId         – ID ruang chat saat ini
 * messages       – daftar pesan [{ id, senderId, content, … }]
 * selectedUser   – { id, name } lawan bicara
 * currentUserId  – ID user sendiri
 */
export default function ChatPanel({ roomId, messages, selectedUser, currentUserId }) {
    const [content, setContent] = useState('');

    const handleSend = () => {
        if (!content.trim()) return;
        sendWS(roomId, {
            senderId: currentUserId,
            receiverId: selectedUser.id,
            content
        });
        setContent('');
    };

    return (
        <div className="w-3/4 flex flex-col justify-between h-full bg-gray-50">
            {/* Header */}
            <div className="p-4 border-b bg-white">
                <h2 className="font-bold text-lg">Chatting with {selectedUser.name}</h2>
            </div>

            {/* Message list */}
            <div className="flex-1 p-4 overflow-y-auto space-y-2 flex flex-col">
                {messages.map(msg => (
                    <div
                        key={msg.id}
                        className={`max-w-[70%] p-2 rounded-lg ${
                            msg.senderId === currentUserId
                                ? 'bg-blue-200 self-end'
                                : 'bg-gray-200 self-start'
                        }`}
                    >
                        {msg.content}
                    </div>
                ))}
            </div>

            {/* Input form */}
            <div className="p-4 border-t bg-white flex gap-2">
                <input
                    type="text"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Type a message…"
                    className="flex-1 border rounded p-2"
                />
                <button
                    onClick={handleSend}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Send
                </button>
            </div>
        </div>
    );
}
