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
        fetch(`/api/chat/contacts?userId=${user.id}`)
            .then(res => res.ok ? res.json() : [])
            .then(list => {
                setContacts(list);
                // subscribe to each room for preview updates
                connectWS(
                    { subscribeTopics: client => {/* no-op */} },
                    () => {
                        list.forEach(({ contactId }) =>
                            subscribeRoom(contactId, msg => {
                                setPreviews(p => ({
                                    ...p,
                                    [contactId]: msg.content
                                }));
                            })
                        );
                    },
                    err => console.error('WS error', err)
                );
            })
            .catch(err => console.error('Fetch contacts failed', err));
        return () => {
            disconnectWS();
        };
    }, [user]);

    // 3) Selected contact from URL
    useEffect(() => {
        const q = searchParams.get('contactId');
        if (q && !isNaN(+q)) {
            setSelected(+q);
        }
    }, [searchParams]);

    if (!user) return <p>Loading...</p>;

    // 4) Filter contacts by search
    const filtered = contacts.filter(c =>
        (c.contactName || c.contactId.toString())
            .toLowerCase()
            .includes(search.trim().toLowerCase())
    );

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
                                        {previews[c.contactId] ?? '—'}
                                    </div>
                                </a>
                            </li>
                        ))
                    ) : (
                        <li>Tidak ada percakapan.</li>
                    )}
                </ul>
            </div>
        );
    }

    // 6) Desktop layout: sidebar + window
    return (
        <div className="flex h-[calc(100vh-4rem-3.5rem)] min-h-0">
            <div className="w-1/4 border-r border-gray-300 overflow-y-auto min-h-0 p-4">
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
                            className={`p-4 mb-2 rounded-lg cursor-pointer ${
                                selected === c.contactId ? 'bg-gray-200' : 'hover:bg-gray-100'
                            }`}
                        >
                            <div className="font-semibold">{c.contactName}</div>
                            <div className="text-sm text-gray-500 truncate">
                                {previews[c.contactId] ?? '—'}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-gray-500">Tidak ada percakapan.</div>
                )}
            </div>

            <div className="flex-1 flex flex-col min-h-0">
                {selected ? (
                    <ChatWindow
                        myId={user.id}
                        contactId={selected}
                        onNewConversation={newId => {
                            if (!contacts.find(c => c.contactId === newId)) {
                                // update contacts list & subscribe
                                const newContact = { contactId: newId, contactName: `User ${newId}` };
                                setContacts(prev => [...prev, newContact]);
                                subscribeRoom(newId, msg =>
                                    setPreviews(p => ({ ...p, [newId]: msg.content }))
                                );
                            }
                        }}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        Mulai percakapan dengan memilih kontak.
                    </div>
                )}
            </div>
        </div>
    );
}
