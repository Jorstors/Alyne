import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Search, Clock, CheckCircle, AlertCircle, MoreHorizontal } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export function EventsPage() {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Events</h1>
          <p className="text-muted-foreground">Manage all your team events</p>
        </div>

      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search events..." className="pl-10" />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="pending">Pending Response</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <EventCard
            title="Weekly Standup"
            team="Engineering Team"
            date="Tomorrow"
            time="10:00 AM - 10:30 AM"
            status="finalized"
            responses={6}
            total={6}
          />
          <EventCard
            title="Project Kickoff"
            team="Design Team"
            date="Feb 5, 2025"
            time="2:00 PM - 3:00 PM"
            status="finalized"
            responses={4}
            total={4}
          />
          <EventCard
            title="Sprint Planning"
            team="Engineering Team"
            date="Feb 8, 2025"
            time="9:00 AM - 10:00 AM"
            status="finalized"
            responses={6}
            total={6}
          />
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <EventCard
            title="Quarterly Review"
            team="All Hands"
            date="Feb 15, 2025"
            time="TBD"
            status="pending"
            responses={8}
            total={15}
          />
          <EventCard
            title="Team Building"
            team="Engineering Team"
            date="Feb 20, 2025"
            time="TBD"
            status="pending"
            responses={3}
            total={6}
          />
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          <EventCard
            title="Sprint Retrospective"
            team="Engineering Team"
            date="Jan 30, 2025"
            time="3:00 PM - 4:00 PM"
            status="completed"
            responses={6}
            total={6}
          />
        </TabsContent>
      </Tabs>
    </>
  )
}



type EventStatus = 'pending' | 'finalized' | 'completed'

interface EventCardProps {
  title: string
  team: string
  date: string
  time: string
  status: EventStatus
  responses: number
  total: number
}

function EventCard({ title, team, date, time, status, responses, total }: EventCardProps) {
  const statusConfig = {
    pending: { icon: AlertCircle, text: 'Awaiting responses', className: 'text-warning' },
    finalized: { icon: CheckCircle, text: 'Finalized', className: 'text-success' },
    completed: { icon: CheckCircle, text: 'Completed', className: 'text-muted-foreground' },
  }

  const StatusIcon = statusConfig[status].icon

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground mb-2">{team}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {date}
                </span>
                <span className="text-muted-foreground">{time}</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="text-right">
              <div className={`flex items-center gap-1.5 text-sm ${statusConfig[status].className}`}>
                <StatusIcon className="h-4 w-4" />
                {statusConfig[status].text}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {responses}/{total} responded
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View details</DropdownMenuItem>
                <DropdownMenuItem>Edit event</DropdownMenuItem>
                <DropdownMenuItem>Copy link</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
