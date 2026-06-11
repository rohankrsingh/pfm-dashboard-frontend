import React from 'react'
import { Link } from 'react-router-dom'

const features = [
  { icon: '📊', title: 'Smart Analytics',  desc: 'Visual breakdowns of your income and spending patterns.' },
  { icon: '🎯', title: 'Budget Goals',     desc: 'Set and track monthly budgets across every category.'    },
  { icon: '🔔', title: 'Actionable Insights', desc: 'Personalised tips that help you build better habits.' },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans">

      {/* ── Navbar — white card on sage ── */}
      <nav className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-2xl font-black tracking-tight text-foreground">PFM</span>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-sm font-semibold text-foreground px-4 py-2 rounded-xl hover:bg-secondary transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="bg-primary text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-wise-green-hover transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero band — sage canvas-soft ── */}
      <section className="bg-background px-6 py-24 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-black text-foreground leading-none tracking-tight mb-6">
            Money without<br />
            the <span className="text-wise-positive-deep">guesswork.</span>
          </h1>
          <p className="text-lg text-wise-body max-w-lg mx-auto mb-10 leading-relaxed">
            Track spending, set budgets, and gain insights that help you save more and stress less.
          </p>
          <div className="flex items-center gap-3 justify-center flex-wrap">
            <Link
              to="/signup"
              className="bg-primary text-primary-foreground font-semibold text-base px-8 py-3.5 rounded-xl hover:bg-wise-green-hover transition-colors"
            >
              Get started — it's free
            </Link>
            <Link
              to="/login"
              className="bg-card text-foreground font-semibold text-base px-8 py-3.5 rounded-xl border border-foreground hover:bg-secondary transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ── Feature cards — white on sage ── */}
      <section className="bg-background px-6 pb-24">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map(f => (
            <div
              key={f.title}
              className="bg-card rounded-xl p-6 ring-1 ring-foreground/10 hover:-translate-y-1 transition-transform duration-200"
            >
              <span className="text-3xl block mb-4">{f.icon}</span>
              <h3 className="text-base font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-wise-body leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA band — dark ink + lime green ── */}
      <section className="bg-wise-ink px-6 py-20 text-center">
        <h2 className="text-4xl font-black text-wise-green mb-4">Ready to take control?</h2>
        <p className="text-wise-canvas-soft mb-8 text-base">Join thousands tracking their finances smarter.</p>
        <Link
          to="/signup"
          className="bg-primary text-primary-foreground font-semibold text-base px-8 py-3.5 rounded-xl hover:bg-wise-green-hover transition-colors inline-block"
        >
          Start for free
        </Link>
      </section>

      {/* ── Footer — dark ink ── */}
      <footer className="bg-wise-ink px-8 py-10 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <span className="text-xl font-black text-wise-canvas-soft tracking-tight">PFM</span>
          <p className="text-xs text-wise-mute">© {new Date().getFullYear()} PFM. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
