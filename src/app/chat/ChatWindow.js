// src/app/chat/ChatWindow.js
'use client';

import { useState, useEffect, useRef } from 'react';
import {
    getMessagesBetween,
    sendMessage
} from '@/utils/chatService';

export default function ChatWindow({ myId, contactId }) {
    const [messages, setMessages] = useState([]);
    const [content, setContent] = useState('');
    const bottomRef = useRef();

    // Fetch dan scroll ke bawah
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
        try {
            await sendMessage({ senderId: myId, receiverId: contactId, content: content.trim() });
            setContent('');
            fetchChat();
        } catch (err) {
            console.error(err);
            alert('Gagal mengirim pesan');
        }
    };

    return (
        <div style={{ maxWidth: 600, margin: '2rem auto' }}>
            <h2>Chat dengan #{contactId}</h2>
            <div
                style={{
                    border: '1px solid #ccc',
                    padding: 8,
                    height: 320,
                    overflowY: 'auto',
                    marginBottom: 16
                }}
            >
                {messages.map(msg => (
                    <div
                        key={msg.id}
                        style={{
                            textAlign: msg.senderId === myId ? 'right' : 'left',
                            margin: '0.5rem 0'
                        }}
                    >
                        <div
                            style={{
                                display: 'inline-block',
                                padding: '6px 12px',
                                borderRadius: 12,
                                background: msg.senderId === myId ? '#a2d5f2' : '#e0e0e0'
                            }}
                        >
                            {msg.content}
                        </div>
                        <div style={{ fontSize: 10, color: '#666' }}>
                            {new Date(msg.timestamp).toLocaleTimeString()}
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
                <input
                    type="text"
                    placeholder="Ketik pesan…"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    required
                    style={{ flexGrow: 1, padding: '8px' }}
                />
                <button type="submit" style={{ padding: '8px 16px' }}>
                    Kirim
                </button>
            </form>
        </div>
    );
}
