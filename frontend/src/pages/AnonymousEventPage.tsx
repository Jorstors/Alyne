import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, ArrowRight } from 'lucide-react'
import { useState } from 'react'

export function AnonymousEventPage() {
  const [step, setStep] = useState<'create' | 'availability'>('create')

  if (step === 'availability') {
    return <AvailabilityStep />
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center mb-8">
          <img src="/alyne-logo.svg" alt="Alyne" className="h-8" />
        </Link>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create a quick event</CardTitle>
            <CardDescription>
              No signup required. Share the link with your group to find the best time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setStep('availability'); }}>
              <div className="space-y-2">
                <Label htmlFor="title">Event title</Label>
                <Input id="title" placeholder="e.g., Team Dinner" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Your name</Label>
                <Input id="name" placeholder="How should others see you?" />
              </div>

              <div className="space-y-2">
                <Label>Duration</Label>
                <div className="flex items-center gap-2">
                  <Input type="number" min="15" step="15" defaultValue="60" className="w-24" />
                  <span className="text-sm text-muted-foreground">minutes</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Date range</Label>
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-time" className="text-xs text-muted-foreground">Earliest</Label>
                    <Input id="start-time" type="time" defaultValue="09:00" />
                  </div>
                  <div>
                    <Label htmlFor="end-time" className="text-xs text-muted-foreground">Latest</Label>
                    <Input id="end-time" type="time" defaultValue="21:00" />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full gap-2" size="lg">
                Continue to availability
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Want more features?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}

function AvailabilityStep() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  const times = ['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center">
            <img src="/alyne-logo.svg" alt="Alyne" className="h-6" />
          </Link>
          <Button variant="outline" size="sm">
            Copy link
          </Button>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Team Dinner</CardTitle>
            <CardDescription>
              Click and drag to mark when you're available. Green = available, yellow = maybe.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Legend */}
            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-available"></div>
                <span className="text-sm">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-maybe"></div>
                <span className="text-sm">Maybe</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-muted border border-border"></div>
                <span className="text-sm">Unavailable</span>
              </div>
            </div>

            {/* Availability Grid */}
            <div className="overflow-x-auto">
              <div className="inline-grid gap-1" style={{ gridTemplateColumns: `60px repeat(${days.length}, 80px)` }}>
                {/* Header row */}
                <div></div>
                {days.map(day => (
                  <div key={day} className="text-center py-2 text-sm font-medium">
                    {day}
                    <div className="text-xs text-muted-foreground">Feb {days.indexOf(day) + 10}</div>
                  </div>
                ))}

                {/* Time rows */}
                {times.map(time => (
                  <>
                    <div key={`time-${time}`} className="text-xs text-muted-foreground text-right pr-2 py-2">
                      {time}
                    </div>
                    {days.map(day => (
                      <div
                        key={`${day}-${time}`}
                        className="h-10 rounded border border-border bg-muted/50 hover:bg-available/30 cursor-pointer transition-colors"
                      />
                    ))}
                  </>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <Button variant="outline">Clear all</Button>
              <Button>Save availability</Button>
            </div>
          </CardContent>
        </Card>

        {/* Responses */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Responses (1)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                Y
              </div>
              <span className="text-sm">You</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
