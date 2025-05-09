import React from 'react';

function Sidebar({ users, onSelectUser }) {
    return (
        React.createElement('div', { className: 'w-1/4 border-r border-gray-300 bg-white h-full overflow-y-auto' },
            users.map((user) =>
                React.createElement('div', {
                        key: user.id,
                        className: 'p-4 hover:bg-gray-100 cursor-pointer',
                        onClick: () => onSelectUser(user),
                    },
                    React.createElement('p', { className: 'font-semibold' }, user.name),
                    React.createElement('p', { className: 'text-sm text-gray-500 truncate' }, user.lastMessage || 'No messages yet.')
                )
            )
        )
    );
}

export default Sidebar;