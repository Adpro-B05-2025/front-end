'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { getConversations, getMessagesBetween } from '@/utils/chatService';
import ChatWindow from './ChatWindow';

export default function ChatPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);               // array of contact IDs
  const [previews, setPreviews] = useState({});               // { [contactId]: lastMessage }
  const [selected, setSelected] = useState(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [search, setSearch] = useState('');

  // detect ≥768px
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)');
    const onChange = e => setIsDesktop(e.matches);
    mql.addListener(onChange);
    setIsDesktop(mql.matches);
    return () => mql.removeListener(onChange);
  }, []);

  // load conversations (just contact IDs)
  useEffect(() => {
    if (!user) return;
    getConversations(user.id).then(ids => {
      setContacts(ids);
      // for each contact, fetch last message as preview
      ids.forEach(id => {
        getMessagesBetween(user.id, id)
          .then(msgs => {
            const last = msgs[msgs.length - 1];
            setPreviews(prev => ({
              ...prev,
              [id]: last ? last.content : 'No messages yet.'
            }));
          })
          .catch(() => {
            setPreviews(prev => ({
              ...prev,
              [id]: '—'
            }));
          });
      });
    });
  }, [user]);

  if (!user) return <p>Loading...</p>;

  const filtered = contacts.filter(id =>
    id.toString().includes(search.trim())
  );

  // Mobile view
  if (!isDesktop) {
    return (
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-xl font-bold mb-4">Daftar Percakapan</h1>
        <ul>
          {filtered.length > 0 ? (
            filtered.map(id => (
              <li key={id} className="mb-2">
                <Link
                  href={`/chat/${id}`}
                  className="block p-4 mb-2 border rounded-lg hover:bg-gray-100"
                >
                  <div className="font-semibold">{id}</div>
                  <div className="text-sm text-gray-500 truncate">
                    {previews[id] || 'Loading...'}
                  </div>
                </Link>
              </li>
            ))
          ) : (
            <li>Tidak ada percakapan.</li>
          )}
        </ul>
      </div>
    );
  }

  // Desktop view
  return (
    <div className="flex h-screen min-h-0">
      {/* Sidebar */}
      <div className="w-1/4 border-r border-gray-300 overflow-y-auto min-h-0 p-4">
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full mb-4 px-3 py-2 border rounded focus:outline-none"
        />

        {filtered.length > 0 ? (
          filtered.map(id => (
            <div
              key={id}
              onClick={() => setSelected(id)}
              className={`p-4 mb-2 rounded-lg cursor-pointer ${
                selected === id ? 'bg-gray-200' : 'hover:bg-gray-100'
              }`}
            >
              <div className="font-semibold">{id}</div>
              <div className="text-sm text-gray-500 truncate">
                {previews[id] || 'Loading...'}
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-500">Tidak ada percakapan.</div>
        )}
      </div>

      {/* Chat panel */}
      <div className="flex-1 flex flex-col min-h-0">
        {selected ? (
          <ChatWindow myId={user.id} contactId={selected} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Pilih percakapan
          </div>
        )}
      </div>
    </div>
  );
}
