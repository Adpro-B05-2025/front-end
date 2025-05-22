'use client';

import React from 'react';
import ChatWindow from '../ChatWindow';
import { useAuth } from '@/context/AuthProvider';
import { redirect } from 'next/navigation';

export default function ChatWithPage({ params }) {
    const { user } = useAuth();
    
    // Add validation and debugging
    console.log('ChatWithPage params:', params);
    
    // Ensure contactId is properly parsed
    const contactId = params?.contactId ? Number(params.contactId) : null;
    
    console.log('Parsed contactId:', contactId);
    
    // Validate contactId
    if (!contactId || isNaN(contactId)) {
        console.error('Invalid contactId:', params?.contactId);
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-red-600">Invalid Contact ID</h2>
                    <p className="text-gray-600">The contact ID is missing or invalid.</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="loading-spinner"></div>
                    <p className="mt-2">Loading user data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen">
            <ChatWindow 
                myId={user.id} 
                contactId={contactId}
                onNewConversation={() => {}} // Add empty handler or implement as needed
            />
        </div>
    );
}