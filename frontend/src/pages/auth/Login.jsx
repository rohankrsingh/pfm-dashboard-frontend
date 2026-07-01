import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from '@/components/ui/input'
import { ArrowRight, EnvelopeSimple, LockSimple } from '@phosphor-icons/react'
import { api } from '@/lib/api'

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

export default function Login() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    setError('')
    try {
      await api.login(data.email, data.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col md:flex-row font-sans selection:bg-primary selection:text-foreground">
      
      {/* Left side: Auth form */}
      <div className="w-full md:w-[45%] min-h-[100dvh] md:min-h-0 flex flex-col justify-between p-6 md:p-12 lg:p-16 bg-background">
        {/* Top bar with Logo */}
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="h-9 w-9 bg-primary rounded-xl flex items-center justify-center font-black text-foreground ring-1 ring-wise-ink/5 transition-transform group-hover:scale-105 active:scale-95">
              P
            </div>
            <span className="text-xl font-black tracking-tight text-foreground">PFM</span>
          </Link>
          <Link to="/signup" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 group">
            Create account
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Center Auth Form */}
        <div className="my-auto max-w-sm w-full mx-auto py-12 md:py-0">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground leading-tight">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Sign in to manage your balances, track savings targets, and review automated insights.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="p-3.5 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold rounded-xl leading-relaxed">
                {error}
              </div>
            )}
            <FieldGroup>
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="email" className="text-sm font-semibold text-foreground">
                  Email address
                </FieldLabel>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <EnvelopeSimple size={18} />
                  </span>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    aria-invalid={!!errors.email}
                    className={`pl-11 bg-background border-border focus:border-primary focus:ring-4 focus:ring-primary/20 rounded-xl transition-all placeholder:text-muted-foreground text-sm py-5 ${errors.email ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : ''}`}
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <FieldDescription className="text-xs font-semibold text-destructive mt-0">
                    {errors.email.message}
                  </FieldDescription>
                )}
              </Field>

              <Field data-invalid={!!errors.password}>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password" className="text-sm font-semibold text-foreground mb-0">
                    Password
                  </FieldLabel>
                  <Link to="#" className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <LockSimple size={18} />
                  </span>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    aria-invalid={!!errors.password}
                    className={`pl-11 bg-background border-border focus:border-primary focus:ring-4 focus:ring-primary/20 rounded-xl transition-all placeholder:text-muted-foreground text-sm py-5 ${errors.password ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : ''}`}
                    {...register("password")}
                  />
                </div>
                {errors.password && (
                  <FieldDescription className="text-xs font-semibold text-destructive mt-0">
                    {errors.password.message}
                  </FieldDescription>
                )}
              </Field>
            </FieldGroup>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-hover text-foreground font-semibold text-sm py-6 rounded-xl transition-all active:scale-[0.98] active:translate-y-px shadow-sm flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <span className="h-4 w-4 border-2 border-border border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight size={16} />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Right side: Branding & visual panel */}
      <div className="hidden md:flex md:w-[55%] bg-[#0e0f0c] p-12 lg:p-16 flex-col justify-between relative overflow-hidden border-l border-white/5">
        
        {/* Subtle ambient glows for visual depth */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-[#9fe870]/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-[#9fe870]/5 blur-[120px] pointer-events-none" />

        {/* Dynamic header display */}
        <div className="max-w-md mt-6 relative z-10 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.1]">
            Simple, transparent finance tracking.
          </h2>
          <p className="text-muted-foreground leading-relaxed text-sm max-w-sm">
            Monitor cash flow, set visual savings targets, and categorize your spending in real time.
          </p>
        </div>

        {/* Dashboard Mockup (Native HTML/CSS SaaS Layout) */}
        <div className="mt-8 mb-auto relative z-10 w-[125%] max-w-none select-none pointer-events-none translate-x-12 translate-y-12 shadow-[0_24px_50px_rgba(0,0,0,0.6)] rounded-2xl border border-white/10 bg-muted flex overflow-hidden aspect-[16/10]">
          {/* Mini Sidebar */}
          <div className="w-[22%] bg-background border-r border-border/50 p-4 flex flex-col justify-between text-[10px] font-semibold text-muted-foreground">
            <div className="space-y-6">
              <div className="flex items-center gap-2 px-1">
                <div className="h-5.5 w-5.5 bg-[#9fe870] rounded-lg flex items-center justify-center font-black text-[10px] text-foreground ring-1 ring-wise-ink/5">
                  P
                </div>
                <span className="text-[11px] font-black text-foreground tracking-tight">PFM</span>
              </div>
              <nav className="space-y-0.5">
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted text-foreground font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9fe870]" />
                  Dashboard
                </div>
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted hover:text-foreground transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-transparent" />
                  Accounts
                </div>
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted hover:text-foreground transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-transparent" />
                  Payments
                </div>
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted hover:text-foreground transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-transparent" />
                  Analytics
                </div>
              </nav>
            </div>
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted hover:text-foreground transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-transparent" />
              Settings
            </div>
          </div>

          {/* Main Area */}
          <div className="flex-1 p-5 flex flex-col gap-3.5 overflow-hidden">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-foreground text-xs">Welcome back, Eleanor</h3>
                <p className="text-[9px] text-muted-foreground leading-none mt-0.5">Here's your summary for today</p>
              </div>
              <div className="flex items-center gap-1.5 bg-green-500/10 px-2 py-0.5 rounded-full text-[9px] font-bold text-green-600">
                <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                Live Sync
              </div>
            </div>

            {/* Metrics row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background border border-border/50 rounded-xl p-3 shadow-sm space-y-1">
                <span className="text-[9px] font-semibold text-muted-foreground block">Total Balance</span>
                <span className="text-sm font-black text-foreground block tracking-tight leading-none">$84,720.50</span>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-[9px] font-semibold text-green-600 bg-green-500/10 px-1.5 py-0.5 rounded-md">
                    +3.1%
                  </span>
                  <span className="text-[8px] text-muted-foreground">vs last month</span>
                </div>
              </div>
              
              <div className="bg-background border border-border/50 rounded-xl p-3 shadow-sm space-y-1">
                <span className="text-[9px] font-semibold text-muted-foreground block">Savings Target (Model Y)</span>
                <span className="text-sm font-black text-foreground block tracking-tight leading-none">$39,000.00</span>
                <div className="space-y-1 mt-1.5">
                  <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-[78%] bg-[#9fe870] rounded-full" />
                  </div>
                  <div className="flex justify-between text-[8px] text-muted-foreground leading-none">
                    <span>78% reached</span>
                    <span>Target: $50k</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid Row 2: Chart & Transactions */}
            <div className="grid grid-cols-5 gap-3 flex-1 overflow-hidden">
              {/* Chart Container (60% equivalent) */}
              <div className="col-span-3 bg-background border border-border/50 rounded-xl p-3 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-[9px] font-semibold text-muted-foreground">
                  <span>Portfolio Performance</span>
                  <span className="text-muted-foreground">October 2026</span>
                </div>
                <div className="flex-1 relative flex items-end mt-2">
                  <svg viewBox="0 0 300 80" className="w-full h-full overflow-visible">
                    <path 
                      d="M 0 70 Q 50 60, 100 65 T 200 25 T 300 15" 
                      fill="none" 
                      stroke="#7ac73c" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                    />
                    <path 
                      d="M 0 70 Q 50 60, 100 65 T 200 25 T 300 15 L 300 80 L 0 80 Z" 
                      fill="url(#mock-chart-gradient)" 
                    />
                    <defs>
                      <linearGradient id="mock-chart-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#9eec5a" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#9eec5a" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <circle cx="200" cy="25" r="3" fill="#7ac73c" />
                    <circle cx="200" cy="25" r="6" fill="#7ac73c" fillOpacity="0.2" />
                  </svg>
                </div>
              </div>

              {/* Transactions List (40% equivalent) */}
              <div className="col-span-2 bg-background border border-border/50 rounded-xl p-3 shadow-sm flex flex-col justify-between overflow-hidden">
                <span className="text-[9px] font-semibold text-muted-foreground block mb-1.5">Recent Activity</span>
                <div className="space-y-1.5 flex-1 overflow-hidden">
                  <div className="flex items-center justify-between text-[9px] border-b border-border/50 pb-1">
                    <div>
                      <span className="font-bold text-foreground block">Figma Inc</span>
                      <span className="text-[7px] text-muted-foreground block">Subscription</span>
                    </div>
                    <span className="font-bold text-foreground">-$15.00</span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] border-b border-border/50 pb-1">
                    <div>
                      <span className="font-bold text-foreground block">Stripe Payout</span>
                      <span className="text-[7px] text-muted-foreground block">Direct Deposit</span>
                    </div>
                    <span className="font-bold text-green-600">+$3,420.00</span>
                  </div>
                  <div className="flex items-center justify-between text-[9px]">
                    <div>
                      <span className="font-bold text-foreground block">AWS Cloud</span>
                      <span className="text-[7px] text-muted-foreground block">Web Services</span>
                    </div>
                    <span className="font-bold text-foreground">-$84.50</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
