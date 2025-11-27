import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { storage } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';

export const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [event, setEvent] = useState(null);

    useEffect(() => {
        const fetchEvent = async () => {
            const e = await storage.getEvent(id);
            if (!e) {
                navigate('/dashboard');
                return;
            }
            setEvent(e);
        };
        fetchEvent();
    }, [id, navigate]);

    const isUserRegistered = () => {
        if (!user || !event) return false;
        return event.attendees.some(a => a.userId === user.id);
    };

    const getUserAttendee = () => {
        if (!user || !event) return null;
        return event.attendees.find(a => a.userId === user.id);
    };

    const isEventFull = () => {
        if (!event || !event.maxAttendees) return false;
        return event.attendees.length >= event.maxAttendees;
    };

    const isOwner = () => {
        return user && event && (event.ownerId === user.id || user.role === 'admin');
    };

    const handleRegister = async () => {
        if (user.role === 'company') {
            // Companies can add by email
            const email = prompt('Enter participant email:');
            if (!email?.trim()) return;

            const participant = await storage.getUserByEmail(email);
            if (!participant) {
                alert('User not found with that email');
                return;
            }

            // Pass userId so the participant can unregister themselves later
            await storage.addAttendee(id, participant.name, participant.id);
            const updatedEvent = await storage.getEvent(id);
            setEvent(updatedEvent);
        } else {
            // Clients register themselves
            await storage.addAttendee(id, user.name, user.id);
            const updatedEvent = await storage.getEvent(id);
            setEvent(updatedEvent);
        }
    };

    const handleUnregister = async () => {
        if (window.confirm('Are you sure you want to unregister from this event?')) {
            await storage.unregisterAttendee(id, user.id);
            const updatedEvent = await storage.getEvent(id);
            setEvent(updatedEvent);
        }
    };

    const toggleAttendance = async (attendeeId) => {
        try {
            await storage.toggleAttendance(id, attendeeId);
            // Refresh event data to show updated status
            const updatedEvent = await storage.getEvent(id);
            setEvent(updatedEvent);
        } catch (error) {
            console.error('Error toggling attendance:', error);
            alert('Failed to update attendance status');
        }
    };

    const handleDeleteEvent = async () => {
        if (window.confirm(`Are you sure you want to delete "${event.title}"? This action cannot be undone.`)) {
            await storage.deleteEvent(id);
            navigate('/dashboard');
        }
    };

    const handleDeleteAttendee = async (attendeeId, attendeeName) => {
        // Check permissions: Admin can remove anyone, Company can remove from their own events
        const canRemove = user.role === 'admin' || (user.role === 'company' && event.ownerId === user.id);

        if (!canRemove) {
            alert('You do not have permission to remove attendees from this event.');
            return;
        }

        if (window.confirm(`Remove ${attendeeName} from this event?`)) {
            await storage.deleteAttendee(id, attendeeId);
            const updatedEvent = await storage.getEvent(id);
            setEvent(updatedEvent);
        }
    };

    const getRecurringText = () => {
        if (!event.recurring?.enabled) return null;

        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        if (event.recurring.frequency === 'weekly') {
            const day = weekdays[event.recurring.weekdays[0]];
            return `Repeats weekly on ${day}s`;
        } else if (event.recurring.frequency === 'custom') {
            const days = event.recurring.weekdays.map(d => weekdays[d].slice(0, 3)).join(', ');
            return `Repeats on ${days}`;
        }
        return null;
    };

    if (!event) return null;

    const userAttendee = getUserAttendee();
    const registered = isUserRegistered();
    const eventFull = isEventFull();
    const recurringText = getRecurringText();

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <Button variant="ghost" onClick={() => navigate('/dashboard')} style={{ paddingLeft: 0 }}>
                    ← Back to Dashboard
                </Button>
            </div>

            <Card style={{ marginBottom: 'var(--spacing-lg)', overflow: 'hidden', padding: 0 }}>
                {event.imageUrl && (
                    <div style={{
                        width: '100%',
                        height: '300px',
                        backgroundImage: `url(${event.imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }} />
                )}

                <div style={{ padding: 'var(--spacing-lg)' }}>
                    <div className="flex-between" style={{ marginBottom: 'var(--spacing-md)' }}>
                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{
                                color: 'var(--color-primary)',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                fontSize: '0.875rem'
                            }}>
                                {event.type}
                            </span>
                            {recurringText && (
                                <span style={{
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    color: 'var(--color-primary)',
                                    padding: '2px 8px',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '0.75rem'
                                }}>
                                    🔄 {recurringText}
                                </span>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
                            <span className="text-sm">
                                {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isOwner() && (
                                <>
                                    <Link to={`/dashboard/event/${id}/edit`}>
                                        <button
                                            style={{
                                                background: 'rgba(59, 130, 246, 0.1)',
                                                color: 'var(--color-primary)',
                                                padding: '4px 8px',
                                                borderRadius: 'var(--radius-sm)',
                                                fontSize: '0.75rem',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.target.style.background = 'var(--color-primary)'}
                                            onMouseLeave={(e) => e.target.style.background = 'rgba(59, 130, 246, 0.1)'}
                                        >
                                            Edit
                                        </button>
                                    </Link>
                                    <button
                                        onClick={handleDeleteEvent}
                                        style={{
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            color: 'var(--color-danger)',
                                            padding: '4px 8px',
                                            borderRadius: 'var(--radius-sm)',
                                            fontSize: '0.75rem',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.target.style.background = 'var(--color-danger)'}
                                        onMouseLeave={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                                    >
                                        Delete
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <h1 className="text-2xl" style={{ marginBottom: 'var(--spacing-md)' }}>{event.title}</h1>

                    {event.location && (
                        <div style={{ marginBottom: 'var(--spacing-sm)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                            <span style={{ fontSize: '0.875rem' }}>📍</span>
                            {event.locationUrl ? (
                                <a
                                    href={event.locationUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: 'var(--color-primary)', fontSize: '0.875rem', textDecoration: 'underline' }}
                                >
                                    {event.location}
                                </a>
                            ) : (
                                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{event.location}</span>
                            )}
                        </div>
                    )}

                    {event.ownerName && (
                        <div style={{ marginBottom: 'var(--spacing-sm)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                            <span style={{ fontSize: '0.875rem' }}>👤</span>
                            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Organized by {event.ownerName}</span>
                        </div>
                    )}

                    {event.duration && (
                        <div style={{ marginBottom: 'var(--spacing-sm)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                            <span style={{ fontSize: '0.875rem' }}>⏱️</span>
                            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{event.duration} minutes</span>
                        </div>
                    )}

                    {event.price > 0 && (
                        <div style={{ marginBottom: 'var(--spacing-sm)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                            <span style={{ fontSize: '0.875rem' }}>💰</span>
                            <span style={{ color: 'var(--color-primary)', fontSize: '0.875rem', fontWeight: '600' }}>€{event.price.toFixed(2)}</span>
                        </div>
                    )}

                    <div style={{ marginBottom: 'var(--spacing-sm)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                        <span style={{ fontSize: '0.875rem' }}>👥</span>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                            {event.attendees.length}{event.maxAttendees ? ` / ${event.maxAttendees}` : ''} attendees
                        </span>
                    </div>

                    <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6, marginTop: 'var(--spacing-md)' }}>{event.description}</p>
                </div>
            </Card>

            <h2 className="text-xl" style={{ marginBottom: 'var(--spacing-md)' }}>Participants</h2>

            <div className="grid-auto" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', marginBottom: 'var(--spacing-xl)' }}>
                {event.attendees.map(attendee => {
                    const isCurrentUser = user?.id === attendee.userId;
                    const canToggle = user?.role === 'company' || isCurrentUser;

                    return (
                        <Card key={attendee.id} style={{ padding: 'var(--spacing-md)', position: 'relative' }}>
                            {(user?.role === 'admin' || (user?.role === 'company' && event.ownerId === user.id)) && (
                                <button
                                    onClick={() => handleDeleteAttendee(attendee.id, attendee.name)}
                                    style={{
                                        position: 'absolute',
                                        top: '4px',
                                        right: '4px',
                                        background: 'transparent',
                                        color: 'var(--color-danger)',
                                        padding: '2px 4px',
                                        fontSize: '0.7rem',
                                        opacity: 0.6,
                                        transition: 'opacity 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.opacity = '1'}
                                    onMouseLeave={(e) => e.target.style.opacity = '0.6'}
                                >
                                    ✕
                                </button>
                            )}
                            <div className="flex-between">
                                <span style={{ fontWeight: 500 }}>
                                    {attendee.name}
                                    {isCurrentUser && <span style={{ marginLeft: '4px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>(You)</span>}
                                </span>
                                {canToggle ? (
                                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <input
                                            type="checkbox"
                                            checked={attendee.attended}
                                            onChange={() => toggleAttendance(attendee.id)}
                                            style={{ width: 'auto' }}
                                        />
                                        <span style={{ fontSize: '0.75rem', color: attendee.attended ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                                            {attendee.attended ? 'Present' : 'Absent'}
                                        </span>
                                    </label>
                                ) : (
                                    <span style={{ fontSize: '0.75rem', color: attendee.attended ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                                        {attendee.attended ? '✓ Present' : '○ Absent'}
                                    </span>
                                )}
                            </div>
                        </Card>
                    );
                })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--spacing-xl)' }}>
                {!registered && !eventFull && isOwner() && user?.role === 'company' && (
                    <Button onClick={handleRegister} style={{ width: '100%', maxWidth: '300px' }}>
                        Add Participant by Email
                    </Button>
                )}
                {!registered && !eventFull && !isOwner() && user?.role === 'client' && (
                    <Button onClick={handleRegister} style={{ width: '100%', maxWidth: '300px' }}>
                        Register for Event
                    </Button>
                )}
                {!registered && eventFull && user?.role === 'client' && (
                    <div style={{
                        padding: 'var(--spacing-md)',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: 'var(--color-danger)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '1rem',
                        textAlign: 'center',
                        width: '100%'
                    }}>
                        Event Full
                    </div>
                )}
                {registered && user?.role === 'client' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', alignItems: 'center', width: '100%' }}>
                        <div style={{
                            padding: 'var(--spacing-md)',
                            background: 'rgba(16, 185, 129, 0.1)',
                            color: 'var(--color-success)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '1rem',
                            textAlign: 'center',
                            width: '100%',
                            maxWidth: '300px'
                        }}>
                            ✓ You're registered
                        </div>
                        <Button
                            onClick={handleUnregister}
                            style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: 'var(--color-danger)',
                                width: '100%',
                                maxWidth: '300px'
                            }}
                        >
                            Unregister
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
