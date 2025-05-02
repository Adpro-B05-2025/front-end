'use client';

import ChatWindow from '../ChatWindow';
import { useAuth } from '@/components/AuthProvider';

export default function ChatWithPage({ params }) {
    const { user } = useAuth();
    const contactId = Number(params.contactId);

    if (!user) return <p>Loading...</p>;

    return (
        <ChatWindow
            myId={user.id}
            contactId={contactId}
        />
    );
}
