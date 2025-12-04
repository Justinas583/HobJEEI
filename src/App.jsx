import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();

  if (user) {
    const params = new URLSearchParams(location.search);
    const redirect = params.get('redirect');
    return <Navigate to={redirect || "/"} replace />;
  }

  return children;
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

      {/* Dashboard routes - Public access for main dashboard and event details */}
      <Route path="/dashboard" element={<Layout />}>
        <Route index element={<Dashboard />} />

        {/* Protected sub-routes */}
        <Route path="map" element={
          <ProtectedRoute>
            <Map />
          </ProtectedRoute>
        } />
        <Route path="calendar" element={
          <ProtectedRoute>
            <CalendarPage />
          </ProtectedRoute>
        } />
        <Route path="create" element={
          <ProtectedRoute>
            {({ user }) => (user.role === 'company' || user.role === 'admin') ? <CreateEvent /> : <Navigate to="/dashboard" replace />}
          </ProtectedRoute>
        } />

        {/* Public event details */}
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
