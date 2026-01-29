'use client';

import { useState } from 'react';
import { supabase } from './../../libs/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            setError(error.message);
        } else {
            router.push('/dashboard');
        }

        setLoading(false);
    };

    return (
        <div
            style={{
                maxWidth: 400,
                margin: '100px auto',
                padding: 30,
                borderRadius: 16,
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                background: 'linear-gradient(135deg, #6C63FF 0%, #FF6584 100%)',
                color: '#fff',
                fontFamily: 'Arial, sans-serif',
            }}
        >
            <h1 style={{ textAlign: 'center', marginBottom: 30, fontSize: 28 }}>
                Welcome Back
            </h1>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ marginBottom: 5, fontWeight: 'bold' }}>Email</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        style={{
                            padding: 12,
                            borderRadius: 8,
                            border: 'none',
                            outline: 'none',
                            fontSize: 16,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                        }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ marginBottom: 5, fontWeight: 'bold' }}>Password</label>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        style={{
                            padding: 12,
                            borderRadius: 8,
                            border: 'none',
                            outline: 'none',
                            fontSize: 16,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                        }}
                    />
                </div>

                {error && (
                    <p style={{ color: '#ffcccb', marginTop: 5, textAlign: 'center' }}>
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        marginTop: 10,
                        padding: 14,
                        borderRadius: 10,
                        border: 'none',
                        background: '#fff',
                        color: '#6C63FF',
                        fontWeight: 'bold',
                        fontSize: 16,
                        cursor: 'pointer',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
                        transition: 'all 0.3s ease',
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.background = '#f0f0f0';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.background = '#fff';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>

    );
}
