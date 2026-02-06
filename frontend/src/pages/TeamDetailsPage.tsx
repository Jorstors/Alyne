import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Users, Plus, Search, ArrowLeft, MoreHorizontal, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export function TeamDetailsPage() {
  const { id } = useParams()
  // Mock team data based on ID
  const teamName = id === 'engineering' ? 'Engineering Team' : 'Marketing Team'
  const memberCount = id === 'engineering' ? 6 : 4

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <Link to="/teams" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
           <ArrowLeft className="h-4 w-4" />
           Back to Teams
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <Users className="h-8 w-8" />
                </div>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">{teamName}</h1>
                    <p className="text-muted-foreground">{memberCount} members • Public Team</p>
                </div>
            </div>
            <div className="flex gap-2">
                 <Button variant="outline">Manage Members</Button>
                 <Link to={`/create?teamId=${id || 'engineering'}`}>
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">Create Team Event</span>
                        <span className="sm:hidden">New Event</span>
                    </Button>
                 </Link>
            </div>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-6">
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">Team Events</h2>
            <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search events..." className="pl-10" />
            </div>
         </div>

         <div className="grid gap-4">
            <EventCard
              id="123"
              title="Weekly Sync"
              date="Tomorrow, 10:00 AM"
              status="finalized"
              responses={memberCount}
              total={memberCount}
            />
            <EventCard
              id="456"
              title="Project Kickoff"
              date="Feb 20, 2025"
              status="pending"
              responses={2}
              total={memberCount}
            />
         </div>
      </div>
    </>
  )
}

function EventCard({ id, title, date, status, responses, total }: { id: string; title: string; date: string; status: 'pending' | 'finalized'; responses: number; total: number }) {
  const isFinal = status === 'finalized'
  return (
    <Link to={`/event/${id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isFinal ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                {isFinal ? <CheckCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
             </div>
             <div>
                <h3 className="font-medium text-lg">{title}</h3>
                <p className="text-sm text-muted-foreground">{date}</p>
             </div>
          </div>
          <div className="flex items-center gap-6">
              <div className="text-right">
                  <div className="text-sm font-medium">{responses}/{total} responded</div>
                  <div className="text-xs text-muted-foreground capitalize">{status}</div>
              </div>
               <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
               </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
