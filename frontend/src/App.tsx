import { Routes, Route } from 'react-router-dom'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  LandingPage,
  LoginPage,
  DashboardPage,
  TeamsPage,
  EventsPage,
  CreateEventPage,
  CreateTeamPage,
  TeamDetailsPage,
  EventPage,
} from '@/pages'

function App() {
  return (
    <ScrollArea className="h-screen w-screen">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/create" element={<CreateEventPage />} />
        <Route path="/event/:id" element={<EventPage />} />

        {/* Legacy / Auth routes */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/teams/:id" element={<TeamDetailsPage />} />
        <Route path="/teams/new" element={<CreateTeamPage />} />
        <Route path="/events" element={<EventsPage />} />
        {/* Redirect /events/new to /create or keep as authenticated create? For parity we use the new one */}
        <Route path="/events/new" element={<CreateEventPage />} />
      </Routes>
    </ScrollArea>
  )
}

export default App
