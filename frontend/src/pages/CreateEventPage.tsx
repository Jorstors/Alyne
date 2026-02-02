import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, ArrowLeft, Users, Clock } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function CreateEventPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 border-r border-border bg-card p-4 flex flex-col">
        <Link to="/" className="flex items-center mb-8">
          <img src="/alyne-logo.svg" alt="Alyne" className="h-6" />
        </Link>

        <nav className="space-y-1 flex-1">
          <NavItem href="/dashboard" icon={<Calendar className="h-4 w-4" />} label="Dashboard" />
          <NavItem href="/teams" icon={<Users className="h-4 w-4" />} label="Teams" />
          <NavItem href="/events" icon={<Calendar className="h-4 w-4" />} label="Events" active />
        </nav>

        <div className="pt-4 border-t border-border">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">John Doe</p>
              <p className="text-xs text-muted-foreground truncate">john@example.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <div className="max-w-2xl">
          {/* Back Button */}
          <Link to="/events" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Link>

          <Card>
            <CardHeader>
              <CardTitle>Create a new event</CardTitle>
              <CardDescription>
                Schedule an event with your team. They'll be asked to mark their availability.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Event title</Label>
                  <Input id="title" placeholder="e.g., Weekly Standup" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Input id="description" placeholder="What is this event about?" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="team">Team</Label>
                  <select
                    id="team"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="">Select a team</option>
                    <option value="1">Engineering Team</option>
                    <option value="2">Design Team</option>
                    <option value="3">Marketing</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Duration</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" min="15" step="15" defaultValue="30" className="w-24" />
                    <span className="text-sm text-muted-foreground">minutes</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Date range</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Select the dates you'd like to consider for this event.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start-date" className="text-xs text-muted-foreground">Start</Label>
                      <Input id="start-date" type="date" />
                    </div>
                    <div>
                      <Label htmlFor="end-date" className="text-xs text-muted-foreground">End</Label>
                      <Input id="end-date" type="date" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Time range</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    What times of day should be considered?
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start-time" className="text-xs text-muted-foreground">Earliest</Label>
                      <Input id="start-time" type="time" defaultValue="09:00" />
                    </div>
                    <div>
                      <Label htmlFor="end-time" className="text-xs text-muted-foreground">Latest</Label>
                      <Input id="end-time" type="time" defaultValue="17:00" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">Create Event</Button>
                  <Link to="/events">
                    <Button type="button" variant="outline">Cancel</Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

function NavItem({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link
      to={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
    >
      {icon}
      {label}
    </Link>
  )
}
