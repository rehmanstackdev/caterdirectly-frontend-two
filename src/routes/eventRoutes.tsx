
import { Route } from 'react-router-dom';
import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import EventsList from '../pages/EventsList';
import CreateEventPage from '../pages/CreateEventPage';
import EventDetailPage from '../pages/EventDetailPage';
import EditEventPage from '../pages/EditEventPage';
import EventGuestsPage from '../pages/EventGuestsPage';

const EventRoutes = (
  <>
    {/* Protected event routes */}
    <Route path="/events" element={
      <ProtectedRoute>
        <EventsList />
      </ProtectedRoute>
    } />
    <Route path="/events/new" element={
      <ProtectedRoute>
        <CreateEventPage />
      </ProtectedRoute>
    } />
    <Route path="/events/create" element={
      <ProtectedRoute>
        <CreateEventPage />
      </ProtectedRoute>
    } />
    <Route path="/events/:id" element={
      <ProtectedRoute>
        <EventDetailPage />
      </ProtectedRoute>
    } />
    <Route path="/events/:id/edit" element={
      <ProtectedRoute>
        <EditEventPage />
      </ProtectedRoute>
    } />
    <Route path="/events/:id/guests" element={
      <ProtectedRoute>
        <EventGuestsPage />
      </ProtectedRoute>
    } />
  </>
);

export default EventRoutes;
