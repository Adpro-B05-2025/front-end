import React, { useState } from 'react';

function ChatPanel({ messages, onSendMessage, selectedUser, currentUserId }) {
    const [content, setContent] = useState('');

    const handleSend = () => {
        if (!content.trim()) return;
        onSendMessage(content);
        setContent('');
    };

    return (
        React.createElement('div', { className: 'w-3/4 flex flex-col justify-between h-full bg-gray-50' },
            React.createElement('div', { className: 'p-4 border-b bg-white' },
                React.createElement('h2', { className: 'font-bold text-lg' }, `Chatting with ${selectedUser.name}`)
            ),
            React.createElement('div', {
                    className: 'flex-1 p-4 overflow-y-auto space-y-2 flex flex-col'
                },
                messages.map((msg) =>
                    React.createElement('div', {
                        key: msg.id,
                        className: `max-w-[70%] p-2 rounded-lg ${msg.senderId === currentUserId ? 'bg-blue-200 self-end' : 'bg-gray-200 self-start'}`
                    }, msg.content)
                )
            ),
            React.createElement('div', { className: 'p-4 border-t bg-white flex gap-2' },
                React.createElement('input', {
                    type: 'text',
                    value: content,
                    onChange: (e) => setContent(e.target.value),
                    placeholder: 'Type a message...',
                    className: 'flex-1 border rounded p-2'
                }),
                React.createElement('button', {
                    onClick: handleSend,
                    className: 'bg-blue-500 text-white px-4 py-2 rounded'
                }, 'Send')
            )
        )
    );
}

export default ChatPanel;
