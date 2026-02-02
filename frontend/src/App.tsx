import { Routes, Route } from 'react-router-dom'
import {
  LandingPage,
  LoginPage,
  DashboardPage,
  TeamsPage,
  EventsPage,
  CreateEventPage,
  CreateTeamPage,
  AnonymousEventPage,
} from '@/pages'

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/event/new" element={<AnonymousEventPage />} />

      {/* Protected routes (will add auth wrapper later) */}
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/teams" element={<TeamsPage />} />
      <Route path="/teams/new" element={<CreateTeamPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/events/new" element={<CreateEventPage />} />
    </Routes>
  )
}

export default App
