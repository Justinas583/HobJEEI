import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';

export const Landing = () => {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
            padding: 'var(--spacing-xl)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Decorative gradient orbs */}
            <div style={{
                position: 'absolute',
                top: '10%',
                right: '15%',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(60px)',
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '15%',
                left: '10%',
                width: '350px',
                height: '350px',
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(60px)',
                pointerEvents: 'none'
            }} />

            {/* Main content */}
            <div style={{
                position: 'relative',
                zIndex: 1,
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--spacing-xl)'
            }}>
                <h1 style={{
                    fontSize: 'clamp(4rem, 12vw, 8rem)',
                    fontWeight: 700,
                    background: 'linear-gradient(to right, #3b82f6, #10b981)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontFamily: "'HobJEEI Logo', sans-serif",
                    marginBottom: 'var(--spacing-md)',
                    letterSpacing: '0.02em'
                }}>
                    HobJEEI
                </h1>

                <p style={{
                    fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
                    color: 'var(--color-text-muted)',
                    maxWidth: '600px',
                    lineHeight: 1.6,
                    marginBottom: 'var(--spacing-lg)'
                }}>
                    Connecting available people with available events
                </p>

                <Link to="/login">
                    <Button style={{
                        fontSize: '1.125rem',
                        padding: 'var(--spacing-md) var(--spacing-xl)',
                        background: 'linear-gradient(to right, #3b82f6, #10b981)',
                        border: 'none',
                        boxShadow: '0 10px 40px rgba(59, 130, 246, 0.3)',
                        transition: 'all 0.3s ease'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 15px 50px rgba(59, 130, 246, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 10px 40px rgba(59, 130, 246, 0.3)';
                        }}>
                        Get Started
                    </Button>
                </Link>

                <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--color-text-muted)',
                    marginTop: 'var(--spacing-md)'
                }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{
                        color: 'var(--color-primary)',
                        fontWeight: 500,
                        textDecoration: 'none',
                        transition: 'color 0.2s'
                    }}>
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};
