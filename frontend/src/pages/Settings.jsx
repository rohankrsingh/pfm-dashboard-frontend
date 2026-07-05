import { useState } from 'react'
import { useNavigate, useOutletContext, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import {
  User,
  Lock,
  Globe,
  ShieldAlert,
  Save,
  BuildingIcon
} from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function Settings() {
  const navigate = useNavigate()
  const { userProfile, fetchLayoutData, accounts } = useOutletContext()
  
  // Profile state
  const [name, setName] = useState(userProfile?.name || '')
  const [email, setEmail] = useState(userProfile?.email || '')
  
  // Security state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Preferences
  const [currency, setCurrency] = useState(userProfile?.currency || 'INR')
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      await api.updateProfile({ name, email })
      toast.success("Profile updated successfully")
      fetchLayoutData()
    } catch (err) {
      toast.error(err.message || 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match")
      return
    }
    try {
      setIsSaving(true)
      await api.updatePassword({ currentPassword, newPassword })
      toast.success("Password updated successfully")
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      toast.error(err.message || 'Failed to update password')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSavePreferences = async () => {
    try {
      setIsSaving(true)
      await api.updateProfile({ currency })
      toast.success("Preferences saved successfully")
      fetchLayoutData()
    } catch (err) {
      toast.error(err.message || 'Failed to save preferences')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirm = window.confirm("Are you sure you want to delete your account? This action cannot be undone.")
    if (confirm) {
      try {
        setIsSaving(true)
        await api.deleteAccount()
        toast.success("Account deleted successfully")
        api.logout()
        navigate('/')
      } catch (err) {
        toast.error(err.message || 'Failed to delete account')
        setIsSaving(false)
      }
    }
  }

  return (
    <main className="p-6 md:p-8 max-w-4xl w-full mx-auto animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        
        {/* Profile Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="size-8 rounded-full bg-muted flex items-center justify-center">
              <User className="size-4 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Profile</h2>
          </div>
          
          <Card className="rounded-[24px] border-none bg-card p-6 shadow-xs">
            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Full Name</Label>
                <Input 
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="h-12 rounded-xl border-border bg-muted focus:bg-card transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Address</Label>
                <Input 
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="h-12 rounded-xl border-border bg-muted focus:bg-card transition-colors"
                />
              </div>
              <Button type="submit" disabled={isSaving} className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl h-12 px-6 mt-2 cursor-pointer gap-2 transition-all">
                <Save className="size-4" />
                {isSaving ? 'Saving...' : 'Save Profile'}
              </Button>
            </form>
          </Card>
        </section>

        {/* Security Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="size-8 rounded-full bg-muted flex items-center justify-center">
              <Lock className="size-4 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Security</h2>
          </div>
          
          <Card className="rounded-[24px] border-none bg-card p-6 shadow-xs">
            <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="current-password" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Current Password</Label>
                <Input 
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="h-12 rounded-xl border-border bg-muted focus:bg-card transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">New Password</Label>
                <Input 
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="h-12 rounded-xl border-border bg-muted focus:bg-card transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Confirm New Password</Label>
                <Input 
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="h-12 rounded-xl border-border bg-muted focus:bg-card transition-colors"
                />
              </div>
              <Button type="submit" disabled={isSaving} className="bg-muted text-foreground hover:bg-accent font-bold rounded-xl h-12 px-6 mt-2 cursor-pointer transition-all">
                {isSaving ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </Card>
        </section>

        {/* Preferences Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="size-8 rounded-full bg-muted flex items-center justify-center">
              <Globe className="size-4 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Preferences</h2>
          </div>
          
          <Card className="rounded-[24px] border-none bg-card p-6 shadow-xs">
            <div className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Display Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="h-12 rounded-xl border-border bg-muted text-sm">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                    <SelectItem value="USD">US Dollar ($)</SelectItem>
                    <SelectItem value="EUR">Euro (€)</SelectItem>
                    <SelectItem value="GBP">British Pound (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSavePreferences} disabled={isSaving} className="bg-muted text-foreground hover:bg-accent font-bold rounded-xl h-12 px-6 mt-2 cursor-pointer transition-all">
                {isSaving ? 'Saving...' : 'Save Preferences'}
              </Button>
            </div>
          </Card>
        </section>

        {/* Connected Accounts Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="size-8 rounded-full bg-muted flex items-center justify-center">
              <BuildingIcon className="size-4 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Connected Accounts</h2>
          </div>
          
          <Card className="rounded-[24px] border-none bg-card p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-foreground">Manage Bank Accounts</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  You have {accounts.length} linked account{accounts.length === 1 ? '' : 's'}. Sync real-time transactions securely via Plaid.
                </p>
              </div>
              <Button 
                asChild
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl h-12 px-6 cursor-pointer whitespace-nowrap"
              >
                <Link to="/accounts">Manage Accounts</Link>
              </Button>
            </div>
          </Card>
        </section>

        {/* Danger Zone */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="size-8 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldAlert className="size-4 text-destructive" />
            </div>
            <h2 className="text-lg font-bold text-destructive">Danger Zone</h2>
          </div>
          
          <Card className="rounded-[24px] border border-destructive/20 bg-card p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-foreground">Delete Account</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  Permanently remove your account and all associated data. This action cannot be undone.
                </p>
              </div>
              <Button 
                onClick={handleDeleteAccount}
                disabled={isSaving}
                variant="destructive" 
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold rounded-xl h-12 px-6 cursor-pointer whitespace-nowrap"
              >
                {isSaving ? 'Deleting...' : 'Delete Account'}
              </Button>
            </div>
          </Card>
        </section>
        
      </div>
    </main>
  )
}
