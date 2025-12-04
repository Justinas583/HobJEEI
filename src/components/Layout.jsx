import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

export const Layout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const { user, logout } = useAuth();

    return (
        <div className="colorful-background">
            <div className="blob"></div>

            <div className="app-container" style={{ position: 'relative', zIndex: 2, width: '100%' }}>
                <header style={{
                    padding: 'var(--spacing-md) 0',
                    marginBottom: 'var(--spacing-xl)',
                    borderBottom: '1px solid var(--color-border)'
                }}>
                    <div className="container flex-between">
                        <Link to="/dashboard" className="text-2xl" style={{
                            background: 'linear-gradient(to right, #3b82f6, #10b981)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontFamily: "'HobJEEI Logo', sans-serif"
                        }}>
                            HobJEEI
                        </Link>
                        <nav style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center' }}>
                            <Link to="/dashboard">
                                <button className={`btn ${location.pathname === '/dashboard' ? 'btn-primary' : 'btn-ghost'}`} style={{ fontSize: '1.1rem' }}>
                                    Events
                                </button>
                            </Link>

                            {user && (
                                <>
                                    <Link to="/dashboard/map">
                                        <button className={`btn ${location.pathname === '/dashboard/map' ? 'btn-primary' : 'btn-ghost'}`} style={{ fontSize: '1.1rem' }}>
                                            Map
                                        </button>
                                    </Link>
                                    <Link to="/dashboard/calendar">
                                        <button className={`btn ${location.pathname === '/dashboard/calendar' ? 'btn-primary' : 'btn-ghost'}`} style={{ fontSize: '1.1rem' }}>
                                            Calendar
                                        </button>
                                    </Link>
                                </>
                            )}

                            <button
                                onClick={toggleTheme}
                                className="btn btn-ghost"
                                style={{ fontSize: '1.25rem' }}
                                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                            >
                                {theme === 'dark' ? '☀️' : '🌙'}
                            </button>

                            {user ? (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--spacing-sm)',
                                    paddingLeft: 'var(--spacing-md)',
                                    borderLeft: '1px solid var(--color-border)'
                                }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <div className="user-info-name" style={{ fontSize: '0.875rem', fontWeight: 500 }}>{user.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                                            {user.role}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            logout();
                                            navigate('/');
                                        }}
                                        className="btn btn-ghost"
                                        style={{ fontSize: '1.25rem' }}
                                        title="Logout"
                                    >
                                        ↩
                                    </button>
                                </div>
                            ) : (
                                <div style={{
                                    display: 'flex',
                                    gap: 'var(--spacing-sm)',
                                    paddingLeft: 'var(--spacing-md)',
                                    borderLeft: '1px solid var(--color-border)'
                                }}>
                                    <Link to="/login">
                                        <button className="btn btn-ghost">Login</button>
                                    </Link>
                                    <Link to="/signup">
                                        <button className="btn btn-primary">Sign Up</button>
                                    </Link>
                                </div>
                            )}
                        </nav>
                    </div>
                </header>
                <main className="container">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
