import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export const Signup = () => {
    const navigate = useNavigate();
    const { signup } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'client'
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await signup(formData.name, formData.email, formData.password, formData.role);
            navigate('/');
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
                    Sign Up
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
                            Name
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

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
                            minLength={6}
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '0.875rem' }}>
                            Account Type
                        </label>
                        <select
                            value={formData.role}
                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="client">Client (View & Register for Events)</option>
                            <option value="company">Company (Create & Manage Events)</option>
                        </select>
                    </div>

                    <Button type="submit" style={{ width: '100%', marginTop: 'var(--spacing-sm)' }}>
                        Sign Up
                    </Button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 'var(--spacing-lg)', fontSize: '0.875rem' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
                        Login
                    </Link>
                </p>
            </Card>
        </div>
    );
};
