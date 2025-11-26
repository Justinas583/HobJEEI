import { supabase } from '../lib/supabase';

export const storage = {
  // Config (keep local for now as it's app settings, not data)
  getConfig: () => {
    const config = localStorage.getItem('hobjeei_config');
    return config ? JSON.parse(config) : {};
  },

  saveConfig: (config) => {
    localStorage.setItem('hobjeei_config', JSON.stringify(config));
  },

  // Events
  getEvents: async () => {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        attendees (*)
      `);

    if (error) {
      console.error('Error fetching events:', error);
      return [];
    }

    // Transform data to match app structure (attendees is an array)
    return data.map(event => ({
      ...event,
      // Ensure date is a string if it comes back as Date object, though Supabase returns strings
      date: event.date,
      attendees: (event.attendees || []).map(a => ({
        ...a,
        userId: a.user_id,
        eventId: a.event_id
      })),
      // Map snake_case to camelCase if needed, but let's try to stick to what we have.
      // The app uses camelCase (ownerId, maxAttendees). Supabase columns are usually snake_case.
      // We need to map them or update the app. Mapping is safer for now.
      ownerId: event.owner_id,
      ownerName: event.owner_name,
      maxAttendees: event.max_attendees,
      price: event.price,
      locationUrl: event.location_url,
      imageUrl: event.image_url,
      recurring: {
        enabled: event.recurring_enabled,
        frequency: event.recurring_frequency,
        weekdays: event.recurring_weekdays
      }
    }));
  },

  addEvent: async (eventData) => {
    const { data, error } = await supabase
      .from('events')
      .insert([{
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        location: eventData.location,
        location_url: eventData.locationUrl,
        latitude: eventData.latitude,
        longitude: eventData.longitude,
        image_url: eventData.imageUrl,
        type: eventData.type,
        max_attendees: eventData.maxAttendees,
        price: eventData.price,
        owner_id: eventData.ownerId,
        owner_name: eventData.ownerName,
        duration: eventData.duration,
        recurring_enabled: eventData.recurring?.enabled,
        recurring_frequency: eventData.recurring?.frequency,
        recurring_weekdays: eventData.recurring?.weekdays
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding event:', error);
      throw error;
    }

    return {
      ...data,
      attendees: [],
      ownerId: data.owner_id,
      ownerName: data.owner_name,
      maxAttendees: data.max_attendees,
      price: data.price,
      locationUrl: data.location_url,
      imageUrl: data.image_url,
      recurring: {
        enabled: data.recurring_enabled,
        frequency: data.recurring_frequency,
        weekdays: data.recurring_weekdays
      }
    };
  },

  getEvent: async (id) => {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        attendees (*)
      `)
      .eq('id', id)
      .single();

    if (error) return null;

    return {
      ...data,
      attendees: (data.attendees || []).map(a => ({
        ...a,
        userId: a.user_id,
        eventId: a.event_id
      })),
      ownerId: data.owner_id,
      ownerName: data.owner_name,
      maxAttendees: data.max_attendees,
      price: data.price,
      locationUrl: data.location_url,
      imageUrl: data.image_url,
      recurring: {
        enabled: data.recurring_enabled,
        frequency: data.recurring_frequency,
        weekdays: data.recurring_weekdays
      }
    };
  },

  updateEvent: async (eventId, updates) => {
    // Map camelCase updates to snake_case
    const dbUpdates = {};
    if (updates.title) dbUpdates.title = updates.title;
    if (updates.description) dbUpdates.description = updates.description;
    if (updates.date) dbUpdates.date = updates.date;
    if (updates.location) dbUpdates.location = updates.location;
    if (updates.locationUrl) dbUpdates.location_url = updates.locationUrl;
    if (updates.latitude) dbUpdates.latitude = updates.latitude;
    if (updates.longitude) dbUpdates.longitude = updates.longitude;
    if (updates.imageUrl) dbUpdates.image_url = updates.imageUrl;
    if (updates.type) dbUpdates.type = updates.type;
    if (updates.maxAttendees) dbUpdates.max_attendees = updates.maxAttendees;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.duration) dbUpdates.duration = updates.duration;
    if (updates.recurring) {
      dbUpdates.recurring_enabled = updates.recurring.enabled;
      dbUpdates.recurring_frequency = updates.recurring.frequency;
      dbUpdates.recurring_weekdays = updates.recurring.weekdays;
    }

    const { data, error } = await supabase
      .from('events')
      .update(dbUpdates)
      .eq('id', eventId)
      .select()
      .single();

    if (error) {
      console.error('Error updating event:', error);
      throw error;
    }

    return data;
  },

  toggleAttendance: async (eventId, attendeeId) => {
    // First get current status
    const { data: attendee, error: fetchError } = await supabase
      .from('attendees')
      .select('attended')
      .eq('id', attendeeId)
      .single();

    if (fetchError) return null;

    // Toggle it
    const { data, error } = await supabase
      .from('attendees')
      .update({ attended: !attendee.attended })
      .eq('id', attendeeId)
      .select()
      .single();

    if (error) return null;
    return data;
  },

  deleteEvent: async (eventId) => {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) {
      console.error('Error deleting event:', error);
      return false;
    }
    return true;
  },

  // Attendees
  addAttendee: async (eventId, name, userId = null, attended = true) => {
    // Check if already registered
    if (userId) {
      const { data: existing } = await supabase
        .from('attendees')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();

      if (existing) return null;
    }

    const { data, error } = await supabase
      .from('attendees')
      .insert([{
        event_id: eventId,
        name,
        user_id: userId,
        attended
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding attendee:', error);
      return null;
    }

    return {
      ...data,
      userId: data.user_id,
      eventId: data.event_id
    };
  },

  deleteAttendee: async (eventId, attendeeId) => {
    const { error } = await supabase
      .from('attendees')
      .delete()
      .eq('id', attendeeId);

    if (error) return null;
    return true;
  },

  unregisterAttendee: async (eventId, userId) => {
    const { error } = await supabase
      .from('attendees')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);

    if (error) return null;
    return true;
  },

  // Users
  getUsers: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*');

    if (error) return [];
    return data;
  },

  getUserByEmail: async (email) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('email', email) // Case insensitive
      .single();

    if (error) return null;
    return data;
  },

  addUser: async (userData) => {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) {
      console.error('Error adding user:', error);
      throw error;
    }
    return data;
  },

  // Auth (Local Session)
  getCurrentUser: () => {
    const auth = localStorage.getItem('hobjeei_auth');
    return auth ? JSON.parse(auth) : null;
  },

  setCurrentUser: (user) => {
    if (user) {
      localStorage.setItem('hobjeei_auth', JSON.stringify(user));
    } else {
      localStorage.removeItem('hobjeei_auth');
    }
  }
};
