import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { storage } from '../utils/storage';
import { Link } from 'react-router-dom';
import { Card } from '../components/Card';

// Color mapping for event types
const eventColors = {
    'Sport': '#ef4444',
    'Hobby': '#3b82f6',
    'Meeting': '#10b981',
    'Social': '#f59e0b'
};

export const CalendarPage = () => {
    const [date, setDate] = useState(new Date());
    const [viewDate, setViewDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [expandedEvents, setExpandedEvents] = useState([]);

    useEffect(() => {
        const fetchEvents = async () => {
            const allEvents = await storage.getEvents();
            setEvents(allEvents);
        };
        fetchEvents();
    }, []);

    // Generate recurring event instances for a given date range
    const generateRecurringInstances = (event, startDate, endDate) => {
        if (!event.recurring?.enabled) return [];

        const instances = [];
        const eventDate = new Date(event.date);
        const eventDay = eventDate.getDay(); // 0-6 (Sunday-Saturday)

        if (event.recurring.frequency === 'weekly') {
            // For weekly recurring events, generate instances on the same day of the week
            let currentDate = new Date(startDate);
            currentDate.setHours(0, 0, 0, 0);

            // Move to the first occurrence on or after startDate
            while (currentDate.getDay() !== eventDay) {
                currentDate.setDate(currentDate.getDate() + 1);
            }

            // Generate instances until endDate
            while (currentDate <= endDate) {
                if (currentDate >= eventDate) { // Only show instances on or after the original event date
                    instances.push({
                        ...event,
                        displayDate: new Date(currentDate),
                        isRecurringInstance: true
                    });
                }
                currentDate.setDate(currentDate.getDate() + 7); // Next week
            }
        } else if (event.recurring.frequency === 'custom' && event.recurring.weekdays) {
            // For custom recurring events, generate instances on specified weekdays
            let currentDate = new Date(startDate);
            currentDate.setHours(0, 0, 0, 0);

            while (currentDate <= endDate) {
                if (currentDate >= eventDate && event.recurring.weekdays.includes(currentDate.getDay())) {
                    instances.push({
                        ...event,
                        displayDate: new Date(currentDate),
                        isRecurringInstance: true
                    });
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }

        return instances;
    };

    // Get all events (including recurring instances) for the current month view
    // Get all events (including recurring instances) for the current month view
    const getAllEventsForMonth = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);

        const allEventInstances = [];

        events.forEach(event => {
            const eventDate = new Date(event.date);

            // Add single event if it's in this month
            if (eventDate >= startDate && eventDate <= endDate) {
                allEventInstances.push({
                    ...event,
                    displayDate: eventDate,
                    isRecurringInstance: false
                });
            }

            // Add recurring instances
            if (event.recurring?.enabled) {
                const instances = generateRecurringInstances(event, startDate, endDate);
                allEventInstances.push(...instances);
            }
        });

        return allEventInstances;
    };

    // Get events for a specific date
    const getEventsForDate = (checkDate) => {
        const allEventInstances = getAllEventsForMonth();

        return allEventInstances.filter(event => {
            const eventDate = event.displayDate || new Date(event.date);
            return eventDate.toDateString() === checkDate.toDateString();
        });
    };

    // Custom tile content to show event indicators
    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const dayEvents = getEventsForDate(date);

            if (dayEvents.length > 0) {
                return (
                    <div style={{
                        display: 'flex',
                        gap: '2px',
                        justifyContent: 'center',
                        marginTop: '2px',
                        flexWrap: 'wrap'
                    }}>
                        {dayEvents.slice(0, 3).map((event, idx) => (
                            <div
                                key={`${event.id}-${idx}`}
                                style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    backgroundColor: eventColors[event.type] || '#6b7280'
                                }}
                                title={event.title}
                            />
                        ))}
                        {dayEvents.length > 3 && (
                            <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)' }}>
                                +{dayEvents.length - 3}
                            </span>
                        )}
                    </div>
                );
            }
        }
        return null;
    };

    // Handle date click
    const handleDateChange = (newDate) => {
        setDate(newDate);
        const dayEvents = getEventsForDate(newDate);
        setExpandedEvents(dayEvents);
    };

    // Handle month change
    const handleActiveStartDateChange = ({ activeStartDate }) => {
        setViewDate(activeStartDate);
    };

    const selectedDateEvents = getEventsForDate(date);

    return (
        <div>
            <h1 className="text-2xl" style={{ marginBottom: 'var(--spacing-md)' }}>Event Calendar</h1>

            <div className="calendar-layout">
                <div>
                    <div style={{
                        background: 'var(--color-surface)',
                        padding: 'var(--spacing-md)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)'
                    }}>
                        <Calendar
                            onChange={handleDateChange}
                            value={date}
                            onActiveStartDateChange={handleActiveStartDateChange}
                            tileContent={tileContent}
                            className="custom-calendar"
                        />
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
                                        width: '12px',
                                        height: '12px',
                                        borderRadius: '50%',
                                        backgroundColor: color
                                    }} />
                                    <span style={{ fontSize: '0.875rem' }}>{type}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: 'var(--spacing-md)' }}>
                        {date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </h3>

                    {selectedDateEvents.length === 0 ? (
                        <Card style={{ padding: 'var(--spacing-lg)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                            No events scheduled
                        </Card>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                            {selectedDateEvents.map((event, idx) => (
                                <Card key={`${event.id}-${idx}`} style={{ padding: 'var(--spacing-md)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-xs)' }}>
                                        <h4 style={{ fontSize: '1rem', fontWeight: '600' }}>{event.title}</h4>
                                        {event.isRecurringInstance && (
                                            <span style={{
                                                fontSize: '0.7rem',
                                                background: 'rgba(59, 130, 246, 0.1)',
                                                color: 'var(--color-primary)',
                                                padding: '2px 6px',
                                                borderRadius: 'var(--radius-sm)'
                                            }}>
                                                🔄 Recurring
                                            </span>
                                        )}
                                    </div>
                                    <p style={{
                                        fontSize: '0.75rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        color: eventColors[event.type],
                                        marginBottom: 'var(--spacing-xs)'
                                    }}>
                                        {event.type}
                                    </p>
                                    <p style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-xs)' }}>
                                        🕒 {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    {event.location && (
                                        <p style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-xs)' }}>
                                            📍 {event.location}
                                        </p>
                                    )}
                                    {event.duration && (
                                        <p style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-xs)' }}>
                                            ⏱️ {event.duration} min
                                        </p>
                                    )}
                                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                                        👥 {event.attendees.length}{event.maxAttendees ? ` / ${event.maxAttendees}` : ''}
                                    </p>
                                    <Link
                                        to={`/dashboard/event/${event.id}`}
                                        style={{
                                            display: 'inline-block',
                                            padding: '0.375rem 0.75rem',
                                            backgroundColor: eventColors[event.type],
                                            color: 'white',
                                            borderRadius: 'var(--radius-sm)',
                                            fontSize: '0.875rem',
                                            textDecoration: 'none',
                                            fontWeight: '500'
                                        }}
                                    >
                                        View Details
                                    </Link>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
