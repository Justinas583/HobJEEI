import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { storage } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

// Color mapping for event types
const eventColors = {
    'Sport': '#ef4444',      // Red
    'Hobby': '#3b82f6',      // Blue
    'Meeting': '#10b981',    // Green
    'Social': '#f59e0b'      // Orange
};

// Create custom marker icons for each event type
const createMarkerIcon = (type) => {
    const color = eventColors[type] || '#6b7280'; // Default gray

    return new Icon({
        iconUrl: `data:image/svg+xml;base64,${btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
                <path fill="${color}" d="M12 0C7.58 0 4 3.58 4 8c0 5.25 8 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
            </svg>
        `)}`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });
};

export const Map = () => {
    const [events, setEvents] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        // Get all events that have coordinates
        const allEvents = storage.getEvents();
        const eventsWithCoords = allEvents.filter(e => e.latitude && e.longitude);
        setEvents(eventsWithCoords);
    }, []);

    // Default center (Vilnius, Lithuania)
    const defaultCenter = [54.6872, 25.2797];
    const defaultZoom = 7;

    return (
        <div>
            <h1 className="text-2xl" style={{ marginBottom: 'var(--spacing-md)' }}>Events Map</h1>

            <div style={{
                height: '70vh',
                minHeight: '500px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: '1px solid var(--color-border)'
            }}>
                <MapContainer
                    center={events.length > 0 && events[0].latitude && events[0].longitude
                        ? [events[0].latitude, events[0].longitude]
                        : defaultCenter
                    }
                    zoom={defaultZoom}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {events.map(event => (
                        <Marker
                            key={event.id}
                            position={[event.latitude, event.longitude]}
                            icon={createMarkerIcon(event.type)}
                        >
                            <Popup>
                                <div style={{ minWidth: '200px' }}>
                                    <h3 style={{
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        marginBottom: '0.5rem',
                                        color: eventColors[event.type]
                                    }}>
                                        {event.title}
                                    </h3>
                                    <p style={{
                                        fontSize: '0.75rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        color: eventColors[event.type],
                                        marginBottom: '0.5rem'
                                    }}>
                                        {event.type}
                                    </p>
                                    <p style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                                        📅 {new Date(event.date).toLocaleDateString()}
                                    </p>
                                    <p style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                                        🕒 {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    {event.location && (
                                        <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                            📍 {event.location}
                                        </p>
                                    )}
                                    <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.75rem' }}>
                                        👥 {event.attendees.length}{event.maxAttendees ? ` / ${event.maxAttendees}` : ''} attendees
                                    </p>
                                    <Link
                                        to={`/event/${event.id}`}
                                        style={{
                                            display: 'inline-block',
                                            padding: '0.25rem 0.75rem',
                                            backgroundColor: eventColors[event.type],
                                            color: 'white',
                                            borderRadius: '0.375rem',
                                            fontSize: '0.875rem',
                                            textDecoration: 'none',
                                            fontWeight: '500'
                                        }}
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            <div style={{
                marginTop: 'var(--spacing-md)',
                padding: 'var(--spacing-md)',
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)'
            }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: 'var(--spacing-sm)' }}>Legend</h3>
                <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                    {Object.entries(eventColors).map(([type, color]) => (
                        <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                            <div style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                backgroundColor: color
                            }} />
                            <span style={{ fontSize: '0.875rem' }}>{type}</span>
                        </div>
                    ))}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-sm)' }}>
                    Showing {events.length} event{events.length !== 1 ? 's' : ''} with coordinates
                </p>
            </div>
        </div>
    );
};
