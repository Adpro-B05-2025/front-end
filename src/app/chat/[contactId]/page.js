// src/app/chat/[contactId]/page.js
'use client';

import React from 'react';
import ChatWindow from '../ChatWindow';
import { useAuth } from '@/components/AuthProvider';

export default function ChatWithPage({ params }) {
    const { user } = useAuth();
    const contactId = Number(params.contactId);

    if (!user) return <p>Loading...</p>;

    return (
        <div className="h-screen">
            <ChatWindow myId={user.id} contactId={contactId} />
        </div>
    );
}
