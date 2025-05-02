'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { getConversations } from '@/utils/chatService';

export default function ChatListPage() {
    const { user } = useAuth();
    const [contacts, setContacts] = useState([]);

    useEffect(() => {
        if (user) {
            getConversations(user.id).then(setContacts).catch(console.error);
        }
    }, [user]);

    if (!user) return <p>Loading...</p>;

    return (
        <div style={{ maxWidth: 600, margin: '2rem auto' }}>
            <h1>Daftar Percakapan</h1>
            <ul>
                {contacts.length > 0 ? (
                    contacts.map(id => (
                        <li key={id} style={{ margin: '0.5rem 0' }}>
                            <Link href={`/chat/${id}`}>
                                Chat dengan user #{id}
                            </Link>
                        </li>
                    ))
                ) : (
                    <li>Belum ada percakapan.</li>
                )}
            </ul>
        </div>
    );
}
