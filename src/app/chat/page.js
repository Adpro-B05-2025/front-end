'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';
import ChatWindow from './ChatWindow';
import { useSearchParams } from 'next/navigation';
import {
    connectWS,
    subscribeRoom,
    disconnectWS
} from '@/utils/socketService';
import { api } from '@/utils/api';

export default function ChatPage() {
    const { user } = useAuth();
    const searchParams = useSearchParams();

    const [contacts, setContacts] = useState([]);       // { contactId, contactName }[]
    const [previews, setPreviews] = useState({});       // { [contactId]: lastMessage }
    const [selected, setSelected] = useState(null);     // contactId
    const [isDesktop, setIsDesktop] = useState(false);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // State untuk menyimpan nama dokter dari ChatWindow
    const [currentContactName, setCurrentContactName] = useState('');

    // Chat service URL - should match your backend
    const CHAT_SERVICE_URL = process.env.NEXT_PUBLIC_CHAT_API_URL || 'http://localhost:8082';

    // 1) Detect desktop vs mobile
    useEffect(() => {
        const mql = window.matchMedia('(min-width: 768px)');
        const onChange = e => setIsDesktop(e.matches);
        mql.addListener(onChange);
        setIsDesktop(mql.matches);
        return () => mql.removeListener(onChange);
    }, []);

    // 2) Fetch list of conversation partners once via REST
    useEffect(() => {
        if (!user) return;
        
        setLoading(true);
        setError(null);
        
        fetch(`${CHAT_SERVICE_URL}/api/chat/contacts?userId=${user.id}`)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(async list => {
                // Filter out the user's own ID from contacts
                const filteredList = list.filter(contact => contact.contactId !== user.id);
                
                // Fetch names for contacts if they don't have names
                const contactsWithNames = await Promise.all(
                    filteredList.map(async contact => {
                        // If contact already has a name, use it
                        if (contact.contactName) {
                            return contact;
                        }
                        
                        // Otherwise fetch the contact's profile
                        try {
                            // Try to get caregiver profile first (likely doctors)
                            const caregiverRes = await api.getCareGiverProfile(contact.contactId);
                            if (caregiverRes.ok) {
                                const data = await caregiverRes.json();
                                return {
                                    ...contact,
                                    contactName: data.name || `User ${contact.contactId}`
                                };
                            }
                            
                            // If not a caregiver, try regular user profile
                            const userRes = await api.getUserProfile(contact.contactId);
                            if (userRes.ok) {
                                const data = await userRes.json();
                                return {
                                    ...contact,
                                    contactName: data.name || `User ${contact.contactId}`
                                };
                            }
                            
                            // If neither worked, keep original contact
                            return contact;
                        } catch (error) {
                            console.error(`Error fetching profile for contact ID ${contact.contactId}:`, error);
                            return contact;
                        }
                    })
                );
                
                setContacts(contactsWithNames);
            })
            .catch(err => {
                console.error('Fetch contacts failed:', err);
                setError(`Failed to load contacts: ${err.message}`);
                setContacts([]);
            })
            .finally(() => {
                setLoading(false);
            });
        }, [user, CHAT_SERVICE_URL]);

    // 3) Selected contact from URL
    useEffect(() => {
        const q = searchParams.get('contactId');
        // Only select if it's not the user's own ID
        if (q && !isNaN(+q) && +q !== user?.id) {
            setSelected(+q);
        }
    }, [searchParams, user]);

    // Safety check to prevent self-chat if user ID changes
    useEffect(() => {
        if (selected === user?.id) {
            setSelected(null);
        }
    }, [selected, user]);

    // 5) Update contacts list when we get a name from ChatWindow
    useEffect(() => {
        if (currentContactName && selected) {
            setContacts(prevContacts => {
                return prevContacts.map(contact => {
                    if (contact.contactId === selected) {
                        return { ...contact, contactName: currentContactName };
                    }
                    return contact;
                });
            });
        }
    }, [currentContactName, selected]);

    if (!user) return <p>Loading user...</p>;

    // 4) Filter contacts by search
    const filtered = contacts.filter(c =>
        (c.contactName || c.contactId.toString())
            .toLowerCase()
            .includes(search.trim().toLowerCase())
    );

    // Show loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="loading-spinner"></div>
                    <p className="mt-2">Loading chat contacts...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // 5) Mobile view: simple list
    if (!isDesktop) {
        return (
            <div className="max-w-md mx-auto p-4">
                <h1 className="text-xl font-bold mb-4">Daftar Percakapan</h1>
                <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full mb-4 px-3 py-2 border rounded focus:outline-none"
                />
                <ul>
                    {filtered.length > 0 ? (
                        filtered.map(c => (
                            <li key={c.contactId} className="mb-2">
                                <a
                                    href={`?contactId=${c.contactId}`}
                                    onClick={() => setSelected(c.contactId)}
                                    className="block p-4 border rounded-lg hover:bg-gray-100"
                                >
                                    <div className="font-semibold">{c.contactName || `User ${c.contactId}`}</div>
                                    <div className="text-sm text-gray-500 truncate">
                                        {c.lastMessage || previews[c.contactId] || '—'}
                                    </div>
                                </a>
                            </li>
                        ))
                    ) : (
                        <li className="text-center py-8 text-gray-500">
                            Tidak ada percakapan.
                        </li>
                    )}
                </ul>
            </div>
        );
    }

    // 6) Desktop layout: sidebar + window
    return (
        <div className="flex h-[calc(100vh-4rem-3.5rem)] min-h-0">
            <div className="w-1/4 border-r border-gray-300 overflow-y-auto min-h-0 p-4">
                <h2 className="text-lg font-semibold mb-4">Chat Contacts</h2>
                <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full mb-4 px-3 py-2 border rounded focus:outline-none"
                />

                {filtered.length > 0 ? (
                    filtered.map(c => (
                        <div
                            key={c.contactId}
                            onClick={() => setSelected(c.contactId)}
                            className={`p-4 mb-2 rounded-lg cursor-pointer transition-colors ${
                                selected === c.contactId
                                    ? 'bg-blue-100 border-blue-300'
                                    : 'hover:bg-gray-100 border-transparent'
                            } border`}
                        >
                            <div className="font-semibold">{c.contactName || `User ${c.contactId}`}</div>
                            <div className="text-sm text-gray-500 truncate">
                                {c.lastMessage || previews[c.contactId] || '—'}
                            </div>
                            {selected === c.contactId && (
                                <div className="text-xs text-blue-600 mt-1">
                                    Active chat
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        Tidak ada percakapan.
                    </div>
                )}
            </div>

            <div className="flex-1 flex flex-col min-h-0">
                {selected ? (
                    <div key={selected} className="flex flex-col h-full">
                        <div className="p-4 border-b bg-gray-50 text-sm text-gray-600">
                            🔌 Connecting to chat with contact ID: {selected}...
                        </div>
                        <ChatWindow
                            myId={user.id}
                            contactId={selected}
                            onNameChange={name => setCurrentContactName(name)}
                            onNewConversation={newId => {
                                // Prevent adding self as contact
                                if (newId !== user.id && !contacts.find(x => x.contactId === newId)) {
                                    // Use "dokter" as default name for contact ID 1
                                    const defaultName = newId === 1 ? "dokter" : `User ${newId}`;
                                    setContacts(prev => [
                                        ...prev,
                                        { contactId: newId, contactName: defaultName }
                                    ]);
                                }
                            }}
                        />
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>Pilih kontak untuk memulai chat</p>
                    </div>
                )}
            </div>
        </div>
    );
}