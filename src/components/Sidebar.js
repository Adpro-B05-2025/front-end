import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    connectWS,
    subscribeRoom,
    disconnectWS
} from '@/utils/socketService';

/**
 * contacts: array of { contactId, contactName }
 */
export default function Sidebar({ contacts }) {
    const router = useRouter();
    const [previews, setPreviews] = useState({});

    // Subscribe to each contact's message topic to keep previews up-to-date
    useEffect(() => {
        if (contacts.length === 0) return;

        connectWS(
            {
                subscribeTopics: client => {
                    contacts.forEach(c =>
                        subscribeRoom(c.contactId, msg => {
                            setPreviews(p => ({ ...p, [c.contactId]: msg.content }));
                        })
                    );
                }
            },
            () => {},
            err => console.error('WebSocket error', err)
        );

        return () => {
            disconnectWS();
        };
    }, [contacts]);

    return (
        <div className="w-1/4 border-r border-gray-300 bg-white h-full overflow-y-auto">
            {contacts.map(c => (
                <div
                    key={c.contactId}
                    className="p-4 hover:bg-gray-100 cursor-pointer"
                    onClick={() => router.push(`/chat?contactId=${c.contactId}`)}
                >
                    <p className="font-semibold">{c.contactName}</p>
                    <p className="text-sm text-gray-500 truncate">
                        {previews[c.contactId] ?? 'No messages yet.'}
                    </p>
                </div>
            ))}
        </div>
    );
}
