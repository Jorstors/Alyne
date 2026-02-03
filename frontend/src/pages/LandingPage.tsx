import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Users, Clock, ArrowRight, Menu, X, Calendar } from 'lucide-react'
import { useState } from 'react'

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src="/alyne-logo.svg" alt="Alyne" className="h-6" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/event/new">
              <Button variant="ghost" size="sm">Quick Event</Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link to="/login">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 -mr-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl">
            <div className="px-6 py-4 space-y-3">
              <Link to="/event/new" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">Quick Event</Button>
              </Link>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">Log in</Button>
              </Link>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full">Get Started</Button>
              </Link>
            </div>
          </div>
        )}
      </nav>


      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 lg:pt-56 lg:pb-40 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-border bg-muted/50 text-sm text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Team scheduling made simple
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
            Find the perfect time,
            <br />
            <span className="text-primary">together.</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Stop the endless back-and-forth. Alyne brings your team's availability together
            in one place, making scheduling as easy as it should be.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login">
              <Button size="lg" className="gap-2 min-w-[200px]">
                Start for free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <div className="relative">
              <Link to="/event/new">
                <Button variant="outline" size="lg" className="min-w-[200px]">
                  Create quick event
                </Button>
              </Link>
              <div className="absolute top-13 left-1/2 -translate-x-1/2 hidden sm:flex items-start gap-2 pointer-events-none">
                <img
                  src="/fat-loopy-arrow.svg"
                  alt=""
                  className="w-12 opacity-80 rotate-12 -scale-x-100 "
                />
                <span className="text-foreground/90 font-medium text-3xl -rotate-6 whitespace-nowrap" style={{ fontFamily: 'Caveat, cursive' }}>Try me!</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why teams choose Alyne</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              More than just a poll. Alyne is built for teams that schedule together regularly.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="Persistent Teams"
              description="Create teams once, schedule together forever. No more sending new links for every event."
            />
            <FeatureCard
              icon={<Calendar className="h-6 w-6" />}
              title="Multiple Events"
              description="Manage all your team's events in one place. See upcoming schedules at a glance."
            />
            <FeatureCard
              icon={<Clock className="h-6 w-6" />}
              title="Smart Suggestions"
              description="Get intelligent recommendations for the best meeting times based on everyone's availability."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Simple as...</h2>
          </div>

          <div className="space-y-8">
            <Step
              number={1}
              title="Create your team"
              description="Invite your teammates by email or share a link. Everyone can join in seconds."
            />
            <Step
              number={2}
              title="Add your availability"
              description="Mark when you're free on our intuitive grid. It takes less than a minute."
            />
            <Step
              number={3}
              title="Find the best time"
              description="See overlapping availability instantly. Pick the time that works for everyone."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-primary/5">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to simplify scheduling?</h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of teams who've said goodbye to scheduling headaches.
          </p>
          <Link to="/login">
            <Button size="lg" className="gap-2">
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-border">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center">
            <img src="/alyne-logo.svg" alt="Alyne" className="h-5" />
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 Alyne. Team scheduling made easy.
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 rounded-xl border border-border bg-card hover:shadow-lg transition-shadow duration-300">
      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

function Step({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="flex gap-6 items-start">
      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
        {number}
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
