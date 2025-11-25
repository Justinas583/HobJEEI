import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export const Login = () => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // Hardcoded admin credentials
            if (formData.email === 'admin@hobjei.com' && formData.password === 'admin123') {
                const adminUser = {
                    id: 'admin-user-id',
                    email: 'admin@hobjei.com',
                    name: 'Administrator',
                    role: 'admin'
                };
                login(adminUser);
            } else {
                // Regular user login
                login(formData.email, formData.password);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--spacing-md)'
        }}>
            <Card style={{ maxWidth: '400px', width: '100%' }}>
                <h1 className="text-2xl" style={{
                    marginBottom: 'var(--spacing-md)',
                    textAlign: 'center',
                    background: 'linear-gradient(to right, #3b82f6, #10b981)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    HobJEEI
                </h1>
                <h2 className="text-xl" style={{ marginBottom: 'var(--spacing-lg)', textAlign: 'center' }}>
                    Login
                </h2>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: 'var(--color-danger)',
                        padding: 'var(--spacing-sm) var(--spacing-md)',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: 'var(--spacing-md)',
                        fontSize: '0.875rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '0.875rem' }}>
                            Email
                        </label>
                        <input
                            required
                            type="email"
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '0.875rem' }}>
                            Password
                        </label>
                        <input
                            required
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <Button type="submit" style={{ width: '100%', marginTop: 'var(--spacing-sm)' }}>
                        Login
                    </Button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 'var(--spacing-md)', fontSize: '0.875rem' }}>
                    Don't have an account?{' '}
                    <Link to="/signup" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
                        Sign up
                    </Link>
                </p>
            </Card>
        </div>
    );
};
