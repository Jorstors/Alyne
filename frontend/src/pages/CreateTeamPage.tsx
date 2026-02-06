import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export function CreateTeamPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    try {
        setLoading(true)
        const res = await fetch(`${API_URL}/teams`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                user_id: user?.id
            })
        })

        if (!res.ok) throw new Error('Failed to create team')

        // Redirect to teams list
        navigate('/teams')

    } catch (err) {
        console.error(err)
        alert('Failed to create team')
    } finally {
        setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back Button */}
      <Link to="/teams" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Teams
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Create a new team</CardTitle>
          <CardDescription>
            Teams let you schedule recurring events with the same group of people.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleCreate}>
            <div className="space-y-2">
              <Label htmlFor="name">Team name</Label>
              <Input
                id="name"
                placeholder="e.g., Engineering Team"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Team
              </Button>
              <Link to="/teams">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


