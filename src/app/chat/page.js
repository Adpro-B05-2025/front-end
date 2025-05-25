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
        
        console.log('Fetching contacts for user:', user.id);
        setLoading(true);
        setError(null);
        
        // Call the chat service directly
        fetch(`${CHAT_SERVICE_URL}/api/chat/contacts?userId=${user.id}`)
            .then(res => {
                console.log('Contacts response status:', res.status);
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
                }
                return res.json();
            })
            .then(list => {
                console.log('Received contacts:', list);
                setContacts(list);
                setError(null);
                
                // DON'T connect WebSocket here - only when user selects a contact
                
            })
            .catch(err => {
                console.error('Fetch contacts failed:', err);
                setError(`Failed to load contacts: ${err.message}`);
                setContacts([]);
            })
            .finally(() => {
                setLoading(false);
            });
            
        // No WebSocket cleanup needed here since we're not connecting yet
    }, [user, CHAT_SERVICE_URL]);

    // 3) Selected contact from URL
    useEffect(() => {
        const q = searchParams.get('contactId');
        if (q && !isNaN(+q)) {
            setSelected(+q);
        }
    }, [searchParams]);

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
                    <div className="text-red-600 mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.732 0L3.732 16.5c-.77.833-.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Connection Error</h3>
                    <p className="mt-2 text-gray-600">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Retry
                    </button>
                    <div className="mt-4 text-sm text-gray-500">
                        <p>Trying to connect to: {CHAT_SERVICE_URL}</p>
                        <p>Make sure the chat service is running on port 8082</p>
                    </div>
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
                                    className="block p-4 border rounded-lg hover:bg-gray-100"
                                    onClick={() => setSelected(c.contactId)}
                                >
                                    <div className="font-semibold">{c.contactName}</div>
                                    <div className="text-sm text-gray-500 truncate">
                                        {c.lastMessage || previews[c.contactId] || '—'}
                                    </div>
                                </a>
                            </li>
                        ))
                    ) : (
                        <li className="text-center py-8 text-gray-500">
                            <div>Tidak ada percakapan.</div>
                            <div className="text-sm mt-2">Mulai chat dengan dokter dari halaman "Find Doctors"</div>
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
                            onClick={() => {
                                console.log('Selecting contact:', c.contactId);
                                setSelected(c.contactId);
                            }}
                            className={`p-4 mb-2 rounded-lg cursor-pointer transition-colors ${
                                selected === c.contactId ? 'bg-blue-100 border-blue-300' : 'hover:bg-gray-100 border-transparent'
                            } border`}
                        >
                            <div className="font-semibold">{c.contactName}</div>
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
                        <div>Tidak ada percakapan.</div>
                        <div className="text-sm mt-2">Mulai chat dengan dokter dari halaman "Find Doctors"</div>
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
                            onNewConversation={newId => {
                                if (!contacts.find(c => c.contactId === newId)) {
                                    // update contacts list
                                    const newContact = { contactId: newId, contactName: `User ${newId}` };
                                    setContacts(prev => [...prev, newContact]);
                                }
                            }}
                        />
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <p className="mt-2">Pilih kontak untuk memulai chat</p>
                            <p className="text-sm mt-1">WebSocket akan terhubung setelah Anda memilih kontak</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}