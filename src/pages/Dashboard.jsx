import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-black text-foreground tracking-tight">Dashboard</h1>
      <p className="text-muted-foreground">Coming soon — your financial overview will live here.</p>
      <Link to="/">
        <Button variant="secondary">← Back to Home</Button>
      </Link>
    </div>
  )
}
