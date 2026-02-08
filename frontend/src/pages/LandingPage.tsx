import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Users, Clock, ArrowRight, Menu, X, Calendar } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { GridPreview } from '@/components/GridPreview'

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-[#fafaf9] relative overflow-x-hidden selection:bg-slate-200 selection:text-slate-900">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Kalam:wght@300;400;700&display=swap');

        .font-hand { font-family: 'Caveat', cursive; }
        .font-sketch { font-family: 'Kalam', cursive; }

        .bg-paper-texture {
          background-color: #fafaf9;
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E");
        }

        .border-sketch {
            border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
            border: 2px solid #1e293b;
        }

        .border-sketch-sm {
            border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
            border: 1.5px solid #1e293b;
        }
      `}</style>

      {/* Texture Overlay */}
      <div className="fixed inset-0 bg-paper-texture pointer-events-none z-0 mix-blend-multiply opacity-60" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b-2 border-slate-900/5 bg-[#fafaf9]/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src="/alyne-logo.svg" alt="Alyne" className="h-6" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/create">
              <Button variant="ghost" size="sm">Quick Event</Button>
            </Link>
            {user ? (
                <Link to="/dashboard">
                  <Button size="sm">Go to Dashboard</Button>
                </Link>
            ) : (
                <>
                    <Link to="/login">
                    <Button variant="ghost" size="sm">Log in</Button>
                    </Link>
                    <Link to="/login">
                    <Button size="sm">Get Started</Button>
                    </Link>
                </>
            )}
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
              <Link to="/create" onClick={() => setMobileMenuOpen(false)}>
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
      <section className="pt-32 pb-20 md:pb-32 lg:pt-40 lg:pb-40 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border-2 border-slate-900/10 bg-white text-sm font-semibold text-slate-600 shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-800"></span>
            </span>
            <span className="tracking-wide">Team scheduling made simple</span>
          </div>

          <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 text-slate-900 leading-[0.9]">
            Find the perfect time,
            <br />
            <span className="relative inline-block mt-2">
                <span className="relative z-10 font-hand text-7xl md:text-8xl lg:text-9xl text-slate-800 -rotate-2 inline-block">together.</span>
                <span className="absolute -bottom-2 left-0 right-0 h-4 bg-yellow-300/60 -rotate-1 rounded-sm -z-0 blur-[1px]"></span>
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
            Stop the endless back-and-forth. Alyne brings your team's availability together
            in one place, making scheduling as easy as it should be.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login">
              <Button size="lg" className="gap-2 min-w-[200px] h-14 text-lg border-sketch bg-slate-900 text-white hover:bg-slate-800 hover:scale-[1.02] transition-all shadow-xl shadow-slate-900/10 active:scale-95">
                Start for free
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <div className="relative">
              <Link to="/create">
                <Button variant="outline" size="lg" className="min-w-[200px] h-14 text-lg border-sketch bg-white text-slate-900 hover:bg-slate-50 hover:scale-[1.02] transition-all shadow-md active:scale-95">
                  Create quick event
                </Button>
              </Link>
              <div className="absolute top-17 left-[40%] -translate-x-1/2 hidden sm:flex items-start gap-2 pointer-events-none opacity-70 scale-80">
                <img
                  src="/fat-loopy-arrow.svg"
                  alt=""
                  className="w-12 opacity-80 rotate-12 -scale-x-100 "
                />
                <span className="text-slate-800 font-bold text-4xl -rotate-6 whitespace-nowrap font-hand">Try me!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Preview */}
        <div className="mt-20 md:mt-32 relative mx-auto max-w-7xl px-6">
            <div className="relative z-20 py-20 pb-10">
                <GridPreview />
            </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 relative z-10">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-slate-900 tracking-tight">Why teams choose Alyne</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium">
              More than just a poll. Alyne is built for teams that schedule together regularly.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Users className="h-7 w-7" />}
              title="Persistent Teams"
              description="Create teams once, schedule together forever. No more sending new links for every event."
              rotation="-rotate-1"
            />
            <FeatureCard
              icon={<Calendar className="h-7 w-7" />}
              title="Multiple Events"
              description="Manage all your team's events in one place. See upcoming schedules at a glance."
              rotation="rotate-2"
            />
            <FeatureCard
              icon={<Clock className="h-7 w-7" />}
              title="Smart Suggestions"
              description="Get intelligent recommendations for the best meeting times based on everyone's availability."
              rotation="-rotate-1"
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
          <Link to="/" className="flex items-center opacity-80 hover:opacity-100 transition-opacity">
            <img src="/alyne-logo.svg" alt="Alyne" className="h-5" />
          </Link>
          <p className="text-sm text-muted-foreground">
            © 2025 Alyne. Team scheduling made easy.
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description, rotation = "rotate-0" }: { icon: React.ReactNode; title: string; description: string, rotation?: string }) {
  return (
    <div className={`p-8 bg-white border-sketch shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group ${rotation}`}>
      <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-800 mb-6 group-hover:scale-110 transition-transform border-2 border-slate-900/10">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-slate-900">{title}</h3>
      <p className="text-slate-600 leading-relaxed font-medium">{description}</p>
    </div>
  )
}

function Step({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="flex gap-6 items-start group">
      <div className="flex-shrink-0 h-12 w-12 rounded-full border-2 border-slate-900 bg-white flex items-center justify-center text-slate-900 font-bold text-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none transition-all">
        {number}
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
