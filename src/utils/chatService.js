import { API_BASE_URL } from './api';
const API_BASE = `${API_BASE_URL}/api/chat/messages`;

export async function sendMessage({ senderId, receiverId, content }) {
    const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId, receiverId, content })
    });
    if (!res.ok) throw new Error(`Failed to send: ${res.statusText}`);
    return res.json();
}

export async function getMessage(messageId) {
    const res = await fetch(`${API_BASE}/${messageId}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Error fetching: ${res.statusText}`);
    return res.json();
}

export async function getAllMessages() {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error(`Error fetching all: ${res.statusText}`);
    return res.json();
}

export async function editMessage(messageId, newContent) {
    const res = await fetch(`${API_BASE}/${messageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'text/plain' },
        body: newContent
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Error editing: ${res.statusText}`);
    return res.json();
}

export async function deleteMessage(messageId) {
    const res = await fetch(`${API_BASE}/${messageId}`, {
        method: 'DELETE'
    });
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

// Tambahan untuk dummy seed message
export async function seedDummyChat(userId) {
    const otherUserId = userId === 10 ? 20 : 10; // Bisa kamu atur lebih fleksibel
    const existingConversations = await getConversations(userId);

    if (!existingConversations.includes(otherUserId)) {
        await sendMessage({
            senderId: userId,
            receiverId: otherUserId,
            content: "Hello from dummy seed!"
        });
    }
}
