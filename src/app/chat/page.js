'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { getConversations, getMessagesBetween } from '@/utils/chatService';
import ChatWindow from './ChatWindow';
import { useSearchParams } from 'next/navigation';

export default function ChatPage() {
    const { user } = useAuth();
    const searchParams = useSearchParams();

    const [contacts, setContacts] = useState([]); // array of { contactId, contactName }
    const [previews, setPreviews] = useState({});
    const [selected, setSelected] = useState(null);
    const [isDesktop, setIsDesktop] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const mql = window.matchMedia('(min-width: 768px)');
        const onChange = e => setIsDesktop(e.matches);
        mql.addListener(onChange);
        setIsDesktop(mql.matches);
        return () => mql.removeListener(onChange);
    }, []);

    useEffect(() => {
        if (!user) return;
        getConversations(user.id).then(list => {
            setContacts(list);
            list.forEach(({ contactId }) =>
                getMessagesBetween(user.id, contactId)
                    .then(msgs => {
                        const last = msgs[msgs.length - 1];
                        setPreviews(p => ({
                            ...p,
                            [contactId]: last ? last.content : 'No messages yet.'
                        }));
                    })
                    .catch(() =>
                        setPreviews(p => ({ ...p, [contactId]: '—' }))
                    )
            );
        });
    }, [user]);

    const handleNewConversation = (newId) => {
        if (!contacts.some(c => c.contactId === newId)) {
            setContacts(prev => [...prev, { contactId: newId, contactName: `User ${newId}` }]);
            setPreviews(p => ({ ...p, [newId]: 'Loading…' }));
        }
    };

    useEffect(() => {
        const q = searchParams.get('contactId');
        if (q) {
            const idNum = Number(q);
            if (!isNaN(idNum)) setSelected(idNum);
        }
    }, [searchParams]);

    if (!user) return <p>Loading...</p>;

    const filtered = contacts.filter(c =>
        (c.contactName || c.contactId.toString())
            .toLowerCase()
            .includes(search.trim().toLowerCase())
    );

    if (!isDesktop) {
        return (
            <div className="max-w-md mx-auto p-4">
                <h1 className="text-xl font-bold mb-4">Daftar Percakapan</h1>
                <ul>
                    {filtered.length > 0 ? (
                        filtered.map(c => (
                            <li key={c.contactId} className="mb-2">
                                <a
                                    href={`/chat?contactId=${c.contactId}`}
                                    className="block p-4 mb-2 border rounded-lg hover:bg-gray-100"
                                    onClick={() => setSelected(c.contactId)}
                                >
                                    <div className="font-semibold">{c.contactName}</div>
                                    <div className="text-sm text-gray-500 truncate">
                                        {previews[c.contactId] || 'Loading...'}
                                    </div>
                                </a>
                            </li>
                        ))
                    ) : (
                        <li>Start a new chat</li>
                    )}
                </ul>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-4rem-3.5rem)] min-h-0">
            <div className="w-1/4 border-r border-gray-300 overflow-y-auto min-h-0 p-4">
                <input
                    type="text"
                    placeholder="Search"
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
                                {previews[c.contactId] || 'Loading...'}
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
                        onNewConversation={handleNewConversation}
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
