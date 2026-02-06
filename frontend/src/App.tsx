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

import { AuthenticatedLayout } from '@/components/AuthenticatedLayout'

function App() {
  return (
    <ScrollArea className="h-screen w-screen">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/create" element={<CreateEventPage />} />
        <Route path="/event/:id" element={<EventPage />} />

        {/* Authenticated Routes with Layout */}
        <Route element={<AuthenticatedLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/teams/:id" element={<TeamDetailsPage />} />
            <Route path="/teams/new" element={<CreateTeamPage />} />
            <Route path="/events" element={<EventsPage />} />
             {/* Redirect /events/new - For now keeping separate or do we want it in layout?
                 CreateEventPage handles its own auth check/sidebar.
                 User wants it mobile friendly.
                 If we wrap it here, it gets DOUBLE sidebar if authenticated.
                 Let's keep it separate as it has special "Anonymous" mode logic.
            */}
        </Route>

        <Route path="/events/new" element={<CreateEventPage />} />
      </Routes>
    </ScrollArea>
  )
}

export default App
