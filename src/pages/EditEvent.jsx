import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { storage } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';

export const EditEvent = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();
    const [formData, setFormData] = useState(null);

    useEffect(() => {
        const fetchEvent = async () => {
            const event = await storage.getEvent(id);
            if (!event) {
                navigate('/dashboard');
                return;
            }

            // Check if user is owner
            if (event.ownerId !== user.id && user.role !== 'admin') {
                navigate(`/dashboard/event/${id}`);
                return;
            }

            setFormData({
                title: event.title,
                description: event.description,
                date: event.date ? new Date(new Date(event.date).getTime() - (new Date(event.date).getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : '',
                duration: event.duration || '60',
                type: event.type,
                location: event.location || '',
                locationUrl: event.locationUrl || '',
                latitude: event.latitude || '',
                longitude: event.longitude || '',
                imageUrl: event.imageUrl || '',
                maxAttendees: event.maxAttendees || '',
                price: event.price || '',
                recurringEnabled: event.recurring?.enabled || false,
                recurringFrequency: event.recurring?.frequency || 'weekly',
                recurringWeekdays: event.recurring?.weekdays || []
            });
        };
        fetchEvent();
    }, [id, user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const updates = {
            title: formData.title,
            description: formData.description,
            date: formData.date,
            duration: formData.duration ? parseInt(formData.duration) : 60,
            type: formData.type,
            location: formData.location || null,
            locationUrl: formData.locationUrl || null,
            latitude: formData.latitude ? parseFloat(formData.latitude) : null,
            longitude: formData.longitude ? parseFloat(formData.longitude) : null,
            imageUrl: formData.imageUrl || null,
            maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null,
            price: formData.price ? parseFloat(formData.price) : 0,
            recurring: {
                enabled: formData.recurringEnabled,
                frequency: formData.recurringEnabled ? formData.recurringFrequency : null,
                weekdays: formData.recurringEnabled && formData.recurringFrequency === 'custom'
                    ? formData.recurringWeekdays
                    : formData.recurringEnabled && formData.recurringFrequency === 'weekly'
                        ? [new Date(formData.date).getDay()]
                        : []
            }
        };

        await storage.updateEvent(id, updates);
        navigate(`/dashboard/event/${id}`);
    };

    const toggleWeekday = (day) => {
        setFormData(prev => ({
            ...prev,
            recurringWeekdays: prev.recurringWeekdays.includes(day)
                ? prev.recurringWeekdays.filter(d => d !== day)
                : [...prev.recurringWeekdays, day].sort()
        }));
    };

    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    if (!formData) return null;

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h1 className="text-2xl" style={{ marginBottom: 'var(--spacing-lg)' }}>Edit Event</h1>
            <Card>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '0.875rem' }}>Event Title</label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. Friday Football"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '0.875rem' }}>Type</label>
                        <select
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="Sport">Sport</option>
                            <option value="Hobby">Hobby</option>
                            <option value="Meeting">Meeting</option>
                            <option value="Social">Social</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '0.875rem' }}>Date & Time</label>
                        <input
                            required
                            type="datetime-local"
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '0.875rem' }}>Duration (minutes)</label>
                        <input
                            required
                            type="number"
                            min="15"
                            step="15"
                            placeholder="60"
                            value={formData.duration}
                            onChange={e => setFormData({ ...formData, duration: e.target.value })}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '0.875rem' }}>Location</label>
                        <input
                            type="text"
                            placeholder="e.g. Central Park Field 3"
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '0.875rem' }}>Google Maps Link (Optional)</label>
                        <input
                            type="url"
                            placeholder="https://maps.google.com/..."
                            value={formData.locationUrl}
                            onChange={e => setFormData({ ...formData, locationUrl: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-sm)' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '0.875rem' }}>Latitude (Optional)</label>
                            <input
                                type="number"
                                step="any"
                                placeholder="54.6872"
                                value={formData.latitude}
                                onChange={e => setFormData({ ...formData, latitude: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '0.875rem' }}>Longitude (Optional)</label>
                            <input
                                type="number"
                                step="any"
                                placeholder="25.2797"
                                value={formData.longitude}
                                onChange={e => setFormData({ ...formData, longitude: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '0.875rem' }}>Event Image URL (Optional)</label>
                        <input
                            type="url"
                            placeholder="https://example.com/image.jpg"
                            value={formData.imageUrl}
                            onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '0.875rem' }}>Maximum Attendees</label>
                        <input
                            type="number"
                            min="1"
                            placeholder="Leave empty for unlimited"
                            value={formData.maxAttendees}
                            onChange={e => setFormData({ ...formData, maxAttendees: e.target.value })}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '0.875rem' }}>Price (€)</label>
                        <input
                            type="number"
                            min="0"
                            step="1"
                            placeholder="0.00"
                            value={formData.price}
                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={formData.recurringEnabled}
                                onChange={e => setFormData({ ...formData, recurringEnabled: e.target.checked })}
                                style={{ width: 'auto' }}
                            />
                            <span style={{ fontSize: '0.875rem' }}>Recurring Event</span>
                        </label>
                    </div>

                    {formData.recurringEnabled && (
                        <>
                            <div>
                                <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '0.875rem' }}>Frequency</label>
                                <select
                                    value={formData.recurringFrequency}
                                    onChange={e => setFormData({ ...formData, recurringFrequency: e.target.value })}
                                >
                                    <option value="weekly">Weekly (same day as event date)</option>
                                    <option value="custom">Custom Weekdays</option>
                                </select>
                            </div>

                            {formData.recurringFrequency === 'custom' && (
                                <div>
                                    <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontSize: '0.875rem' }}>Select Days</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)' }}>
                                        {weekdays.map((day, index) => (
                                            <label
                                                key={day}
                                                style={{
                                                    padding: '4px 12px',
                                                    borderRadius: 'var(--radius-sm)',
                                                    fontSize: '0.75rem',
                                                    cursor: 'pointer',
                                                    background: formData.recurringWeekdays.includes(index)
                                                        ? 'var(--color-primary)'
                                                        : 'var(--color-surface)',
                                                    color: formData.recurringWeekdays.includes(index)
                                                        ? 'white'
                                                        : 'var(--color-text)',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.recurringWeekdays.includes(index)}
                                                    onChange={() => toggleWeekday(index)}
                                                    style={{ display: 'none' }}
                                                />
                                                {day.slice(0, 3)}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <div>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '0.875rem' }}>Description</label>
                        <textarea
                            rows={4}
                            placeholder="Details about the event..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-sm)' }}>
                        <Button type="button" variant="ghost" onClick={() => navigate(`/dashboard/event/${id}`)} style={{ flex: 1 }}>
                            Cancel
                        </Button>
                        <Button type="submit" style={{ flex: 1 }}>Save Changes</Button>
                    </div>
                </form>
            </Card>
        </div >
    );
};
