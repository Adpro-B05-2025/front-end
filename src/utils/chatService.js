// src/utils/chatService.js

import { apiRequest, CHAT_BASE_URL } from './api';

const CHAT_ENDPOINT = '/api/chat/messages';
const CHAT_BASE = CHAT_BASE_URL; // misal http://localhost:8082

export async function sendMessage({ senderId, receiverId, content }) {
    const res = await apiRequest(
        CHAT_ENDPOINT,
        {
            method: 'POST',
            body: JSON.stringify({ senderId, receiverId, content }),
        },
        'chat'
    );
    if (!res.ok) throw new Error(`Failed to send: ${res.statusText}`);
    return res.json();
}

export async function getMessage(messageId) {
    const res = await apiRequest(
        `${CHAT_ENDPOINT}/${messageId}`,
        {},
        'chat'
    );
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Error fetching: ${res.statusText}`);
    return res.json();
}

export async function getAllMessages() {
    const res = await apiRequest(
        CHAT_ENDPOINT,
        {},
        'chat'
    );
    if (!res.ok) throw new Error(`Error fetching all: ${res.statusText}`);
    return res.json();
}

export async function editMessage(messageId, newContent) {
    const res = await apiRequest(
        `${CHAT_ENDPOINT}/${messageId}`,
        {
            method: 'PUT',
            headers: { 'Content-Type': 'text/plain' },
            body: newContent,
        },
        'chat'
    );
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Error editing: ${res.statusText}`);
    return res.json();
}

export async function deleteMessage(messageId) {
    const res = await apiRequest(
        `${CHAT_ENDPOINT}/${messageId}`,
        { method: 'DELETE' },
        'chat'
    );
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Error deleting: ${res.statusText}`);
    return res.json();
}

export async function getConversations(userId) {
    const msgs = await getAllMessages();
    const contacts = new Set();
    msgs.forEach(m => {
        if (m.senderId === userId) contacts.add(m.receiverId);
        if (m.receiverId === userId) contacts.add(m.senderId);
    });
    return Array.from(contacts);
}

export async function getMessagesBetween(userId, contactId) {
    const msgs = await getAllMessages();
    return msgs
        .filter(m =>
            (m.senderId === userId && m.receiverId === contactId) ||
            (m.senderId === contactId && m.receiverId === userId)
        )
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}
