import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

export const Layout = () => {
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();
    const { user, logout } = useAuth();

    return (
        <div className="app-container">
            <header style={{
                padding: 'var(--spacing-md) 0',
                marginBottom: 'var(--spacing-xl)',
                borderBottom: '1px solid var(--color-border)'
            }}>
                <div className="container flex-between">
                    <Link to="/" className="text-2xl" style={{
                        background: 'linear-gradient(to right, #3b82f6, #10b981)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontFamily: "'HobJEEI Logo', sans-serif"
                    }}>
                        HobJEEI
                    </Link>
                    <nav style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center' }}>
                        <Link to="/">
                            <button className={`btn ${location.pathname === '/' ? 'btn-primary' : 'btn-ghost'}`}>
                                Events
                            </button>
                        </Link>
                        <Link to="/map">
                            <button className={`btn ${location.pathname === '/map' ? 'btn-primary' : 'btn-ghost'}`}>
                                Map
                            </button>
                        </Link>
                        <Link to="/calendar">
                            <button className={`btn ${location.pathname === '/calendar' ? 'btn-primary' : 'btn-ghost'}`}>
                                Calendar
                            </button>
                        </Link>

                        <button
                            onClick={toggleTheme}
                            className="btn btn-ghost"
                            style={{ fontSize: '1.25rem' }}
                            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                        >
                            {theme === 'dark' ? '☀️' : '🌙'}
                        </button>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-sm)',
                            paddingLeft: 'var(--spacing-md)',
                            borderLeft: '1px solid var(--color-border)'
                        }}>
                            <div style={{ textAlign: 'right' }}>
                                <div className="user-info-name" style={{ fontSize: '0.875rem', fontWeight: 500 }}>{user?.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                                    {user?.role}
                                </div>
                            </div>
                            <button onClick={logout} className="btn btn-ghost" style={{ fontSize: '0.875rem' }}>
                                Logout
                            </button>
                        </div>
                    </nav>
                </div>
            </header>
            <main className="container">
                <Outlet />
            </main>
        </div>
    );
};
