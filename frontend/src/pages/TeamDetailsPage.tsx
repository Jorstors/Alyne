import { Link, useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Users, Plus, Search, ArrowLeft, MoreHorizontal, CheckCircle, Clock, Loader2, Copy, Shield, User, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/components/AuthProvider'
import { useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export function TeamDetailsPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [team, setTeam] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [membersOpen, setMembersOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    async function fetchTeamDetails() {
      try {
        setLoading(true)
        const res = await fetch(`${API_URL}/teams/${id}`)
        if (!res.ok) {
            if (res.status === 404) throw new Error('Team not found')
            throw new Error('Failed to fetch team')
        }
        const data = await res.json()
        setTeam(data)

        if (data.events) {
            setEvents(data.events)
        }

      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchTeamDetails()
  }, [id])

  const handleDeleteTeam = async () => {
    if (!id || !user?.id) return
    try {
      setDeleteLoading(true)
      const res = await fetch(`${API_URL}/teams/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete team')
      }
      navigate('/teams')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
  if (error) return <div className="flex h-screen items-center justify-center text-destructive">{error}</div>
  if (!team) return <div className="flex h-screen items-center justify-center">Team not found</div>

  const memberCount = team.members?.length || 0
  const members = team.members || []
  const isAdmin = members.some((m: any) => m.user_id === user?.id && m.role === 'admin')

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
                    <h1 className="text-2xl md:text-3xl font-bold">{team.name}</h1>
                    <p className="text-muted-foreground">{memberCount} members • Public Team</p>
                </div>
            </div>
            <div className="flex gap-2">
                 <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="gap-2">
                            <Users className="h-4 w-4" />
                            Invite Member
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Invite to {team.name}</DialogTitle>
                            <DialogDescription>Share this link to add members to your team.</DialogDescription>
                        </DialogHeader>
                        <div className="flex items-center gap-2 mt-2">
                            <Input value={`${window.location.origin}/join/${id}`} readOnly />
                            <Button
                                size="icon"
                                variant="outline"
                                onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}/join/${id}`)
                                }}
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </DialogContent>
                 </Dialog>
                 <Link to={`/create?teamId=${id}`}>
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">Create Team Event</span>
                        <span className="sm:hidden">New Event</span>
                    </Button>
                 </Link>
                 {isAdmin && (
                    <Button variant="outline" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setIsDeleteOpen(true)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                 )}
            </div>
        </div>
      </div>

      {/* Team Members — Collapsible */}
      <div className="mb-8">
        <button
          onClick={() => setMembersOpen(!membersOpen)}
          className="w-full flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-primary" />
            <span className="font-semibold text-base">Team Members</span>
            <span className="text-xs bg-muted px-2 py-0.5 rounded-full font-medium text-muted-foreground">{memberCount}</span>
          </div>
          {membersOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>

        {membersOpen && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 animate-in slide-in-from-top-2 duration-200">
            {members.map((member: any) => {
              const isMe = member.user_id === user?.id || member.id === user?.id
              const rawName = isMe ? (user?.user_metadata?.name || member.name) : member.name
              const memberName = (rawName && rawName !== 'User') ? rawName : (member.email?.split('@')[0] || 'Unknown')
              const avatarUrl = isMe ? (user?.user_metadata?.avatar_url || member.avatar_url) : member.avatar_url

              const memberIsAdmin = member.role === 'admin'
              let joinDate = ''
              try {
                joinDate = member.joined_at ? format(parseISO(member.joined_at), 'MMM d, yyyy') : ''
              } catch {}

              return (
                <Card key={member.user_id || member.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Avatar className={`h-10 w-10 border-2 ${memberIsAdmin ? 'border-primary' : 'border-border'}`}>
                      {avatarUrl && <AvatarImage src={avatarUrl} alt={memberName} />}
                      <AvatarFallback className={`text-sm font-bold ${memberIsAdmin ? 'bg-primary/10 text-primary' : ''}`}>
                        {memberName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{memberName}</span>
                        {memberIsAdmin && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary flex-shrink-0">
                            <Shield className="h-3 w-3" />
                            Admin
                          </span>
                        )}
                      </div>
                      {member.email && (
                        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                      )}
                      {joinDate && (
                        <p className="text-xs text-muted-foreground">Joined {joinDate}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {members.length === 0 && (
              <div className="col-span-full text-center py-8 border-2 border-dashed rounded-lg bg-muted/20">
                <User className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No members found</p>
              </div>
            )}
          </div>
        )}
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
            {events.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
                    <p className="text-muted-foreground">No events scheduled for this team yet.</p>
                </div>
            ) : (
                events.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      memberCount={memberCount}
                    />
                ))
            )}
         </div>
      </div>

      {/* Delete Team Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete "{team.name}"?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the team, remove all members, and unlink all associated events.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)} disabled={deleteLoading}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteTeam} disabled={deleteLoading}>
              {deleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function EventCard({ event, memberCount }: { event: any; memberCount: number }) {
  const isFinal = event.status === 'scheduled'
  let displayDate = 'Date not set'

  try {
      if (isFinal && event.configuration?.finalized_slot) {
          displayDate = 'Scheduled'
      } else {
          if (event.created_at) {
               displayDate = `Created ${format(parseISO(event.created_at), 'MMM d')}`
          }
      }

      if (event.configuration) {
          if (event.event_type === 'specific_dates' && event.configuration.dates?.length > 0) {
              const dates = event.configuration.dates.sort()
              const start = parseISO(dates[0])
              displayDate = format(start, 'MMM d')
              if (dates.length > 1) displayDate += ` - ${format(parseISO(dates[dates.length-1]), 'MMM d')}`
          } else if (event.event_type === 'days_of_week') {
              displayDate = 'Weekly: ' + (event.configuration.days || []).join(', ')
          }
      }
  } catch(e) {}

  return (
    <Link to={`/event/${event.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isFinal ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                {isFinal ? <CheckCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
             </div>
             <div>
                <h3 className="font-medium text-lg">{event.title || event.name}</h3>
                <p className="text-sm text-muted-foreground">{displayDate}</p>
             </div>
          </div>
          <div className="flex items-center gap-6">
              <div className="text-right">
                  <div className="text-sm font-medium">0/{memberCount} responded</div>
                  <div className="text-xs text-muted-foreground capitalize">{isFinal ? 'Finalized' : 'Voting'}</div>
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
