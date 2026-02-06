import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

import { Label } from '@/components/ui/label'
import { ArrowLeft, Calendar as CalendarIcon, Users, ChevronLeft, ChevronRight } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Calendar } from '@/components/ui/calendar'
import { useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { addDays, format, addMonths, subMonths } from 'date-fns'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

export function CreateEventPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const [eventName, setEventName] = useState('')
  const [mode, setMode] = useState<'date' | 'days'>('date')

  // Determine Back Link
  // 1. If explicit 'from' state exists, use it
  // 2. If path is '/events/new', go to Dashboard (or specific team if known, but Dashboard is safer)
  // 3. Default to Home
  const isInternal = location.pathname.startsWith('/events')
  const backLink = location.state?.from || (isInternal ? '/dashboard' : '/')
  const backLabel = location.state?.label || (isInternal ? 'Back to Dashboard' : 'Back to Home')

  // Date Mode State
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 4),
  })
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())

  // Days Mode State
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  // Time State
  const [earliestTime, setEarliestTime] = useState('09:00')
  const [latestTime, setLatestTime] = useState('17:00')

  // Determine API URL based on environment
  const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000/api' : '/api')

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!eventName.trim()) {
      alert('Please enter a title')
      return
    }

    const payload = {
      title: eventName,
      description: '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      event_type: mode === 'date' ? 'specific_dates' : 'days_of_week',
      configuration: mode === 'date'
        ? { dates: [] } // For now sending empty, will fix to send actual dates
        : { days: Array.from(selectedDays) }
    }

    // Fix dates payload
    if (mode === 'date') {
       // We need to generate the array of date strings from the range
       const dates = []
       if (dateRange?.from) {
          let curr = dateRange.from
          const end = dateRange.to || dateRange.from
          while (curr <= end) {
              dates.push(curr.toISOString())
              curr = addDays(curr, 1)
          }
       }
       payload.configuration = { dates }
    }

    try {
        const res = await fetch(`${API_URL}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })

        if (!res.ok) {
            const err = await res.json()
            throw new Error(err.error || 'Failed to create event')
        }

        const data = await res.json()
        navigate(`/event/${data.id}`)

    } catch (error: any) {
        console.error('Create error:', error)
        alert('Failed to create event: ' + error.message)
    }
  }

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  const handleDateSelect = (
    range: DateRange | undefined,
    selectedDay: Date,
  ) => {
     if (!selectedDay) {
        setDateRange(range)
        return
     }

     const { from, to } = dateRange || {}
     const isSameDay = (d1: Date, d2: Date) => d1.toDateString() === d2.toDateString()

     // 1. Endpoint Toggle Logic (Top Priority)
     if (from && isSameDay(selectedDay, from)) {
        setDateRange(to ? { from: to, to: undefined } : undefined)
        return
     }
     if (to && isSameDay(selectedDay, to)) {
        setDateRange({ from, to: undefined })
        return
     }

     // 2. Smart Shrink (Click Inside)
     // Only trigger if we have a full range AND RDP thinks it's a reset/single-click (range.to is missing or single day)
     // This preserves Drag functionality (where range would be a new valid range)
     if (from && to && selectedDay > from && selectedDay < to) {
        // If RDP output implies a reset (single day selection), we override with Shrink.
        // If RDP output is a full range (drag), we likely want to trust RDP.
        const isRDPReset = !range?.to || isSameDay(range.from!, range.to!)

        if (isRDPReset) {
             const distFrom = Math.abs(selectedDay.getTime() - from.getTime())
             const distTo = Math.abs(selectedDay.getTime() - to.getTime())
             if (distFrom <= distTo) {
                  setDateRange({ from: selectedDay, to })
             } else {
                  setDateRange({ from, to: selectedDay })
             }
             return
        }
     }

     // 3. Fallback to RDP Behavior (Jumps, Drags, Extensions)
     setDateRange(range)
  }

  // Generate time options
  const timeOptions = []
  for (let i = 0; i < 24; i++) {
    const hour = i % 12 || 12
    const ampm = i < 12 ? 'AM' : 'PM'

    // Hour:00
    timeOptions.push({
        value: `${i.toString().padStart(2, '0')}:00`,
        label: `${hour}:00 ${ampm}`
    })

    // Hour:30
    timeOptions.push({
        value: `${i.toString().padStart(2, '0')}:30`,
        label: `${hour}:30 ${ampm}`
    })
  }

  const [isAuthenticated] = useState(false) // Default to anonymous for "Quick Event"





  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Only show if authenticated */}
      {isAuthenticated && (
      <aside className="fixed left-0 top-0 bottom-0 w-64 border-r border-border bg-card p-4 flex flex-col hidden md:flex">
        <Link to="/" className="flex items-center mb-8">
          <img src="/alyne-logo.svg" alt="Alyne" className="h-6" />
        </Link>
        <nav className="space-y-1 flex-1">
          <NavItem href="/dashboard" icon={<CalendarIcon className="h-4 w-4" />} label="Dashboard" />
          <NavItem href="/teams" icon={<Users className="h-4 w-4" />} label="Teams" />
          <NavItem href="/events" icon={<CalendarIcon className="h-4 w-4" />} label="Events" active />
        </nav>
        <div className="pt-4 border-t border-border">
          <div className="flex items-center gap-3">
             <Avatar className="h-8 w-8">
               <AvatarFallback>JD</AvatarFallback>
             </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Justus</p>
              <p className="text-xs text-muted-foreground truncate">justus@example.com</p>
            </div>
          </div>
        </div>
      </aside>
      )}

      {/* Main Content */}
      <main className={cn("p-4 md:p-8 transition-all duration-300", isAuthenticated ? "md:ml-64" : "mx-auto")}>
         <div className="max-w-5xl mx-auto relative">
          {/* Header Actions */}
           <div className="flex justify-between items-center mb-8">
              <Link to={backLink} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                {backLabel}
              </Link>


           </div>

          <form onSubmit={handleCreate} className="space-y-8">
            {/* Header / Event Name */}
            <div className="flex flex-col gap-4 items-center justify-center text-center">
              <Input
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="New Event Name"
                className="text-3xl md:text-4xl font-bold text-center border-none shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/30 h-auto py-2 px-4 max-w-full bg-transparent break-words whitespace-normal"
                required
              />

              {/* Team Context Message */}
              {searchParams.get('teamId') && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                   <Users className="h-4 w-4" />
                   Creating for Engineering Team
                </div>
              )}


            </div>

            {/* Columns Container */}
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">

              {/* Left Column: Dates/Days */}
              <div className="flex flex-col gap-4 w-full h-full">
                <div className="text-center md:text-left">
                  <h3 className="text-lg font-medium">When is it happening?</h3>
                </div>

                <Card className="p-4 border shadow-sm flex flex-col items-center flex-1 min-h-[350px]">
                  {/* Toggle Inside Card for Alignment */}
                   <div className="flex bg-muted p-1 rounded-lg w-full max-w-xs mb-6">
                    <button
                        type="button"
                        className={cn("flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all", mode === 'date' ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground")}
                        onClick={() => setMode('date')}
                    >
                        Specific Dates
                    </button>
                    <button
                        type="button"
                        className={cn("flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all", mode === 'days' ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground")}
                        onClick={() => setMode('days')}
                    >
                        Days of Week
                    </button>
                  </div>

                  {mode === 'date' ? (
                      <div className="flex flex-col items-center">
                          {/* Custom Static Navigation */}
                          <div className="flex items-center justify-between w-full max-w-[260px] mb-2 px-1">
                              <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
                              >
                                  <ChevronLeft className="h-4 w-4" />
                              </Button>
                              <span className="text-sm font-medium">
                                  {format(currentMonth, 'MMMM yyyy')}
                              </span>
                              <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
                              >
                                  <ChevronRight className="h-4 w-4" />
                              </Button>
                          </div>

                          <Calendar
                            mode="range"
                            selected={dateRange}
                            onSelect={handleDateSelect}
                            month={currentMonth}
                            onMonthChange={setCurrentMonth}
                            className="rounded-md border-none"
                            numberOfMonths={1}
                            classNames={{
                                caption: 'hidden', // Hide default header (month year)
                                nav: 'hidden'      // Hide default navigation arrows
                            }}
                          />
                      </div>
                  ) : (
                      <div className="flex flex-col gap-3 w-full max-w-[200px]">
                          {daysOfWeek.map(day => (
                              <div key={day} className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded-md transition-colors">
                                  <Checkbox
                                    id={day}
                                    checked={selectedDays.includes(day)}
                                    onCheckedChange={() => toggleDay(day)}
                                  />
                                  <label
                                    htmlFor={day}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                                  >
                                    {day}
                                  </label>
                              </div>
                          ))}
                      </div>
                  )}
                </Card>

                {/* Footer Text */}
                <div className="min-h-[20px]">
                    {mode === 'date' && dateRange?.from && (
                    <p className="text-sm text-muted-foreground text-center md:text-left">
                        Selected: {format(dateRange.from, 'PPP')}
                        {dateRange.to && ` - ${format(dateRange.to, 'PPP')}`}
                    </p>
                    )}
                    {mode === 'days' && (
                         <p className="text-sm text-muted-foreground text-center md:text-left">
                            Selected: {selectedDays.length} days
                        </p>
                    )}
                </div>
              </div>

              {/* Right Column: Times */}
              <div className="flex flex-col gap-4 w-full h-full">
                 <div className="text-center md:text-left">
                  <h3 className="text-lg font-medium">What times might work?</h3>
                </div>

                <Card className="p-6 border shadow-sm space-y-6 flex flex-col justify-center flex-1 min-h-[350px]">
                  <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                    <Label htmlFor="earliest" className="text-right text-muted-foreground">No earlier than:</Label>
                    <Select
                      value={earliestTime}
                      onValueChange={setEarliestTime}
                    >
                      <SelectTrigger id="earliest">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((t) => (
                          <SelectItem key={`start-${t.value}`} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                    <Label htmlFor="latest" className="text-right text-muted-foreground">No later than:</Label>
                    <Select
                      value={latestTime}
                      onValueChange={setLatestTime}
                    >
                      <SelectTrigger id="latest">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((t) => (
                          <SelectItem key={`end-${t.value}`} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                      <Label className="text-right text-muted-foreground">Time Zone:</Label>
                      <div className="text-sm font-medium">
                        {Intl.DateTimeFormat().resolvedOptions().timeZone}
                      </div>
                      </div>
                    </div>
                </Card>

                {/* Empty Footer for Balance */}
                <div className="min-h-[20px]"></div>
              </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="flex justify-end max-w-4xl mx-auto pt-4 border-t">
                <div className="flex items-center gap-4">
                <span className="text-muted-foreground font-medium">Ready?</span>
                <Button
                    type="submit"
                    size="lg"
                    disabled={
                        !eventName ||
                        (mode === 'date' && !dateRange?.from) ||
                        (mode === 'days' && selectedDays.length === 0)
                    }>
                    Create Event
                </Button>
                </div>
            </div>
          </form>
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
      <span>{label}</span>
    </Link>
  )
}
