'use client';

import { useAuth } from '@/components/AuthProvider';

export default function DummyLoginPage() {
    const { loginAsDummy } = useAuth();

    return (
        <div style={{ padding: '2rem' }}>
            <h2>Pilih Dummy User</h2>
            <button onClick={() => loginAsDummy(10, 'Alice')}>Login sebagai Alice (id: 10)</button>
            <br />
            <button onClick={() => loginAsDummy(20, 'Bob')}>Login sebagai Bob (id: 20)</button>
        </div>
    );
}
