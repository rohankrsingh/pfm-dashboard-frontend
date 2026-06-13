import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Plus,
  Link as LinkIcon,
  TrendingUp,
  ArrowDownRight,
  Sparkles,
  Globe,
  Coins,
  ChevronRight,
  X
} from 'lucide-react'

// Shadcn standard components
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'

export default function Dashboard() {
  const navigate = useNavigate()
  
  // ── PFM State ──
  // User Profile
  const [userProfile, setUserProfile] = useState({
    name: 'Eleanor Vance',
    email: 'eleanor.vance@example.com',
    currency: 'USD'
  })

  // Linked bank accounts
  const [accounts, setAccounts] = useState([
    {
      id: '1',
      platform: 'Chase Checking',
      technologies: 'Checking & Savings',
      earnings: '$12,450.31',
      rawBalance: 12450.31,
      progressPercentage: 85,
      img: 'https://cdn.shadcnstudio.com/ss-assets/blocks/dashboard-application/widgets/zipcar.png'
    },
    {
      id: '2',
      platform: 'Robinhood',
      technologies: 'Brokerage & Stocks',
      earnings: '$24,850.50',
      rawBalance: 24850.50,
      progressPercentage: 65,
      img: 'https://cdn.shadcnstudio.com/ss-assets/blocks/dashboard-application/widgets/bitbank.png'
    },
    {
      id: '3',
      platform: 'Cash Wallet',
      technologies: 'Manual Ledger',
      earnings: '$1,234.00',
      rawBalance: 1234.00,
      progressPercentage: 45,
      img: 'https://cdn.shadcnstudio.com/ss-assets/blocks/dashboard-application/widgets/zipcar.png'
    }
  ])

  // Transactions ledger data
  const [transactions, setTransactions] = useState([
    {
      id: '1',
      avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png',
      avatarFallback: 'JA',
      name: 'Whole Foods Market',
      email: 'Groceries',
      amount: 124.50,
      status: 'paid',
      paidBy: 'visa'
    },
    {
      id: '2',
      avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-2.png',
      avatarFallback: 'MG',
      name: 'Uber Trip',
      email: 'Transport',
      amount: 24.30,
      status: 'paid',
      paidBy: 'mastercard'
    },
    {
      id: '3',
      avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png',
      avatarFallback: 'JD',
      name: 'Netflix Subscription',
      email: 'Entertainment',
      amount: 15.99,
      status: 'paid',
      paidBy: 'visa'
    },
    {
      id: '4',
      avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-4.png',
      avatarFallback: 'EC',
      name: 'Stripe Transfer',
      email: 'Investments',
      amount: 250.00,
      status: 'pending',
      paidBy: 'visa'
    },
    {
      id: '5',
      avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png',
      avatarFallback: 'DL',
      name: 'Starbucks Coffee',
      email: 'Entertainment',
      amount: 6.80,
      status: 'paid',
      paidBy: 'mastercard'
    }
  ])

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false)
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  
  // Form values
  const [newTxName, setNewTxName] = useState('')
  const [newTxAmount, setNewTxAmount] = useState('')
  const [newTxCategory, setNewTxCategory] = useState('Groceries')
  const [newTxPaidBy, setNewTxPaidBy] = useState('visa')
  const [linkBankName, setLinkBankName] = useState('Fidelity Investments')
  const [linkBankBalance, setLinkBankBalance] = useState('5000')

  const handleLogout = () => {
    navigate('/')
  }

  // Calculations
  const totalBalance = accounts.reduce((acc, curr) => acc + curr.rawBalance, 0)
  
  const getCategorySpending = (category) => {
    return transactions
      .filter(t => t.email.toLowerCase() === category.toLowerCase())
      .reduce((acc, curr) => acc + curr.amount, 0)
  }

  const groceriesSpent = getCategorySpending('Groceries')
  const transportSpent = getCategorySpending('Transport')
  const entertainmentSpent = getCategorySpending('Entertainment')
  const investmentsSpent = getCategorySpending('Investments')

  const totalSpent = groceriesSpent + transportSpent + entertainmentSpent + investmentsSpent

  // Handlers
  const handleAddTransaction = (e) => {
    e.preventDefault()
    if (!newTxName || !newTxAmount) return

    const amountNum = parseFloat(newTxAmount)
    if (isNaN(amountNum)) return

    const fallbackInitials = newTxName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)

    const newTxItem = {
      id: String(transactions.length + 1),
      avatar: `https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-${(transactions.length % 15) + 1}.png`,
      avatarFallback: fallbackInitials || 'TX',
      name: newTxName,
      email: newTxCategory,
      amount: amountNum,
      status: 'paid',
      paidBy: newTxPaidBy
    }

    setTransactions([newTxItem, ...transactions])

    setAccounts(prevAccounts => {
      return prevAccounts.map(acc => {
        if (newTxPaidBy === 'cash' && acc.platform === 'Cash Wallet') {
          const nextBal = Math.max(0, acc.rawBalance - amountNum)
          return { ...acc, rawBalance: nextBal, earnings: `$${nextBal.toFixed(2)}` }
        } else if (newTxPaidBy !== 'cash' && acc.platform === 'Chase Checking') {
          const nextBal = Math.max(0, acc.rawBalance - amountNum)
          return { ...acc, rawBalance: nextBal, earnings: `$${nextBal.toFixed(2)}` }
        }
        return acc
      })
    })

    setNewTxName('')
    setNewTxAmount('')
    setNewTxCategory('Groceries')
    setNewTxPaidBy('visa')
    setIsTxModalOpen(false)
  }

  const handleLinkBank = (e) => {
    e.preventDefault()
    const balanceNum = parseFloat(linkBankBalance)
    if (!linkBankName || isNaN(balanceNum)) return

    const newAcc = {
      id: String(accounts.length + 1),
      platform: linkBankName,
      technologies: 'Aggregated Account',
      earnings: `$${balanceNum.toFixed(2)}`,
      rawBalance: balanceNum,
      progressPercentage: 50,
      img: 'https://cdn.shadcnstudio.com/ss-assets/blocks/dashboard-application/widgets/bitbank.png'
    }

    setAccounts([...accounts, newAcc])
    setIsLinkModalOpen(false)
    setLinkBankName('Fidelity Investments')
    setLinkBankBalance('5000')
  }

  const statsCardData = [
    {
      title: 'Net Worth',
      value: `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      changePercentage: '+4.8%',
      icon: <Coins className="size-4" />
    },
    {
      title: 'Monthly Spending',
      value: `$${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      changePercentage: '-12.5%',
      icon: <ArrowDownRight className="size-4 text-red-500" />
    },
    {
      title: 'Monthly Savings Target',
      value: '$2,000.00',
      changePercentage: '+8.2%',
      icon: <TrendingUp className="size-4" />
    }
  ]



  return (
    <div className='flex min-h-dvh w-full text-wise-ink bg-wise-canvas-soft font-sans'>
      <SidebarProvider>
        {/* Sidebar Layout */}
        <Sidebar className="border-r border-wise-ink/10 bg-white">
          <SidebarContent className="bg-white">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem className="mb-4">
                    <div className="flex items-center gap-2.5 px-3 py-4">
                      <div className="w-9 h-9 rounded-xl bg-wise-ink flex items-center justify-center">
                        <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" />
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-base font-black tracking-tight text-wise-ink">PFM Sync</span>
                        <span className="text-[10px] font-semibold text-wise-mute">Internship Project</span>
                      </div>
                    </div>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-wise-mute font-bold text-xs uppercase px-3">PFM Management</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="px-1.5 space-y-1">
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all bg-primary text-wise-ink shadow-sm"
                    >
                      <LayoutDashboard className="size-4 shrink-0" />
                      <span>Dashboard Overview</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Dashboard Main View */}
        <div className='flex flex-1 flex-col overflow-x-hidden min-h-screen'>
          {/* Header */}
          <header className='bg-white h-16 border-b border-wise-ink/10 flex items-center justify-between px-6 sticky top-0 z-40 backdrop-blur-md bg-white/95'>
            <div className='flex items-center gap-4'>
              <SidebarTrigger className='[&_svg]:size-5! hover:bg-wise-canvas-soft p-2 rounded-xl transition-colors cursor-pointer' />
              <Separator orientation='vertical' className='hidden h-4! sm:block bg-wise-ink/15' />
              <Breadcrumb className='hidden sm:block'>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href='/'>Home</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-bold text-wise-ink">Dashboard</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>

        </div>
      </SidebarProvider>

      {/* ── Add Transaction Dialog ── */}
      {isTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-wise-ink/10 relative animate-in zoom-in-95 duration-150">
            <button 
              onClick={() => setIsTxModalOpen(false)} 
              className="absolute top-4 right-4 text-wise-body hover:text-wise-ink hover:bg-wise-canvas-soft p-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </button>
            
            <h3 className="text-xl font-bold text-wise-ink mb-1">Add Manual Transaction</h3>
            <p className="text-xs text-wise-body mb-5">Record a cash or un-synced credit transaction manually.</p>
            
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-wise-body uppercase">Merchant Name</label>
                <Input 
                  placeholder="e.g. Whole Foods, Gas Station" 
                  value={newTxName}
                  onChange={(e) => setNewTxName(e.target.value)}
                  className="rounded-xl h-11 focus:ring-4 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-wise-body uppercase">Amount ($)</label>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00" 
                  value={newTxAmount}
                  onChange={(e) => setNewTxAmount(e.target.value)}
                  className="rounded-xl h-11 focus:ring-4 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-wise-body uppercase">Category</label>
                  <select 
                    value={newTxCategory} 
                    onChange={(e) => setNewTxCategory(e.target.value)}
                    className="w-full flex h-11 rounded-xl border border-wise-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="Groceries">Groceries</option>
                    <option value="Transport">Transport</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Investments">Investments</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-wise-body uppercase">Method</label>
                  <select 
                    value={newTxPaidBy} 
                    onChange={(e) => setNewTxPaidBy(e.target.value)}
                    className="w-full flex h-11 rounded-xl border border-wise-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="visa">Visa card</option>
                    <option value="mastercard">Mastercard</option>
                    <option value="cash">Cash wallet</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setIsTxModalOpen(false)}
                  className="rounded-xl h-11 px-4 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-primary text-wise-ink hover:bg-wise-green-hover font-bold rounded-xl h-11 px-5 cursor-pointer"
                >
                  Save Transaction
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Link Bank Account Dialog ── */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-wise-ink/10 relative animate-in zoom-in-95 duration-150">
            <button 
              onClick={() => setIsLinkModalOpen(false)} 
              className="absolute top-4 right-4 text-wise-body hover:text-wise-ink hover:bg-wise-canvas-soft p-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </button>
            
            <div className="flex items-center gap-2 mb-2 text-primary-foreground">
              <Sparkles className="size-5 text-wise-ink" />
              <h3 className="text-xl font-bold text-wise-ink">Secure Plaid Sync</h3>
            </div>
            <p className="text-xs text-wise-body mb-5">Link your checking, savings, or brokerage accounts securely using end-to-end sandbox sync.</p>
            
            <form onSubmit={handleLinkBank} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-wise-body uppercase">Financial Institution</label>
                <select 
                  value={linkBankName} 
                  onChange={(e) => setLinkBankName(e.target.value)}
                  className="w-full flex h-11 rounded-xl border border-wise-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="Fidelity Investments">Fidelity Investments</option>
                  <option value="Bank of America">Bank of America</option>
                  <option value="Wells Fargo">Wells Fargo</option>
                  <option value="Citibank Checking">Citibank Checking</option>
                  <option value="Coinbase Crypto">Coinbase Crypto</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-wise-body uppercase">Estimated Balance ($)</label>
                <Input 
                  type="number" 
                  placeholder="5000.00" 
                  value={linkBankBalance}
                  onChange={(e) => setLinkBankBalance(e.target.value)}
                  className="rounded-xl h-11 focus:ring-4 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="bg-wise-canvas-soft p-3 rounded-xl border border-wise-ink/5 space-y-1">
                <span className="text-[10px] font-bold text-wise-body uppercase block">Sandbox Mode Notice</span>
                <p className="text-[10px] text-wise-mute leading-normal">
                  No real bank credentials will be stored. Simply click sync below to instantly import mock records for sandbox testing.
                </p>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setIsLinkModalOpen(false)}
                  className="rounded-xl h-11 px-4 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-primary text-wise-ink hover:bg-wise-green-hover font-bold rounded-xl h-11 px-5 cursor-pointer"
                >
                  Sync & Link Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
