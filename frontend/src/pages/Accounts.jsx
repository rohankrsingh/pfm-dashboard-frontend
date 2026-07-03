import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import {
  BuildingIcon,
  Plus,
  RefreshCw,
  MoreVertical,
  Edit2,
  Trash2,
  Check,
  X,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Percent,
  Coins,
  ShieldAlert,
  Search,
  Lock,
  ChevronRight
} from 'lucide-react'

import PlaidLinkButton from '@/components/plaid/PlaidLinkButton'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/reui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { cn } from "@/lib/utils"

// Kibo UI Credit Card
import {
  CreditCard,
  CreditCardFlipper,
  CreditCardFront,
  CreditCardBack,
  CreditCardChip,
  CreditCardName,
  CreditCardNumber,
  CreditCardExpiry,
  CreditCardCvv,
  CreditCardServiceProvider,
  CreditCardMagStripe
} from '@/components/kibo-ui/credit-card'

// Popular banks list for Plaid Link simulator
const POPULAR_BANKS = [
  { name: 'Chase Bank', color: '#115E59', logoBg: 'bg-teal-700', provider: 'Chase' },
  { name: 'Bank of America', color: '#B91C1C', logoBg: 'bg-red-600', provider: 'BankOfAmerica' },
  { name: 'Wells Fargo', color: '#D97706', logoBg: 'bg-amber-600', provider: 'WellsFargo' },
  { name: 'Citibank', color: '#0369A1', logoBg: 'bg-sky-600', provider: 'Citigroup' },
  { name: 'Fidelity Investments', color: '#047857', logoBg: 'bg-emerald-700', provider: 'Fidelity' },
  { name: 'Coinbase Crypto', color: '#312E81', logoBg: 'bg-indigo-900', provider: 'Coinbase' }
]

export default function Accounts() {
  const { userProfile, accounts, fetchLayoutData } = useOutletContext()
  
  // ── States ──
  // Sync all status
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState('')

  // Rename Account state
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)
  const [accountToRename, setAccountToRename] = useState(null)
  const [renameName, setRenameName] = useState('')
  
  // Disconnect Account state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState(null)

  // ── Sync All ──
  const handleSyncAll = async () => {
    setIsSyncing(true)
    setSyncMessage('Connecting to Plaid server...')
    
    try {
      await api.syncTransactions()
      setSyncMessage('Fetching transactions ledger...')
      await fetchLayoutData()
      setSyncMessage('Synchronized successfully!')
    } catch (err) {
      toast.error('Failed to sync with Plaid')
    } finally {
      setTimeout(() => {
        setIsSyncing(false)
        setSyncMessage('')
      }, 1500)
    }
  }


  // ── Rename Account Flow ──
  const triggerRenameModal = (account) => {
    setAccountToRename(account)
    setRenameName(account.name)
    setIsRenameModalOpen(true)
  }

  const handleRenameSubmit = async (e) => {
    e.preventDefault()
    if (!renameName.trim() || !accountToRename) return
    
    try {
      await api.updateAccount(accountToRename._id, {
        name: renameName.trim(),
        type: accountToRename.type,
        balance: accountToRename.balance,
        color: accountToRename.color
      })
      setIsRenameModalOpen(false)
      setAccountToRename(null)
      toast.success('Account renamed successfully.')
      await fetchLayoutData()
    } catch (err) {
      toast.error(err.message || 'Failed to rename account')
    }
  }

  // ── Disconnect Account Flow ──
  const triggerDeleteModal = (account) => {
    setAccountToDelete(account)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!accountToDelete) return
    try {
      await api.deleteAccount(accountToDelete._id)
      setIsDeleteModalOpen(false)
      setAccountToDelete(null)
      toast.success('Account disconnected.')
      await fetchLayoutData()
    } catch (err) {
      toast.error(err.message || 'Failed to disconnect account')
    }
  }

  // ── Calculations ──
  const totalNetWorth = accounts.reduce((acc, curr) => {
    if (curr.type === 'credit_card') {
      return acc - curr.balance
    }
    return acc + curr.balance
  }, 0)

  const checkingSavingsAccounts = accounts.filter(acc => acc.type === 'checking' || acc.type === 'savings')
  const creditCardAccounts = accounts.filter(acc => acc.type === 'credit_card')
  const investmentAccounts = accounts.filter(acc => acc.type === 'investment')

  const getSyncTimeDescription = (updatedAt) => {
    if (!updatedAt) return 'Synced just now'
    const diffMs = new Date() - new Date(updatedAt)
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'Synced just now'
    if (diffMins < 60) return `Synced ${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `Synced ${diffHours}h ago`
    return `Synced on ${new Date(updatedAt).toLocaleDateString()}`
  }

  // Mock limit generator based on current balance to render a usage bar
  const getMockCreditCardLimits = (balance) => {
    if (balance > 50000) {
      return { limit: 150000, available: 150000 - balance }
    } else if (balance > 10000) {
      return { limit: 50000, available: 50000 - balance }
    } else {
      if (balance > 1000) return { limit: 10000, available: 10000 - balance }
      return { limit: 5000, available: 5000 - balance }
    }
  }

  return (
    <>
      {/* Main Content Area */}
      <main className="p-6 md:p-8 flex flex-col gap-6 md:gap-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
        
        {/* Top Summary Bar */}
        <div className="bg-card p-6 md:p-8 rounded-[24px] shadow-sm border border-border/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Net Worth</span>
            <div className="flex items-baseline gap-2">
              <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight font-sans">
                ₹{totalNetWorth.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h1>
              <span className="text-sm font-bold text-muted-foreground">INR</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs bg-primary/20 text-success font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Check className="size-3.5" />
                Live Balance
              </span>
              <span className="text-xs text-muted-foreground font-semibold">
                Across {accounts.length} connected accounts
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button 
              onClick={handleSyncAll}
              disabled={isSyncing}
              variant="outline"
              className="flex-1 md:flex-initial border-border text-foreground font-bold rounded-full h-12 px-6 cursor-pointer gap-2 transition-all hover:bg-muted select-none"
            >
              <RefreshCw className={cn("size-4 shrink-0", isSyncing && "animate-spin")} />
              {isSyncing ? 'Syncing...' : 'Sync All'}
            </Button>
            
            <PlaidLinkButton onLinked={fetchLayoutData} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full h-12 px-5 shadow-xs cursor-pointer gap-2" />
          </div>
        </div>

        {/* Sync Status Banner */}
        {isSyncing && (
          <div className="bg-primary/25 border border-primary/45 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top duration-300">
            <Loader2 className="size-5 text-foreground animate-spin shrink-0" />
            <span className="text-sm font-semibold text-foreground">{syncMessage}</span>
          </div>
        )}

        {/* Accounts Main Grid layout */}
        <div className="space-y-10">
          
          {/* Section 1: Checking & Savings */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="size-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground border border-border/50">
                <Coins className="size-4.5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground">Checking & Savings</h3>
                <p className="text-xs text-muted-foreground">Daily transactional liquid cash reserves</p>
              </div>
              <Badge variant="secondary" className="ml-2 font-bold font-mono">
                {checkingSavingsAccounts.length}
              </Badge>
            </div>

            {checkingSavingsAccounts.length === 0 ? (
              <Card className="rounded-[24px] border-dashed border-2 border-border bg-transparent py-12 px-6 flex flex-col items-center justify-center text-center">
                <BuildingIcon className="size-10 text-muted-foreground opacity-40 mb-3" />
                <p className="text-sm font-bold text-foreground">No liquid bank accounts connected yet</p>
                <p className="text-xs text-muted-foreground max-w-xs mt-1">Link checking or savings credentials secure sandbox environment.</p>
                <PlaidLinkButton onLinked={fetchLayoutData} className="mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full h-10 px-5 cursor-pointer gap-2" />
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {checkingSavingsAccounts.map((acc) => (
                  <Card key={acc._id} className="rounded-[24px] border-none bg-card p-6 shadow-xs relative flex flex-col justify-between min-h-[160px] group transition-all duration-300 hover:shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3.5">
                        <div 
                          className="size-11 rounded-2xl flex items-center justify-center font-black text-white shadow-xs shrink-0"
                          style={{ backgroundColor: acc.color || '#3B82F6' }}
                        >
                          {acc.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-base font-black text-foreground group-hover:text-primary-foreground transition-colors">{acc.name}</h4>
                          <span className="text-[10px] bg-muted text-muted-foreground font-bold uppercase px-2 py-0.5 rounded-full tracking-wider mt-1 inline-block">
                            {acc.type === 'checking' ? 'Checking Account' : 'Savings Account'}
                          </span>
                        </div>
                      </div>

                      {/* Dropdown Menu action */}
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted shrink-0 cursor-pointer" aria-label="Account actions" />}>
                          <MoreVertical className="size-4 text-muted-foreground" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => triggerRenameModal(acc)} className="cursor-pointer">
                            <Edit2 className="size-3.5 mr-2" />
                            Rename Account
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => triggerDeleteModal(acc)} className="text-destructive cursor-pointer hover:bg-destructive/10">
                            <Trash2 className="size-3.5 mr-2" />
                            Disconnect Sync
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-baseline justify-between mt-6 border-t border-border/50 pt-4">
                      <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Current Balance</span>
                        <span className="text-2xl font-black text-foreground tracking-tight font-sans block mt-0.5">
                          ₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-semibold text-muted-foreground block">Available Balance</span>
                        <span className="text-sm font-bold text-muted-foreground font-sans block mt-0.5">
                          ₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    <div className="absolute bottom-2.5 right-6 text-[9px] font-semibold text-muted-foreground">
                      {getSyncTimeDescription(acc.updatedAt)}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Credit Cards */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="size-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground border border-border/50">
                <Plus className="size-4.5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground">Credit Cards</h3>
                <p className="text-xs text-muted-foreground">Sandbox credit limits and usage stats</p>
              </div>
              <Badge variant="secondary" className="ml-2 font-bold font-mono">
                {creditCardAccounts.length}
              </Badge>
            </div>

            {creditCardAccounts.length === 0 ? (
              <Card className="rounded-[24px] border-dashed border-2 border-border bg-transparent py-12 px-6 flex flex-col items-center justify-center text-center">
                <Lock className="size-10 text-muted-foreground opacity-40 mb-3" />
                <p className="text-sm font-bold text-foreground">No credit card accounts connected</p>
                <p className="text-xs text-muted-foreground max-w-xs mt-1">Import credit limit details to test available sandbox capacities.</p>
                <PlaidLinkButton onLinked={fetchLayoutData} className="mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full h-10 px-5 cursor-pointer gap-2" />
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {creditCardAccounts.map((acc) => {
                  const limits = getMockCreditCardLimits(acc.balance)
                  const usagePercentage = Math.min(100, Math.max(0, (acc.balance / limits.limit) * 100))
                  
                  return (
                    <div key={acc._id} className="flex flex-col gap-4">
                      {/* Interactive 3D Flipped Kibo UI Card */}
                      <div className="w-full h-[220px]">
                        <CreditCardFlipper className="w-full h-full">
                          {/* Front view of the credit card */}
                          <CreditCardFront 
                            className="bg-gradient-to-br from-wise-ink via-zinc-900 to-black text-white border border-white/10 shadow-lg p-6 flex flex-col justify-between"
                            style={{ 
                              background: `linear-gradient(135deg, ${acc.color || '#1A1A1A'} 0%, #0e0f0c 100%)`
                            }}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold tracking-widest opacity-60 uppercase">CREDIT SANDBOX</span>
                                <span className="text-sm font-black mt-0.5 truncate max-w-[180px]">{acc.name}</span>
                              </div>
                              <CreditCardChip className="w-10 h-8 rounded-lg bg-yellow-500/20 border border-yellow-500/30" />
                            </div>

                            <div className="my-2">
                              <CreditCardNumber className="text-lg font-mono tracking-[0.2em] font-semibold text-white/95">
                                •••• •••• •••• 5824
                              </CreditCardNumber>
                            </div>

                            <div className="flex justify-between items-end">
                              <div className="flex flex-col">
                                <span className="text-[8px] font-semibold opacity-55">CARDHOLDER</span>
                                <CreditCardName className="text-xs font-bold font-sans uppercase">{userProfile.name || 'Sandbox Guest'}</CreditCardName>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="text-[8px] font-semibold opacity-55">EXPIRES</span>
                                <CreditCardExpiry className="text-xs font-mono font-bold">12/29</CreditCardExpiry>
                              </div>
                            </div>
                          </CreditCardFront>

                          {/* Back view of the credit card */}
                          <CreditCardBack className="bg-gradient-to-br from-zinc-950 to-black text-white p-6 shadow-lg flex flex-col justify-between border border-white/10">
                            <CreditCardMagStripe className="w-full h-10 bg-black -mx-6 mt-2" />
                            
                            <div className="flex items-center justify-between gap-4 mt-4 bg-card/5 p-2 rounded-lg">
                              <div className="flex-1 h-6 bg-slate-300/20 rounded-xs" />
                              <div className="bg-card text-black px-2 py-0.5 text-xs font-bold font-mono rounded-xs">
                                <CreditCardCvv>847</CreditCardCvv>
                              </div>
                            </div>

                            <div className="flex justify-between items-end mt-4">
                              <div className="text-[8px] text-white/40 leading-relaxed font-semibold">
                                Sandbox testing purposes only.<br />No real transactions processed.
                              </div>
                              <CreditCardServiceProvider className="w-10 h-6 flex items-center justify-center font-black tracking-tighter text-sm italic text-primary">
                                VISA
                              </CreditCardServiceProvider>
                            </div>
                          </CreditCardBack>
                        </CreditCardFlipper>
                      </div>

                      {/* Card Balance, Actions & Usage Progress */}
                      <Card className="rounded-[24px] border-none bg-card p-6 shadow-xs flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Outstanding Balance</span>
                              <span className="text-2xl font-black text-foreground tracking-tight font-sans block mt-1">
                                ₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted shrink-0 cursor-pointer" aria-label="Account actions" />}>
                                <MoreVertical className="size-4 text-muted-foreground" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => triggerRenameModal(acc)} className="cursor-pointer">
                                  <Edit2 className="size-3.5 mr-2" />
                                  Rename Account
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => triggerDeleteModal(acc)} className="text-destructive cursor-pointer hover:bg-destructive/10">
                                  <Trash2 className="size-3.5 mr-2" />
                                  Disconnect Sync
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {/* Progress indicators */}
                          <div className="mt-5 space-y-2">
                            <div className="flex justify-between text-xs font-semibold text-foreground">
                              <span>Limit utilization</span>
                              <span className="font-mono">
                                ₹{acc.balance.toLocaleString('en-IN')} of ₹{limits.limit.toLocaleString('en-IN')} ({usagePercentage.toFixed(0)}%)
                              </span>
                            </div>
                            <Progress value={usagePercentage} className={cn("h-2 rounded-full", usagePercentage > 85 ? "bg-destructive" : "bg-primary")} />
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-5 pt-3 border-t border-border/50">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Available Credit</span>
                          <span className="text-sm font-black text-success font-mono">
                            ₹{limits.available.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        <div className="text-[9px] font-semibold text-muted-foreground text-right mt-1.5">
                          {getSyncTimeDescription(acc.updatedAt)}
                        </div>
                      </Card>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Section 3: Investment Portfolios */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="size-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground border border-border/50">
                <TrendingUp className="size-4.5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground">Brokerage & Investments</h3>
                <p className="text-xs text-muted-foreground">Equities, mutual funds, or digital crypto assets</p>
              </div>
              <Badge variant="secondary" className="ml-2 font-bold font-mono">
                {investmentAccounts.length}
              </Badge>
            </div>

            {investmentAccounts.length === 0 ? (
              <Card className="rounded-[24px] border-dashed border-2 border-border bg-transparent py-12 px-6 flex flex-col items-center justify-center text-center">
                <ShieldAlert className="size-10 text-muted-foreground opacity-40 mb-3" />
                <p className="text-sm font-bold text-foreground">No investment assets linked</p>
                <p className="text-xs text-muted-foreground max-w-xs mt-1">Connect investment sandbox accounts to track brokerage performance.</p>
                <PlaidLinkButton onLinked={fetchLayoutData} className="mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full h-10 px-5 cursor-pointer gap-2" />
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {investmentAccounts.map((acc) => (
                  <Card key={acc._id} className="rounded-[24px] border-none bg-card p-6 shadow-xs relative flex flex-col justify-between min-h-[160px] group transition-all duration-300 hover:shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3.5">
                        <div 
                          className="size-11 rounded-2xl flex items-center justify-center font-black text-white shadow-xs shrink-0"
                          style={{ backgroundColor: acc.color || '#10B981' }}
                        >
                          {acc.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-base font-black text-foreground group-hover:text-primary-foreground transition-colors">{acc.name}</h4>
                          <span className="text-[10px] bg-muted text-muted-foreground font-bold uppercase px-2 py-0.5 rounded-full tracking-wider mt-1 inline-block">
                            Investment Portfolio
                          </span>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted shrink-0 cursor-pointer" aria-label="Account actions" />}>
                          <MoreVertical className="size-4 text-muted-foreground" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => triggerRenameModal(acc)} className="cursor-pointer">
                            <Edit2 className="size-3.5 mr-2" />
                            Rename Portfolio
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => triggerDeleteModal(acc)} className="text-destructive cursor-pointer hover:bg-destructive/10">
                            <Trash2 className="size-3.5 mr-2" />
                            Disconnect Sync
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-baseline justify-between mt-6 border-t border-border/50 pt-4">
                      <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Portfolio Value</span>
                        <span className="text-2xl font-black text-foreground tracking-tight font-sans block mt-0.5">
                          ₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-semibold text-muted-foreground block flex items-center gap-1 justify-end">
                          <ArrowUpRight className="size-3.5 text-success" />
                          Growth (Mock)
                        </span>
                        <span className="text-sm font-bold text-success font-mono block mt-0.5">
                          +14.2%
                        </span>
                      </div>
                    </div>

                    <div className="absolute bottom-2.5 right-6 text-[9px] font-semibold text-muted-foreground">
                      {getSyncTimeDescription(acc.updatedAt)}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>



      {/* ── Rename Account Dialog ── */}
      {isRenameModalOpen && accountToRename && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-card rounded-3xl w-full max-w-sm p-8 shadow-xl border border-border relative animate-in zoom-in-95 duration-150">
            <button 
              onClick={() => { setIsRenameModalOpen(false); setAccountToRename(null); }} 
              className="absolute top-5 right-5 text-muted-foreground hover:text-foreground hover:bg-muted p-2 rounded-full transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <h3 className="text-xl font-black text-foreground mb-1">Rename Account</h3>
            <p className="text-xs text-muted-foreground mb-5">Update the nickname of your synchronized financial asset.</p>

            <form onSubmit={handleRenameSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Account Nickname</label>
                <Input 
                  value={renameName}
                  onChange={(e) => setRenameName(e.target.value)}
                  className="rounded-xl h-11 px-4 border-border text-sm"
                  required
                />
              </div>

              <div className="pt-3 flex gap-3">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => { setIsRenameModalOpen(false); setAccountToRename(null); }}
                  className="flex-1 rounded-full h-11 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-full h-11 text-xs cursor-pointer"
                >
                  Update Name
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Disconnect Account Confirmation Dialog ── */}
      {isDeleteModalOpen && accountToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-card rounded-3xl w-full max-w-sm p-8 shadow-xl border border-border relative animate-in zoom-in-95 duration-150">
            <button 
              onClick={() => { setIsDeleteModalOpen(false); setAccountToDelete(null); }} 
              className="absolute top-5 right-5 text-muted-foreground hover:text-foreground hover:bg-muted p-2 rounded-full transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <div className="size-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 border border-red-200 mb-4">
              <ShieldAlert className="size-6" />
            </div>

            <h3 className="text-xl font-black text-foreground mb-1">Disconnect Account?</h3>
            <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
              Are you sure you want to disconnect <strong>{accountToDelete.name}</strong>? This will remove all associated balance and historical ledger synchronizations.
            </p>

            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => { setIsDeleteModalOpen(false); setAccountToDelete(null); }}
                className="flex-1 rounded-full h-11 font-bold text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDeleteConfirm}
                className="flex-1 bg-destructive text-white hover:bg-destructive/90 font-bold rounded-full h-11 text-xs cursor-pointer"
              >
                Disconnect Sync
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
