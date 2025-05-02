const API_BASE = '/api/chat/messages';

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
