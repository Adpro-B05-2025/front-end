import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = process.env.NEXT_PUBLIC_CHAT_WS_URL || 'http://localhost:8082/ws-chat';

let stompClient = null;
let currentRoomId = null;

export function connectWS(onMessage, onOpen, onError) {
    const token = localStorage.getItem('token');
    if (stompClient && stompClient.active) return;

    console.log('Connecting to WebSocket with token:', token ? 'present' : 'missing');

    stompClient = new Client({
        webSocketFactory: () => new SockJS(WS_URL),

        // Add Authorization header for STOMP CONNECT frame
        connectHeaders: {
            Authorization: `Bearer ${token}`
        },

        debug: str => console.log('[STOMP]', str),
        reconnectDelay: 5000,

        onConnect: frame => {
            console.log('✅ STOMP connected');
            if (onOpen) onOpen(frame);
            if (onMessage && onMessage.subscribeTopics) {
                onMessage.subscribeTopics(stompClient);
            }
        },

        onStompError: frame => {
            console.error('❌ STOMP error:', frame);
            if (onError) onError(frame);
        },

        onWebSocketError: event => {
            console.error('❌ WebSocket error:', event);
            if (onError) onError(event);
        }
    });

    stompClient.activate();
}

/**
 * Initialize chat room with doctor and get room ID
 */
export function initRoom(doctorId, callback) {
    if (!stompClient || !stompClient.active) {
        console.error('WebSocket not connected');
        return;
    }

    console.log('Initializing room with doctor:', doctorId);

    // Subscribe to init response topic first
    const subscription = stompClient.subscribe(
        `/topic/chat.init.${doctorId}`,
        message => {
            const roomId = JSON.parse(message.body);
            console.log('Received room ID:', roomId);
            currentRoomId = roomId;
            callback(roomId);
            subscription.unsubscribe(); // Clean up subscription after receiving room ID
        }
    );

    // Send init request
    stompClient.publish({
        destination: `/app/chat.init.${doctorId}`,
        body: JSON.stringify({}) // Empty body, user ID comes from Principal
    });
}

/**
 * Subscribe to room messages and updates
 */
export function subscribeRoom(roomId, handleIncoming) {
    if (!stompClient || !stompClient.active) {
        console.error('WebSocket not connected');
        return;
    }

    console.log('Subscribing to room:', roomId);

    // Subscribe to new messages
    stompClient.subscribe(
        `/topic/chat.${roomId}.messages`,
        msg => {
            console.log('Received new message:', msg.body);
            handleIncoming(JSON.parse(msg.body));
        }
    );

    // Subscribe to message updates (edit/delete)
    stompClient.subscribe(
        `/topic/chat.${roomId}.updates`,
        msg => {
            console.log('Received message update:', msg.body);
            handleIncoming(JSON.parse(msg.body));
        }
    );

    // Get message history
    stompClient.publish({
        destination: `/app/chat.history.${roomId}`,
        body: JSON.stringify({})
    });
}

/**
 * Send message to room
 */
export function sendWS(roomId, message) {
    if (!stompClient || !stompClient.active) {
        console.error('WebSocket not connected');
        return;
    }

    console.log('Sending message to room:', roomId, message);

    stompClient.publish({
        destination: `/app/chat.send.${roomId}`,
        body: JSON.stringify(message)
    });
}

/**
 * Edit message via STOMP
 */
export function editWS(roomId, { id, newContent }) {
    if (!stompClient || !stompClient.active) {
        console.error('WebSocket not connected');
        return;
    }

    console.log('Editing message:', id, 'in room:', roomId);

    stompClient.publish({
        destination: `/app/chat.edit.${roomId}`,
        body: JSON.stringify({ id, newContent })
    });
}

/**
 * Delete message via STOMP
 */
export function deleteWS(roomId, { id }) {
    if (!stompClient || !stompClient.active) {
        console.error('WebSocket not connected');
        return;
    }

    console.log('Deleting message:', id, 'in room:', roomId);

    stompClient.publish({
        destination: `/app/chat.delete.${roomId}`,
        body: JSON.stringify({ id })
    });
}

/**
 * Disconnect
 */
export function disconnectWS() {
    if (stompClient) {
        console.log('Disconnecting WebSocket');
        stompClient.deactivate();
        stompClient = null;
        currentRoomId = null;
    }
}