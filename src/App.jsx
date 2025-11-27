import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { CreateEvent } from './pages/CreateEvent';
import { EditEvent } from './pages/EditEvent';
import { EventDetails } from './pages/EventDetails';
import { Map } from './pages/Map';
import { CalendarPage } from './pages/Calendar';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : children;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Landing page - only shown when not logged in */}
      <Route path="/" element={
        user ? <Navigate to="/dashboard" replace /> : <Landing />
      } />

      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/signup" element={
        <PublicRoute>
          <Signup />
        </PublicRoute>
      } />

      {/* Protected routes with Layout */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="map" element={<Map />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="create" element={
          <ProtectedRoute>
            {({ user }) => (user.role === 'company' || user.role === 'admin') ? <CreateEvent /> : <Navigate to="/dashboard" replace />}
          </ProtectedRoute>
        } />
        <Route path="event/:id" element={<EventDetails />} />
        <Route path="event/:id/edit" element={
          <ProtectedRoute>
            {({ user }) => (user.role === 'company' || user.role === 'admin') ? <EditEvent /> : <Navigate to="/dashboard" replace />}
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
