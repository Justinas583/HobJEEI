import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const location = useLocation();
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
                await login(adminUser);
            } else {
                // Regular user login
                await login(formData.email, formData.password);
            }

            // Check for redirect param
            const params = new URLSearchParams(location.search);
            const redirect = params.get('redirect');
            navigate(redirect || '/dashboard');

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="auth-background">
            <div className="blob"></div>

            <Card style={{ maxWidth: '400px', width: '100%', position: 'relative', zIndex: 2 }}>
                <h1 className="text-2xl logo-inverted" style={{
                    marginBottom: 'var(--spacing-md)',
                    textAlign: 'center',
                    background: 'linear-gradient(to right, #df6674ff, #f257d5ff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontFamily: "'HobJEEI Logo', sans-serif"
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
                    <Link to={`/signup${location.search}`} style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
                        Sign up
                    </Link>
                </p>
            </Card>
        </div>
    );
};
