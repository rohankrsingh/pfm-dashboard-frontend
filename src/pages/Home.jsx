import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  EnvelopeSimple,
  Star,
  CaretLeft,
  CaretRight,
  Plus,
  Bell,
  Gear,
  TrendUp,
  InstagramLogo,
  LinkedinLogo,
  YoutubeLogo,
  FacebookLogo,
  List
} from '@phosphor-icons/react'
import BentoGrid from '../components/kokonutui/bento-grid'
import { FAQ } from '../components/ui/faq-tabs'

const pfmFaqs = [
  {
    question: "What is the PFM Dashboard?",
    answer: "The Personal Finance Management (PFM) Dashboard aggregates all your financial data—including bank accounts, credit cards, and investments—into a single, intuitive interface. It helps you monitor net worth, analyze spending habits, and build effective budgets."
  },
  {
    question: "How does the Plaid integration work?",
    answer: "Plaid provides a secure connection to link your financial institutions. It processes sandbox bank credentials, exchanges public tokens for secure access tokens, and fetches balances and transactions in real-time without exposing your raw banking credentials."
  },
  {
    question: "Is my financial data secure?",
    answer: "Yes, security is a core priority. All user credentials and tokens are encrypted on our Node.js/Express backend before storage. The client communicates with the server using JWT-protected routes to ensure complete data isolation and privacy."
  },
  {
    question: "Can I manually add cash transactions to the ledger?",
    answer: "Absolutely. Along with bank-synced transactions, you can manually input cash transactions, select categories, and update your ledger balances immediately via the dashboard's manual transaction manager."
  },
  {
    question: "How are budget limits and spending progress calculated?",
    answer: "You can define monthly limits for various spending categories (like Groceries, Transport, or Entertainment). The dashboard dynamically cross-references your current ledger transactions against these limits and displays warning bars when you exceed 80% or 100% of your budget."
  }
];

export default function Home() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email) {
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 3000)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col font-sans selection:bg-primary selection:text-foreground">

      {/* ── Navigation Bar ── */}
      <header className="h-[72px] border-b border-wise-ink/5 px-6 flex items-center justify-between z-40 bg-white/80 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-wise-ink flex items-center justify-center">
            <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" />
            </svg>
          </div>
          <span className="text-xl font-black tracking-tight text-wise-ink select-none">PFM</span>
        </div>

        <nav className="hidden md:flex items-center gap-1 bg-[#f4f5f3] p-1 rounded-full border border-wise-ink/5">
          <Link to="#features" className="text-xs font-semibold text-wise-body px-4 py-2 rounded-full hover:bg-white hover:text-wise-ink hover:shadow-sm transition-all duration-200">
            Overview
          </Link>
          <Link to="#features" className="text-xs font-semibold text-wise-body px-4 py-2 rounded-full hover:bg-white hover:text-wise-ink hover:shadow-sm transition-all duration-200">
            Features
          </Link>
          <Link to="#" className="text-xs font-semibold text-wise-body px-4 py-2 rounded-full hover:bg-white hover:text-wise-ink hover:shadow-sm transition-all duration-200">
            Team
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-semibold text-wise-ink px-4 py-2 rounded-full hover:bg-[#f4f5f3] transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="bg-wise-ink text-white text-xs font-semibold px-5 py-2.5 rounded-full hover:bg-wise-ink/90 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Start free trial
          </Link>
        </div>
      </header>

      {/* ── Hero & Top-of-Page Section ── */}
      <section className="relative pt-16 pb-20 px-6 text-center overflow-hidden bg-gradient-to-b from-[#FAFBF9] to-white border-b border-wise-ink/5">
        <div className="max-w-3xl mx-auto relative z-10">

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-black text-wise-ink leading-[1.05] tracking-tight mb-6">
            Turn calculation into <span className="text-wise-positive-deep italic font-bold">confidence</span>
          </h1>

          {/* Subtext */}
          <p className="text-base text-wise-body max-w-lg mx-auto mb-10 leading-relaxed">
            A personal finance manager dashboard built as our internship project to track spending, set budgets, and visualize clear cash flow insights.
          </p>

          {/* Email Inline Form */}
          <form onSubmit={handleSubscribe} className="max-w-md mx-auto mb-12 flex items-center bg-[#F3F4F6] border border-wise-ink/10 rounded-full p-1.5 focus-within:ring-2 focus-within:ring-wise-ink/10 focus-within:border-wise-ink/20 transition-all">
            <div className="flex items-center gap-2 pl-3 flex-1">
              <EnvelopeSimple size={18} className="text-wise-mute" />
              <input
                type="email"
                placeholder="Enter email to test"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-sm text-wise-ink placeholder:text-wise-mute"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-wise-ink text-white text-xs font-semibold px-6 py-3 rounded-full hover:bg-wise-ink/90 active:scale-[0.98] transition-all flex items-center gap-1.5"
            >
              {submitted ? 'Verified!' : 'Launch prototype'}
              <ArrowRight size={14} />
            </button>
          </form>
        </div>

        <div className="max-w-4xl mx-auto px-4 mt-4 select-none">
          <div className="bg-[#0e0f0c] p-3 rounded-2xl md:rounded-t-3xl shadow-[0_32px_64px_rgba(0,0,0,0.12)] border border-white/10 relative">

            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#1f1f1f] rounded-full" />

            <div className="bg-[#f4f5f3] rounded-xl overflow-hidden text-left border border-wise-ink/5 flex flex-col">

              {/* Mock Nav */}
              <div className="bg-white border-b border-wise-ink/5 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-md bg-wise-ink flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-wise-ink">PFM</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold text-wise-mute px-2.5 py-1 rounded-full">Dashboard</span>
                  <span className="text-[10px] font-semibold text-wise-ink bg-wise-green-pale px-2.5 py-1 rounded-full">Accounts</span>
                  <span className="text-[10px] font-semibold text-wise-mute px-2.5 py-1 rounded-full">Payments</span>
                </div>

                <div className="flex items-center gap-2">
                  <Bell size={14} className="text-wise-body" />
                  <Gear size={14} className="text-wise-body" />
                  <div className="w-5 h-5 rounded-full bg-wise-ink/15 border border-wise-ink/5 overflow-hidden">
                    <img src="https://picsum.photos/seed/william/50/50" alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>

              {/* Mock Content area */}
              <div className="p-5 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-wise-ink">Good morning, William!</h3>
                    <p className="text-[10px] text-wise-mute">Here is your financial status today.</p>
                  </div>
                  <button className="bg-wise-ink text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
                    <Plus size={10} /> New payment
                  </button>
                </div>

                {/* 3-Column Bento layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  {/* Card 1: My Accounts */}
                  <div className="bg-white border border-wise-ink/5 rounded-2xl p-4 flex flex-col justify-between h-[180px] shadow-[0_8px_16px_rgba(0,0,0,0.02)]">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-semibold text-wise-mute block uppercase">My Accounts</span>
                        <span className="text-lg font-black text-wise-ink tracking-tight mt-0.5 block">$16,531.54</span>
                      </div>
                      <span className="text-[9px] font-bold text-wise-positive bg-wise-green-pale px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <TrendUp size={8} /> Active
                      </span>
                    </div>

                    {/* Gradient card visual */}
                    <div className="bg-gradient-to-br from-wise-ink via-wise-ink/90 to-wise-body rounded-xl p-3 text-white flex flex-col justify-between h-20 shadow-sm relative overflow-hidden">
                      <div className="absolute right-0 bottom-0 w-24 h-24 bg-wise-green/10 rounded-full blur-xl pointer-events-none" />
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-bold tracking-wider opacity-60">VISA GOLD</span>
                        <div className="w-5 h-3.5 bg-yellow-400/20 rounded border border-yellow-400/20" />
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-mono tracking-widest opacity-80">•••• 4329</span>
                        <span className="text-[10px] font-bold">12/28</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Spending Plan */}
                  <div className="bg-white border border-wise-ink/5 rounded-2xl p-4 flex flex-col justify-between h-[180px] shadow-[0_8px_16px_rgba(0,0,0,0.02)]">
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-semibold text-wise-mute block uppercase">Spending Plan</span>
                        <span className="text-[9px] font-bold text-wise-body">View details</span>
                      </div>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-lg font-black text-wise-ink tracking-tight">$37k</span>
                        <span className="text-[9px] text-wise-mute">limit this month</span>
                      </div>
                    </div>

                    {/* Custom coded bar chart */}
                    <div className="flex items-end justify-between h-20 pt-4 px-1">
                      <div className="w-5 bg-wise-ink/5 rounded-t-md h-8" />
                      <div className="w-5 bg-wise-ink/5 rounded-t-md h-12" />
                      <div className="w-5 bg-wise-green rounded-t-md h-16 relative">
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-wise-ink text-white text-[8px] px-1 rounded font-bold shadow">+12%</div>
                      </div>
                      <div className="w-5 bg-wise-ink/5 rounded-t-md h-10" />
                      <div className="w-5 bg-wise-ink/5 rounded-t-md h-14" />
                      <div className="w-5 bg-wise-ink/10 rounded-t-md h-6" />
                    </div>
                  </div>

                  {/* Card 3: Available ring gauge */}
                  <div className="bg-white border border-wise-ink/5 rounded-2xl p-4 flex flex-col items-center justify-between h-[180px] shadow-[0_8px_16px_rgba(0,0,0,0.02)] relative">
                    <div className="w-full flex justify-between items-center">
                      <span className="text-[10px] font-semibold text-wise-mute block uppercase">Available</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-wise-positive" />
                    </div>

                    {/* Gauge circle overlay container */}
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="38" className="stroke-wise-ink/5" strokeWidth="6" fill="transparent" />
                        <circle cx="48" cy="48" r="38" className="stroke-wise-ink" strokeWidth="6" fill="transparent" strokeDasharray="238" strokeDashoffset="60" />
                        <circle cx="48" cy="48" r="38" className="stroke-wise-green" strokeWidth="6" fill="transparent" strokeDasharray="238" strokeDashoffset="140" />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-xs font-black text-wise-ink">$4,682</span>
                        <span className="text-[8px] text-wise-mute uppercase">Left</span>
                      </div>
                    </div>

                    {/* Legend grid */}
                    <div className="flex gap-2 text-[8px] font-semibold">
                      <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-wise-green" /> Available</span>
                      <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-wise-ink" /> Planned</span>
                      <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-wise-ink/10" /> Other</span>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── Features Bento Grid Section ── */}
      <section id="features" className="py-24 px-6 bg-[#FAFBF9] border-b border-wise-ink/5 flex flex-col items-center">
        <div className="max-w-3xl mx-auto mb-16 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-wise-ink tracking-tight mb-4">
            Designed for visual clarity
          </h2>
          <p className="text-sm text-wise-body max-w-md mx-auto">
            A comprehensive financial workspace mapping out your balances, predictions, and budget structures in real-time.
          </p>
        </div>

        <div className="w-full max-w-7xl mx-auto">
          <BentoGrid />
        </div>
      </section>

      {/* ── Closing Call-to-Action Section ── */}
      <section className="relative py-28 px-6 text-center bg-white overflow-hidden border-b border-wise-ink/5">

        {/* Floating Cards (Grocery category & Income widgets) */}
        <div className="absolute top-12 left-[10%] hidden lg:block hover:scale-105 hover:-rotate-3 transition-all duration-300 select-none pointer-events-auto">
          <div className="bg-white border border-wise-ink/5 rounded-2xl p-4 shadow-lg w-44 text-left">
            <span className="text-[10px] font-bold text-wise-mute uppercase tracking-wider">Grocery</span>
            <div className="flex justify-between items-end mt-2">
              <span className="text-xl font-black text-wise-ink">$1.2k</span>
              <span className="text-[9px] font-bold text-wise-positive bg-wise-green-pale px-2 py-0.5 rounded-full">+12%</span>
            </div>
            <div className="w-full bg-[#f4f5f3] rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="bg-wise-ink h-full rounded-full w-[70%]" />
            </div>
          </div>
        </div>

        <div className="absolute bottom-16 right-[10%] hidden lg:block hover:scale-105 hover:rotate-3 transition-all duration-300 select-none pointer-events-auto">
          <div className="bg-white border border-wise-ink/5 rounded-2xl p-4 shadow-lg w-48 text-left">
            <span className="text-[10px] font-bold text-wise-mute uppercase tracking-wider">Income growth</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-wise-ink">$1,600</span>
              <span className="text-[9px] text-wise-mute">past 30 days</span>
            </div>
            <div className="h-10 mt-3 flex items-end gap-1">
              <div className="flex-1 bg-wise-green-neutral/40 rounded-sm h-4" />
              <div className="flex-1 bg-wise-green-neutral/60 rounded-sm h-6" />
              <div className="flex-1 bg-wise-green-neutral/80 rounded-sm h-7" />
              <div className="flex-1 bg-wise-green rounded-sm h-10" />
            </div>
          </div>
        </div>

        <div className="max-w-xl mx-auto relative z-10">
          {/* Center Logo */}
          <div className="w-12 h-12 rounded-2xl bg-wise-ink flex items-center justify-center mx-auto mb-6 shadow-md">
            <svg className="w-7 h-7 text-primary" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" />
            </svg>
          </div>

          <h2 className="text-3xl md:text-5xl font-black text-wise-ink tracking-tight mb-4">
            Simple. Seamless. Personal.
          </h2>
          <p className="text-sm text-wise-body max-w-sm mx-auto mb-8">
            An internship project designed to explore advanced financial tracking UI paradigms.
          </p>

          <Link
            to="/signup"
            className="bg-wise-ink text-white font-semibold text-sm px-8 py-3.5 rounded-full hover:bg-wise-ink/90 hover:scale-[1.02] active:scale-[0.98] transition-all inline-block shadow-sm"
          >
            Explore PFM dashboard
          </Link>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <FAQ
        title="Frequently Asked Questions"
        subtitle="Support & Help"
        faqData={pfmFaqs}
        showTabs={false}
      />

      {/* ── Footer ── */}
      <footer id="team" className="bg-[#FAFBF9] px-6 py-12 border-t border-wise-ink/5">
        <div className="max-w-6xl mx-auto flex flex-col items-center justify-center gap-6">

          {/* Nav list */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            <Link to="#" className="text-xs font-semibold text-wise-body hover:text-wise-ink transition-colors">Overview</Link>
            <Link to="#" className="text-xs font-semibold text-wise-body hover:text-wise-ink transition-colors">Features</Link>
            <Link to="#" className="text-xs font-semibold text-wise-body hover:text-wise-ink transition-colors">Documentation</Link>
            <Link to="#" className="text-xs font-semibold text-wise-body hover:text-wise-ink transition-colors">Team</Link>
          </div>

          {/* Social media icons */}
          <div className="flex items-center gap-4 text-wise-mute">
            <Link to="#" className="hover:text-wise-ink transition-colors">
              <InstagramLogo size={18} weight="bold" />
            </Link>
            <Link to="#" className="hover:text-wise-ink transition-colors">
              <LinkedinLogo size={18} weight="bold" />
            </Link>
            <Link to="#" className="hover:text-wise-ink transition-colors">
              <YoutubeLogo size={18} weight="bold" />
            </Link>
            <Link to="#" className="hover:text-wise-ink transition-colors">
              <FacebookLogo size={18} weight="bold" />
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-[10px] text-wise-mute">
            © {new Date().getFullYear()} PFM Internship Project. Built for educational and demonstration purposes.
          </p>
        </div>
      </footer>

    </div>
  )
}
