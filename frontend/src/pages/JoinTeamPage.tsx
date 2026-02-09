
import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useAuth } from '@/components/AuthProvider'
import { Loader2, Users, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export function JoinTeamPage() {
  const { teamId } = useParams()
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Joining team...')

  useEffect(() => {
    // 1. Wait for auth to initialize
    if (authLoading) return

    // 2. If not authenticated, redirect to login
    if (!user) {
      navigate('/login', { state: { from: location.pathname } })
      return
    }

    // 3. Attempt to join
    async function joinTeam() {
      try {
        if (!teamId) throw new Error('Invalid invite link')

        const res = await fetch(`${API_URL}/teams/${teamId}/join`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ user_id: user?.id })
        })

        if (!res.ok) {
           const data = await res.json()
           throw new Error(data.error || 'Failed to join team')
        }

        const data = await res.json()
        setStatus('success')
        setMessage(data.message || 'Successfully joined team!')

        // Short delay then redirect
        setTimeout(() => {
            navigate(`/teams/${teamId}`)
        }, 1500)

      } catch (err: any) {
        console.error(err)
        setStatus('error')
        setMessage(err.message)
      }
    }

    joinTeam()
  }, [user, authLoading, teamId, navigate, location.pathname])

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                {status === 'error' ? <AlertCircle className="h-6 w-6" /> : <Users className="h-6 w-6" />}
            </div>
            <CardTitle>Team Invitation</CardTitle>
            <CardDescription>
                {status === 'loading' && 'Verifying invitation...'}
                {status === 'success' && 'Welcome to the team!'}
                {status === 'error' && 'Unable to process invitation'}
            </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
             {status === 'loading' && (
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">{message}</p>
                </div>
             )}

             {status === 'success' && (
                 <div className="text-center space-y-2">
                     <p className="text-green-600 font-medium">{message}</p>
                     <p className="text-xs text-muted-foreground">Redirecting to team dashboard...</p>
                 </div>
             )}

             {status === 'error' && (
                 <div className="text-center space-y-4 w-full">
                     <p className="text-destructive font-medium">{message}</p>
                     <Button className="w-full" onClick={() => navigate('/dashboard')}>
                         Go to Dashboard
                     </Button>
                 </div>
             )}
        </CardContent>
      </Card>
    </div>
  )
}
