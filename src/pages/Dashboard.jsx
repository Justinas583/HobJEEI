import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Masonry from 'react-masonry-css';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { storage } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';

export const Dashboard = () => {
    const [events, setEvents] = useState([]);
    const [showMyEventsOnly, setShowMyEventsOnly] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        let allEvents = storage.getEvents();

        // Apply filter if toggle is on
        if (showMyEventsOnly && user) {
            if (user.role === 'client') {
                // Show only events where user is registered
                allEvents = allEvents.filter(event =>
                    event.attendees.some(attendee => attendee.userId === user.id)
                );
            } else if (user.role === 'company') {
                // Show only events created by this company
                allEvents = allEvents.filter(event => event.ownerId === user.id);
            }
            // Admin sees all events regardless
        }

        // Sort by date (earliest first)
        const sortedEvents = allEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
        setEvents(sortedEvents);
    }, [showMyEventsOnly, user]);

    const handleDelete = (e, eventId, eventTitle) => {
        e.preventDefault();
        e.stopPropagation();

        if (window.confirm(`Are you sure you want to delete "${eventTitle}"?`)) {
            storage.deleteEvent(eventId);
            const allEvents = storage.getEvents();
            const sortedEvents = allEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
            setEvents(sortedEvents);
        }
    };

    const getFilterLabel = () => {
        if (user?.role === 'client') return 'My Registrations';
        if (user?.role === 'company') return 'My Events';
        return 'My Events';
    };

    return (
        <div>
            <div className="flex-between" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h1 className="text-2xl">Upcoming Events</h1>
                <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center' }}>
                    {user?.role !== 'admin' && (
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-xs)',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            color: 'var(--color-text-muted)'
                        }}>
                            <input
                                type="checkbox"
                                checked={showMyEventsOnly}
                                onChange={(e) => setShowMyEventsOnly(e.target.checked)}
                                style={{ width: 'auto', cursor: 'pointer' }}
                            />
                            {getFilterLabel()}
                        </label>
                    )}
                    {(user?.role === 'company' || user?.role === 'admin') && (
                        <Link to="/create">
                            <Button>+ New Event</Button>
                        </Link>
                    )}
                </div>
            </div>

            {events.length === 0 ? (
                <Card className="flex-center" style={{ minHeight: '200px', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    <p className="text-sm">No events found.</p>
                    {(user?.role === 'company' || user?.role === 'admin') && (
                        <Link to="/create">
                            <Button variant="ghost">Create your first event</Button>
                        </Link>
                    )}
                </Card>
            ) : (
                <Masonry
                    breakpointCols={{
                        default: 3,
                        1100: 2,
                        700: 1
                    }}
                    className="masonry-grid"
                    columnClassName="masonry-grid-column"
                >
                    {events.map(event => {
                        const isOwner = (user?.role === 'company' && event.ownerId === user.id) || user?.role === 'admin';
                        const recurringText = event.recurring?.enabled
                            ? event.recurring.frequency === 'weekly'
                                ? '🔄 Weekly'
                                : '🔄 Custom'
                            : null;

                        return (
                            <Link key={event.id} to={`/event/${event.id}`} style={{ display: 'block' }}>
                                <Card className="event-card" style={{ transition: 'transform 0.2s', position: 'relative', overflow: 'hidden' }}>
                                    {event.imageUrl && (
                                        <div style={{
                                            width: '100%',
                                            height: '150px',
                                            backgroundImage: `url(${event.imageUrl})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            marginBottom: 'var(--spacing-md)'
                                        }} />
                                    )}

                                    {isOwner && (
                                        <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: 'var(--spacing-sm)', right: 'var(--spacing-sm)', zIndex: 10 }}>
                                            <button
                                                onClick={(e) => handleDelete(e, event.id, event.title)}
                                                style={{
                                                    background: 'rgba(239, 68, 68, 0.9)',
                                                    color: 'white',
                                                    padding: '4px 8px',
                                                    borderRadius: 'var(--radius-sm)',
                                                    fontSize: '0.75rem',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.target.style.background = 'var(--color-danger)'}
                                                onMouseLeave={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.9)'}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                    <div style={{ marginBottom: 'var(--spacing-sm)', display: 'flex', gap: 'var(--spacing-xs)', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px',
                                            color: 'var(--color-primary)'
                                        }}>
                                            {event.type}
                                        </span>
                                        {recurringText && (
                                            <span style={{
                                                fontSize: '0.7rem',
                                                background: 'rgba(59, 130, 246, 0.1)',
                                                color: 'var(--color-primary)',
                                                padding: '2px 6px',
                                                borderRadius: 'var(--radius-sm)'
                                            }}>
                                                {recurringText}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-xl" style={{ marginBottom: 'var(--spacing-xs)' }}>{event.title}</h3>
                                    <p className="text-sm" style={{ marginBottom: 'var(--spacing-xs)' }}>
                                        {new Date(event.date).toLocaleDateString()} • {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    {event.location && (
                                        <p className="text-sm" style={{ marginBottom: 'var(--spacing-xs)', color: 'var(--color-text-muted)' }}>
                                            📍 {event.location}
                                        </p>
                                    )}
                                    {event.duration && (
                                        <p className="text-sm" style={{ marginBottom: 'var(--spacing-xs)', color: 'var(--color-text-muted)' }}>
                                            ⏱️ {event.duration} min
                                        </p>
                                    )}
                                    <p className="text-sm" style={{ marginBottom: 'var(--spacing-md)', color: 'var(--color-text-muted)' }}>
                                        👥 {event.attendees.length}{event.maxAttendees ? ` / ${event.maxAttendees}` : ''} attendees
                                    </p>
                                    <p style={{
                                        color: 'var(--color-text-muted)',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        fontSize: '0.875rem'
                                    }}>
                                        {event.description}
                                    </p>
                                </Card>
                            </Link>
                        );
                    })}
                </Masonry>
            )}
        </div>
    );
};
