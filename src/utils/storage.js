const STORAGE_KEY = 'hobjeei_events';
const CONFIG_KEY = 'hobjeei_config';
const USERS_KEY = 'hobjeei_users';
const AUTH_KEY = 'hobjeei_auth';

export const storage = {
  getConfig: () => {
    const config = localStorage.getItem(CONFIG_KEY);
    return config ? JSON.parse(config) : {};
  },

  saveConfig: (config) => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  },

  getEvents: () => {
    const events = localStorage.getItem(STORAGE_KEY);
    return events ? JSON.parse(events) : [];
  },

  saveEvents: (events) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  },

  addEvent: (eventData) => {
    const events = storage.getEvents();
    const newEvent = {
      id: crypto.randomUUID(),
      ...eventData,
      attendees: [],
      createdAt: new Date().toISOString()
    };
    events.push(newEvent);
    storage.saveEvents(events);
    return newEvent;
  },

  getEvent: (id) => {
    const events = storage.getEvents();
    return events.find(e => e.id === id);
  },

  addAttendee: (eventId, name, userId = null) => {
    const events = storage.getEvents();
    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) return null;

    // Check if user already registered
    if (userId && events[eventIndex].attendees.some(a => a.userId === userId)) {
      return null; // User already registered
    }

    const newAttendee = {
      id: crypto.randomUUID(),
      name,
      userId, // Track which user registered
      attended: userId ? true : false, // Auto-present for client self-registration
      registeredAt: new Date().toISOString()
    };

    events[eventIndex].attendees.push(newAttendee);
    storage.saveEvents(events);
    return newAttendee;
  },

  toggleAttendance: (eventId, attendeeId) => {
    const events = storage.getEvents();
    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) return null;

    const attendeeIndex = events[eventIndex].attendees.findIndex(a => a.id === attendeeId);
    if (attendeeIndex === -1) return null;

    events[eventIndex].attendees[attendeeIndex].attended = !events[eventIndex].attendees[attendeeIndex].attended;
    storage.saveEvents(events);
    return events[eventIndex];
  },

  deleteEvent: (eventId) => {
    const events = storage.getEvents();
    const filteredEvents = events.filter(e => e.id !== eventId);
    storage.saveEvents(filteredEvents);
    return true;
  },

  deleteAttendee: (eventId, attendeeId) => {
    const events = storage.getEvents();
    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) return null;

    events[eventIndex].attendees = events[eventIndex].attendees.filter(a => a.id !== attendeeId);
    storage.saveEvents(events);
    return events[eventIndex];
  },

  updateEvent: (eventId, updates) => {
    const events = storage.getEvents();
    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) return null;

    events[eventIndex] = {
      ...events[eventIndex],
      ...updates,
      id: eventId, // Preserve ID
      attendees: events[eventIndex].attendees // Preserve attendees
    };
    storage.saveEvents(events);
    return events[eventIndex];
  },

  unregisterAttendee: (eventId, userId) => {
    const events = storage.getEvents();
    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) return null;

    events[eventIndex].attendees = events[eventIndex].attendees.filter(a => a.userId !== userId);
    storage.saveEvents(events);
    return events[eventIndex];
  },

  // User management
  getUsers: () => {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  },

  saveUsers: (users) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  getUserByEmail: (email) => {
    const users = storage.getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  addUser: (userData) => {
    const users = storage.getUsers();
    const newUser = {
      id: crypto.randomUUID(),
      ...userData,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    storage.saveUsers(users);
    return newUser;
  },

  // Auth
  getCurrentUser: () => {
    const auth = localStorage.getItem(AUTH_KEY);
    return auth ? JSON.parse(auth) : null;
  },

  setCurrentUser: (user) => {
    if (user) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  }
};
