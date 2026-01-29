'use client';

import { useEffect, useState } from 'react';
import { supabase } from './../../libs/supabase/client';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';


type Feedback = {
    id: string;
    title: string;
    description: string;
    category: string | null;
    priority: string | null;
    status: string;
    created_at: string;
};

export default function DashboardPage() {
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(false);

    // cek login + load data
    useEffect(() => {
        const init = async () => {
            const { data } = await supabase.auth.getUser();

            if (!data.user) {
                router.push('/login');
                return;
            }

            setUser(data.user);
            fetchFeedback();
        };

        init();
    }, [router]);

    const fetchFeedback = async () => {
        const { data } = await supabase
            .from('feedback')
            .select('*')
            .order('created_at', { ascending: false });
        console.log(data, 'isi data supabase')

        setFeedbacks(data || []);
    };

    const submitFeedback = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { data: inserted } = await supabase.from('feedback').insert({
            title,
            description,
            user_id: user?.id
        }).select(); // ambil data yang baru saja diinsert

        setTitle('');
        setDescription('');

        // polling sederhana sampai n8n update data
        const waitForUpdate = async (id: string, maxRetries = 3) => {
            for (let i = 0; i < maxRetries; i++) {
                const { data } = await supabase
                    .from('feedback')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (data?.status !== 'Pending') {
                    return data;
                }

                await new Promise((res) => setTimeout(res, 500)); // tunggu 0.5 detik
            }
            return null;
        };

        if (inserted?.[0]) {
            const updated = await waitForUpdate(inserted[0].id);
            if (updated) {
                setFeedbacks((prev) => [updated, ...prev.filter(f => f.id !== updated.id)]);
            } else {
                fetchFeedback(); // fallback
            }
        }

        setLoading(false);
    };




    // realtime update (n8n → supabase → UI)
    useEffect(() => {
        const channel = supabase
            .channel('feedback-realtime')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'feedback' },
                () => {
                    fetchFeedback();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <div style={{ maxWidth: 1000, margin: '40px auto', fontFamily: 'Arial, sans-serif' }}>
            <h1 style={{ textAlign: 'center', marginBottom: 30 }}>Dashboard</h1>

            <form
                onSubmit={submitFeedback}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    marginBottom: 40,
                    background: '#f9f9f9',
                    padding: 20,
                    borderRadius: 12,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    color: 'black'
                }}
            >
                <input
                    placeholder="Title"
                    value={title}
                    required
                    onChange={(e) => setTitle(e.target.value)}
                    style={{
                        padding: 10,
                        borderRadius: 8,
                        border: '1px solid #ccc',
                        fontSize: 16,
                        outline: 'none',
                    }}
                />

                <textarea
                    placeholder="Description"
                    value={description}
                    required
                    onChange={(e) => setDescription(e.target.value)}
                    style={{
                        padding: 10,
                        borderRadius: 8,
                        border: '1px solid #ccc',
                        fontSize: 16,
                        resize: 'vertical',
                        minHeight: 80,
                        outline: 'none',
                    }}
                />

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: 12,
                        borderRadius: 8,
                        border: 'none',
                        background: '#6C63FF',
                        color: '#fff',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'background 0.3s',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = '#5750d6')}
                    onMouseOut={(e) => (e.currentTarget.style.background = '#6C63FF')}
                >
                    {loading ? 'Submitting...' : 'Submit Feedback'}
                </button>
            </form>

            <h2 style={{ marginBottom: 20 }}>Your Feedback</h2>

            {/* Grid container */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: 20,
                }}
            >
                {feedbacks.map((fb) => {
                    // Tentukan warna berdasarkan status
                    const statusColor = fb.status === 'Pending' ? '#f1c40f' : '#2ecc71';

                    return (
                        <div
                            key={fb.id}
                            style={{
                                padding: 20,
                                borderRadius: 12,
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                background: '#fff',
                                borderLeft: `5px solid ${statusColor}`,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                            }}
                        >
                            <div>
                                <h3 style={{ margin: 0, marginBottom: 10, color: statusColor }}>
                                    {fb.title}
                                </h3>
                                <p style={{ margin: '0 0 10px 0', color: '#555' }}>{fb.description}</p>
                            </div>

                            <div>
                                <p style={{ margin: 0, fontWeight: 'bold', color: statusColor }}>
                                    {fb.status === 'Pending' ? '⏳ Processing...' : '✅ Processed'}
                                </p>

                                <p style={{ marginTop: 10, fontSize: 14, color: '#666' }}>
                                    Category: <strong>{fb.category || '-'}</strong> | Priority: <strong>{fb.priority || '-'}</strong>
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>




    );
}
