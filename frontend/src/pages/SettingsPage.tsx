import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { Sidebar } from '@/components/Sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export function SettingsPage() {
    const { user } = useAuth()
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')

    useEffect(() => {
        if (user?.user_metadata?.name) {
            setName(user.user_metadata.name)
        }
    }, [user])

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setSuccessMessage('')
        try {
            const { error } = await supabase.auth.updateUser({
                data: { name }
            })
            if (error) throw error
            setSuccessMessage('Profile updated successfully')

            // Force refresh of auth state if needed, or just let the session update propagate
            // The useAuth hook typically listens to onAuthStateChange, so it should update automatically.
        } catch (error) {
            console.error('Error updating profile:', error)
            alert('Failed to update profile')
        } finally {
            setLoading(false)
        }
    }

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        window.location.href = '/login'
    }

    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row">
            <Sidebar showNav={true} />
            <main className="flex-1 md:ml-72 p-4 md:p-10 pt-20 md:pt-10 max-w-4xl mx-auto min-w-0 w-full">
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                        <p className="text-muted-foreground mt-2">Manage your account settings and preferences.</p>
                    </div>

                    <div className="grid gap-8">
                        {/* Profile Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile</CardTitle>
                                <CardDescription>Update your personal information.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage src={user?.user_metadata?.avatar_url} />
                                        <AvatarFallback className="text-lg">{name?.[0] || user?.email?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{user?.email}</p>
                                        <p className="text-xs text-muted-foreground">User ID: {user?.id}</p>
                                    </div>
                                </div>

                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="display-name">Display Name</Label>
                                        <Input
                                            id="display-name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Your Name"
                                        />
                                    </div>

                                    {successMessage && (
                                        <p className="text-sm text-green-600 font-medium">{successMessage}</p>
                                    )}

                                    <Button type="submit" disabled={loading}>
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save Changes
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Account Actions */}
                         <Card className="border-destructive/20">
                            <CardHeader>
                                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                                <CardDescription>Irreversible account actions.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Sign Out</p>
                                        <p className="text-sm text-muted-foreground">Sign out of your account on this device.</p>
                                    </div>
                                    <Button variant="outline" onClick={handleSignOut}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Sign Out
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}
