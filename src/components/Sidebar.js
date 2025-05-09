// src/components/Sidebar.js
import React from 'react';
import { useRouter } from 'next/navigation';

function Sidebar({ users }) {
    const router = useRouter();

    return (
        <div className="w-1/4 border-r border-gray-300 bg-white h-full overflow-y-auto">
            {users.map(user => (
                <div
                    key={user.id}
                    className="p-4 hover:bg-gray-100 cursor-pointer"
                    onClick={() => router.push(`/chat?contactId=${user.id}`)}
                >
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-gray-500 truncate">
                        {user.lastMessage || 'No messages yet.'}
                    </p>
                </div>
            ))}
        </div>
    );
}

export default Sidebar;
