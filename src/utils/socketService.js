import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = process.env.NEXT_PUBLIC_CHAT_WS_URL || 'http://localhost:8082/ws-chat';

let stompClient = null;

export function connectWS(onMessage, onOpen, onError) {
    if (stompClient && stompClient.active) return;

    stompClient = new Client({
        webSocketFactory: () => new SockJS(WS_URL),
        debug: str => console.log('[STOMP]', str),
        reconnectDelay: 5000,
        onConnect: frame => {
            console.log('Connected:', frame);
            if (onOpen) onOpen(frame);
            onMessage.subscribeTopics(stompClient);
        },
        onStompError: err => {
            console.error('STOMP error:', err);
            if (onError) onError(err);
        }
    });

    stompClient.activate();
}

/**
 * Subscribe ke topic untuk room yang dipilih
 */
export function subscribeRoom(roomId, handleIncoming) {
    if (!stompClient || !stompClient.active) return;
    // topic pesan baru
    stompClient.subscribe(
        `/topic/chat.${roomId}.messages`,
        msg => handleIncoming(JSON.parse(msg.body))
    );
    // topic edit/delete
    stompClient.subscribe(
        `/topic/chat.${roomId}.updates`,
        msg => handleIncoming(JSON.parse(msg.body))
    );
}

/**
 * Send message ke room
 */
export function sendWS(roomId, message) {
    if (!stompClient || !stompClient.active) throw new Error('WebSocket not connected');
    stompClient.publish({
        destination: `/app/chat.send.${roomId}`,
        body: JSON.stringify(message)
    });
}

/**
 * Edit message via STOMP
 */
export function editWS(roomId, { id, newContent }) {
    stompClient.publish({
        destination: `/app/chat.edit.${roomId}`,
        body: JSON.stringify({ id, newContent })
    });
}

/**
 * Delete message via STOMP
 */
export function deleteWS(roomId, { id }) {
    stompClient.publish({
        destination: `/app/chat.delete.${roomId}`,
        body: JSON.stringify({ id })
    });
}

/**
 * Disconnect
 */
export function disconnectWS() {
    if (stompClient) stompClient.deactivate();
}
