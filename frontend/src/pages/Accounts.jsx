import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '@/lib/api'
import {
  LayoutDashboard,
  BuildingIcon,
  Plus,
  RefreshCw,
  MoreVertical,
  Edit2,
  Trash2,
  Check,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Percent,
  Coins,
  ShieldAlert,
  Search,
  Lock,
  ChevronRight,
  CheckIcon,
  ChevronsUpDownIcon,
  SunIcon,
  MoonIcon,
  MonitorIcon,
  PhoneIcon,
  SettingsIcon,
  LifeBuoyIcon,
  LogOutIcon
} from 'lucide-react'

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

const statuses = [
  { value: "available", label: "Available", color: "bg-green-500" },
  { value: "away", label: "Away", color: "bg-amber-500" },
  { value: "busy", label: "Busy", color: "bg-red-500" },
  { value: "offline", label: "Offline", color: "bg-gray-400" },
]

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
  const navigate = useNavigate()
  
  // ── States ──
  const [userProfile, setUserProfile] = useState({ name: '', email: '', currency: 'INR' })
  const [accounts, setAccounts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [status, setStatus] = useState("available")
  const [theme, setTheme] = useState("light")
  
  // Sync all status
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState('')

  // Modals state
  const [isPlaidModalOpen, setIsPlaidModalOpen] = useState(false)
  const [plaidStep, setPlaidStep] = useState(1) // 1: Select Bank, 2: Account details / link, 3: Verifying loader, 4: Connected success
  const [selectedBank, setSelectedBank] = useState(null)
  
  // Form fields for Plaid Link
  const [newAccNickname, setNewAccNickname] = useState('')
  const [newAccType, setNewAccType] = useState('checking')
  const [newAccBalance, setNewAccBalance] = useState('1500')
  const [isLinkingSubmitting, setIsLinkingSubmitting] = useState(false)

  // Rename Account state
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)
  const [accountToRename, setAccountToRename] = useState(null)
  const [renameName, setRenameName] = useState('')
  
  // Disconnect Account state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState(null)

  const fetchAccountsData = async () => {
    try {
      setIsLoading(true)
      setError('')

      // 1. Fetch profile
      const meData = await api.getMe()
      setUserProfile({
        name: meData.user.name,
        email: meData.user.email,
        currency: 'INR'
      })

      // 2. Fetch Accounts
      const accsData = await api.getAccounts()
      setAccounts(accsData.accounts || [])
    } catch (err) {
      console.error('Failed to load accounts:', err)
      setError(err.message || 'Failed to load accounts')
      if (err.message && err.message.toLowerCase().includes('authorized')) {
        api.logout()
        navigate('/login')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    fetchAccountsData()
  }, [])

  const handleLogout = () => {
    api.logout()
    navigate('/')
  }

  // ── Sync All Simulation ──
  const handleSyncAll = async () => {
    setIsSyncing(true)
    setSyncMessage('Connecting to Plaid server...')
    
    // Simulate step-by-step Plaid synchronization
    setTimeout(() => {
      setSyncMessage('Fetching transactions ledger...')
      setTimeout(async () => {
        setSyncMessage('Updating account balances...')
        try {
          // Trigger data re-fetch from backend
          await fetchAccountsData()
          setSyncMessage('Synchronized successfully!')
          setTimeout(() => {
            setIsSyncing(false)
            setSyncMessage('')
          }, 1500)
        } catch (err) {
          setError('Failed to refresh data during sync.')
          setIsSyncing(false)
        }
      }, 1000)
    }, 1000)
  }

  // ── Connect New Account Flow (Plaid Simulator) ──
  const startPlaidFlow = () => {
    setSelectedBank(null)
    setNewAccNickname('')
    setNewAccType('checking')
    setNewAccBalance('1500')
    setPlaidStep(1)
    setIsPlaidModalOpen(true)
  }

  const handleSelectBank = (bank) => {
    setSelectedBank(bank)
    setNewAccNickname(`${bank.name} Active`)
    setPlaidStep(2)
  }

  const handleCreateAccountSubmit = async (e) => {
    e.preventDefault()
    if (!newAccNickname || !selectedBank) return
    const balanceNum = parseFloat(newAccBalance)
    if (isNaN(balanceNum)) return

    setIsLinkingSubmitting(true)
    setPlaidStep(3) // Transition to "Verifying..." animation loader

    setTimeout(async () => {
      try {
        await api.createAccount(newAccNickname, newAccType, balanceNum, selectedBank.color)
        setPlaidStep(4) // Connected Success state
        await fetchAccountsData()
      } catch (err) {
        alert(err.message || 'Failed to link account')
        setPlaidStep(2)
      } finally {
        setIsLinkingSubmitting(false)
      }
    }, 2000)
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
      await fetchAccountsData()
    } catch (err) {
      alert(err.message || 'Failed to rename account')
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
      await fetchAccountsData()
    } catch (err) {
      alert(err.message || 'Failed to disconnect account')
    }
  }

  // ── Calculations ──
  // Calculate total net worth by summing positive accounts and subtracting credit cards
  const totalNetWorth = accounts.reduce((acc, curr) => {
    if (curr.type === 'credit_card') {
      return acc - curr.balance
    }
    return acc + curr.balance
  }, 0)

  // Credit limit mapping helper
  const getCreditLimit = (balance) => {
    // If balance is in INR (typical scale 10,000 - 1,00,000+)
    if (balance > 2500) {
      if (balance > 150000) return 500000
      if (balance > 50000) return 200000
      return 150000
    } else {
      // Scale for USD (100 - 2,000+)
      if (balance > 2000) return 5000
      if (balance > 1000) return 3000
      return 2000
    }
  }

  const activeStatus = statuses.find((s) => s.value === status) || statuses[0]

  if (isLoading && accounts.length === 0) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-wise-canvas-soft font-sans gap-4">
        <div className="w-12 h-12 border-4 border-wise-ink border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-bold text-wise-ink uppercase tracking-wider animate-pulse">Loading linked accounts...</span>
      </div>
    )
  }

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
                      asChild
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-wise-canvas-soft text-wise-mute hover:text-wise-ink"
                    >
                      <Link to="/dashboard">
                        <LayoutDashboard className="size-4 shrink-0" />
                        <span>Dashboard Overview</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all bg-primary text-wise-ink shadow-sm"
                    >
                      <Link to="/accounts">
                        <BuildingIcon className="size-4 shrink-0" />
                        <span>Linked Accounts</span>
                      </Link>
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
                    <BreadcrumbLink render={<Link to="/" />}>Home</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-bold text-wise-ink">Accounts</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            
            {/* Header User profile dropdown */}
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button 
                      variant="ghost" 
                      className="flex items-center gap-2 px-3 py-1.5 h-10 rounded-xl hover:bg-wise-canvas-soft cursor-pointer text-xs font-semibold text-wise-body hover:text-wise-ink border-none outline-none" 
                    />
                  }
                >
                  <Avatar size="sm">
                    <AvatarImage src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png" />
                    <AvatarFallback>EV</AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-bold text-wise-ink">{userProfile.name}</span>
                  <ChevronsUpDownIcon className="size-3.5 text-wise-mute ml-1 opacity-60" aria-hidden="true" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-60" align="end" sideOffset={8}>
                  <div className="flex items-center gap-3 px-1 pt-1.5 pb-2">
                    <Avatar className="size-9">
                      <AvatarImage src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png" />
                      <AvatarFallback>EV</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-wise-ink text-sm font-bold leading-tight">
                        {userProfile.name}
                      </span>
                      <span className="text-wise-mute text-xs leading-tight">
                        {userProfile.email}
                      </span>
                    </div>
                  </div>
                  
                  {/* Theme Selector */}
                  <div className="py-2 px-1">
                    <Tabs value={theme} onValueChange={setTheme}>
                      <TabsList className="w-full bg-wise-canvas-soft p-1 rounded-xl flex h-10 items-center">
                        <TabsTrigger value="light" className="h-8 flex-1 text-xs font-semibold flex items-center justify-center rounded-lg data-[state=active]:bg-white data-[state=active]:text-wise-ink text-wise-mute transition-all cursor-pointer">
                          <SunIcon className="size-4" aria-hidden="true" />
                        </TabsTrigger>
                        <TabsTrigger value="dark" className="h-8 flex-1 text-xs font-semibold flex items-center justify-center rounded-lg data-[state=active]:bg-white data-[state=active]:text-wise-ink text-wise-mute transition-all cursor-pointer">
                          <MoonIcon className="size-4" aria-hidden="true" />
                        </TabsTrigger>
                        <TabsTrigger value="system" className="h-8 flex-1 text-xs font-semibold flex items-center justify-center rounded-lg data-[state=active]:bg-white data-[state=active]:text-wise-ink text-wise-mute transition-all cursor-pointer">
                          <MonitorIcon className="size-4" aria-hidden="true" />
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  
                  <DropdownMenuSeparator className="bg-wise-ink/5" />
                  
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onSelect={() => navigate('/accounts')}
                      className="cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <BuildingIcon className="size-4" aria-hidden="true" />
                        Linked Accounts
                      </span>
                      <Badge variant="secondary" size="sm" className="ml-auto">
                        {accounts.length}
                      </Badge>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  
                  {/* Status sub menu */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <span className="flex items-center gap-2">
                        <span
                          className={cn(
                            "rounded-full size-2",
                            activeStatus.color
                          )}
                        />
                        {activeStatus.label}
                      </span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent side="left">
                      {statuses.map((s) => (
                        <DropdownMenuItem
                          key={s.value}
                          onClick={() => setStatus(s.value)}
                        >
                          <span className="flex items-center gap-2">
                            <span className={`size-2 rounded-full ${s.color}`} />
                            {s.label}
                          </span>
                          {status === s.value && (
                            <CheckIcon className="text-muted-foreground size-3.5" aria-hidden="true" />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  
                  <DropdownMenuSeparator className="bg-wise-ink/5" />
                  
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <SettingsIcon className="size-4" aria-hidden="true" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <LifeBuoyIcon className="size-4" aria-hidden="true" />
                      Help Center
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  
                  <DropdownMenuSeparator className="bg-wise-ink/5" />
                  
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    variant="destructive"
                  >
                    <LogOutIcon className="size-4" aria-hidden="true" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="p-6 md:p-8 flex flex-col gap-6 md:gap-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
            
            {/* Top Summary Bar */}
            <div className="bg-white p-6 md:p-8 rounded-[24px] shadow-sm border border-wise-ink/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-wise-mute uppercase tracking-wider">Total Net Worth</span>
                <div className="flex items-baseline gap-2">
                  <h1 className="text-4xl md:text-5xl font-black text-wise-ink tracking-tight font-sans">
                    ₹{totalNetWorth.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h1>
                  <span className="text-sm font-bold text-wise-mute">INR</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-wise-green-pale text-wise-positive-deep font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="size-3" />
                    {accounts.length} Connected {accounts.length === 1 ? 'account' : 'accounts'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 w-full md:w-auto">
                <Button 
                  onClick={handleSyncAll}
                  disabled={isSyncing}
                  variant="outline"
                  className="flex-1 md:flex-initial border-wise-ink/15 hover:bg-wise-canvas-soft text-wise-ink font-bold rounded-full h-12 px-6 cursor-pointer gap-2 transition-all"
                >
                  <RefreshCw className={cn("size-4 shrink-0", isSyncing && "animate-spin")} />
                  {isSyncing ? 'Syncing...' : 'Sync all'}
                </Button>
                <Button 
                  onClick={startPlaidFlow}
                  className="flex-1 md:flex-initial bg-wise-ink text-white hover:bg-wise-ink-deep font-bold rounded-full h-12 px-6 cursor-pointer gap-2 transition-all"
                >
                  <Plus className="size-4 shrink-0" />
                  Connect new account
                </Button>
              </div>
            </div>

            {/* Sync Status Banner */}
            {isSyncing && (
              <div className="bg-primary/20 border border-primary/40 rounded-2xl p-4 flex items-center gap-3 animate-pulse text-sm font-semibold">
                <Loader2 className="size-4 animate-spin text-wise-positive-deep" />
                <span>{syncMessage}</span>
              </div>
            )}

            {/* Grid of accounts */}
            <div>
              <h2 className="text-xl font-black text-wise-ink mb-6">Linked Accounts Ledger</h2>
              {accounts.length === 0 ? (
                <div className="bg-white rounded-[24px] p-12 text-center border border-dashed border-wise-ink/20 flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-wise-canvas-soft flex items-center justify-center text-wise-mute">
                    <BuildingIcon className="size-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-wise-ink">No connected accounts</h3>
                    <p className="text-sm text-wise-mute mt-1">Connect your bank or investment accounts securely using Plaid sandbox.</p>
                  </div>
                  <Button onClick={startPlaidFlow} className="bg-primary text-wise-ink font-bold rounded-full h-11 px-6 mt-2">
                    Connect account
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {accounts.map((account) => {
                    const isCreditCard = account.type === 'credit_card';
                    const currencySymbol = '₹';
                    
                    // Specific credit card values
                    const limit = getCreditLimit(account.balance);
                    const availableBalance = isCreditCard ? Math.max(limit - account.balance, 0) : account.balance;
                    const usagePercent = isCreditCard ? Math.min(Math.round((account.balance / limit) * 100), 100) : 0;
                    
                    // Synced time based on timestamp
                    const updatedDate = new Date(account.updatedAt || account.createdAt || new Date());
                    const timeDiff = Math.abs(new Date() - updatedDate);
                    const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
                    const minsDiff = Math.floor(timeDiff / (1000 * 60));
                    let syncStr = 'Synced just now';
                    if (hoursDiff > 0) {
                      syncStr = `Synced ${hoursDiff} ${hoursDiff === 1 ? 'hour' : 'hours'} ago`;
                    } else if (minsDiff > 0) {
                      syncStr = `Synced ${minsDiff} ${minsDiff === 1 ? 'min' : 'mins'} ago`;
                    }

                    // Provider types for Kibo icons
                    const providerMap = {
                      'Citibank': 'Citigroup',
                      'Chase Bank': 'Chase',
                      'Wells Fargo': 'WellsFargo',
                      'Bank of America': 'BankOfAmerica',
                      'Fidelity Investments': 'Fidelity',
                      'Coinbase Crypto': 'Coinbase'
                    };
                    const provider = providerMap[account.name.split(' ')[0]] || 'Visa';

                    return (
                      <Card 
                        key={account._id} 
                        className="rounded-[24px] border-none bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all gap-6 relative overflow-hidden group border border-wise-ink/5"
                      >
                        {/* Dynamic background highlights matching account brand color */}
                        <div 
                          className="absolute inset-y-0 left-0 w-1.5 transition-all"
                          style={{ backgroundColor: account.color || '#3B82F6' }}
                        />

                        {/* Top Info section */}
                        <div className="flex items-start justify-between">
                          <div className="flex flex-col gap-1 pl-1">
                            <h3 className="font-black text-lg text-wise-ink leading-tight flex items-center gap-1.5">
                              {account.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="outline" 
                                className="text-[10px] font-bold uppercase py-0 px-2.5 h-5 rounded-full select-none"
                                style={{ 
                                  borderColor: `${account.color}33`, 
                                  color: account.color,
                                  backgroundColor: `${account.color}0d`
                                }}
                              >
                                {account.type === 'checking' ? 'Checking' :
                                 account.type === 'savings' ? 'Savings' :
                                 account.type === 'investment' ? 'Investment' : 'Credit Card'}
                              </Badge>
                              <span className="text-[10px] text-wise-mute font-medium">{syncStr}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 rounded-full hover:bg-wise-canvas-soft border-none outline-none cursor-pointer"
                                  />
                                }
                              >
                                <MoreVertical className="size-4 text-wise-mute" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem 
                                  onClick={() => triggerRenameModal(account)}
                                  className="cursor-pointer"
                                >
                                  <Edit2 className="size-4 mr-2" />
                                  <span>Rename</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-wise-ink/5" />
                                <DropdownMenuItem 
                                  onClick={() => triggerDeleteModal(account)}
                                  variant="destructive"
                                  className="cursor-pointer"
                                >
                                  <Trash2 className="size-4 mr-2" />
                                  <span>Disconnect</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {/* Credit Card Specific visual flip layout vs standard accounts */}
                        {isCreditCard ? (
                          <div className="flex flex-col md:flex-row gap-6 items-center">
                            {/* Visual 3D card representation using Kibo-UI */}
                            <div className="w-full md:w-1/2 flex justify-center">
                              <CreditCard className="w-full max-w-[260px] aspect-[8560/5398]">
                                <CreditCardFlipper>
                                  <CreditCardFront 
                                    className="p-4 flex flex-col justify-between"
                                    style={{ 
                                      background: `linear-gradient(135deg, ${account.color || '#000'} 0%, #0e0f0c 100%)`,
                                    }}
                                  >
                                    <div className="flex justify-between items-start">
                                      <span className="text-[9px] font-black tracking-wider text-white/80 uppercase">Credit Card</span>
                                      <CreditCardLogo className="static size-7 flex items-center justify-center">
                                        <BuildingIcon className="size-4 text-white/50" />
                                      </CreditCardLogo>
                                    </div>
                                    
                                    <CreditCardChip className="static size-6 mt-2" />
                                    
                                    <CreditCardNumber className="text-[14px] text-zinc-100/90 tracking-widest font-mono mt-3">
                                      •••• •••• •••• 9840
                                    </CreditCardNumber>
                                    
                                    <div className="flex justify-between items-end mt-2">
                                      <div className="flex flex-col">
                                        <span className="text-[7px] uppercase tracking-wider text-zinc-400">Cardholder</span>
                                        <CreditCardName className="text-[9px] font-bold text-zinc-100">{userProfile.name}</CreditCardName>
                                      </div>
                                      <CreditCardServiceProvider type={provider} className="static max-h-5 max-w-10 text-white/80" />
                                    </div>
                                  </CreditCardFront>
                                  <CreditCardBack className="bg-gradient-to-br from-zinc-800 to-zinc-950 p-4 flex flex-col justify-between">
                                    <CreditCardMagStripe />
                                    <div className="flex items-center gap-2 mt-8 bg-zinc-900 border border-white/10 text-white p-1 rounded">
                                      <span className="text-[7px] uppercase tracking-wider font-semibold text-zinc-400">CVV</span>
                                      <CreditCardCvv className="text-[9px] font-bold font-mono">482</CreditCardCvv>
                                    </div>
                                    <p className="text-[6px] text-zinc-400 leading-tight mt-2">
                                      Linked securely through PFM Sync engine. Hover to flip.
                                    </p>
                                  </CreditCardBack>
                                </CreditCardFlipper>
                              </CreditCard>
                            </div>

                            {/* Credit Balance details on the right */}
                            <div className="w-full md:w-1/2 flex flex-col justify-center gap-3">
                              <div>
                                <span className="text-[10px] text-wise-mute font-bold uppercase tracking-wider block">Current Spent</span>
                                <span className="text-2xl font-black text-wise-ink font-mono">
                                  {currencySymbol}{account.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                              
                              <div className="flex justify-between text-xs font-semibold">
                                <span className="text-wise-mute">Available Credit:</span>
                                <span className="text-wise-ink font-mono">{currencySymbol}{availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                              </div>
                              
                              <div className="flex flex-col gap-1">
                                <div className="flex justify-between text-[10px] font-bold text-wise-mute">
                                  <span>LIMIT: {currencySymbol}{limit.toLocaleString('en-IN')}</span>
                                  <span>{usagePercent}% USED</span>
                                </div>
                                <Progress value={usagePercent} className="w-full" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          // Standard Account Layout (Checking / Savings / Investments)
                          <div className="grid grid-cols-2 gap-4 items-end">
                            <div>
                              <span className="text-[10px] text-wise-mute font-bold uppercase tracking-wider block">Current Balance</span>
                              <span className="text-3xl font-black text-wise-ink tracking-tight font-sans">
                                {currencySymbol}{account.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                            
                            <div className="text-right border-l border-wise-ink/5 pl-4">
                              <span className="text-[10px] text-wise-mute font-bold uppercase tracking-wider block">Available Balance</span>
                              <span className="text-lg font-bold text-wise-body font-sans">
                                {currencySymbol}{availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                        )}
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>

          </main>
        </div>
      </SidebarProvider>

      {/* ── Plaid Link Flow Dialog Simulator ── */}
      {isPlaidModalOpen && (
        <Dialog open={isPlaidModalOpen} onOpenChange={setIsPlaidModalOpen}>
          <DialogContent className="sm:max-w-md bg-white rounded-[24px] border-none shadow-2xl p-6">
            <DialogHeader className="pb-2">
              <div className="flex items-center gap-2 text-wise-ink mb-1">
                <span className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center">
                  <Lock className="size-3.5 text-white" />
                </span>
                <DialogTitle className="text-lg font-black tracking-tight">Plaid Link Sandbox</DialogTitle>
              </div>
              <DialogDescription className="text-xs text-wise-mute">
                Connect your account using Plaid API secure link sandbox.
              </DialogDescription>
            </DialogHeader>

            {/* Step 1: Select Popular Bank */}
            {plaidStep === 1 && (
              <div className="flex flex-col gap-4 py-2">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 size-4 text-wise-mute" />
                  <Input 
                    placeholder="Search standard institutions..." 
                    className="pl-9 bg-wise-canvas-soft border-none rounded-xl h-10 text-xs font-semibold focus-visible:ring-wise-green"
                    disabled
                  />
                </div>
                
                <span className="text-[10px] font-bold text-wise-mute uppercase tracking-wider">Select standard bank</span>
                <div className="grid grid-cols-2 gap-2.5">
                  {POPULAR_BANKS.map((bank) => (
                    <button
                      key={bank.name}
                      onClick={() => handleSelectBank(bank)}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-wise-canvas-soft transition-all text-left border border-wise-ink/5 cursor-pointer outline-none active:scale-[0.98]"
                    >
                      <div className={cn("size-8 rounded-lg flex items-center justify-center text-white font-black text-xs", bank.logoBg)}>
                        {bank.name[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-wise-ink leading-tight">{bank.name}</span>
                        <span className="text-[9px] text-wise-mute">Instant link</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-2 pt-3 border-t border-wise-ink/5 flex items-center justify-center gap-1.5 text-[10px] text-wise-mute font-bold">
                  <Lock className="size-3" />
                  <span>Secure 256-bit SSL encrypted connection</span>
                </div>
              </div>
            )}

            {/* Step 2: Configure account details */}
            {plaidStep === 2 && selectedBank && (
              <form onSubmit={handleCreateAccountSubmit} className="flex flex-col gap-4 py-2">
                <div className="flex items-center gap-3 p-3 bg-wise-canvas-soft rounded-xl border border-wise-ink/5">
                  <div className={cn("size-9 rounded-lg flex items-center justify-center text-white font-black text-sm", selectedBank.logoBg)}>
                    {selectedBank.name[0]}
                  </div>
                  <div>
                    <span className="text-[10px] text-wise-mute font-bold uppercase tracking-wider block">Selected Institution</span>
                    <span className="text-xs font-bold text-wise-ink">{selectedBank.name}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-wise-ink">Account Nickname</label>
                  <Input 
                    value={newAccNickname}
                    onChange={(e) => setNewAccNickname(e.target.value)}
                    required
                    placeholder="e.g. Chase Checkings"
                    className="bg-wise-canvas-soft border-none rounded-xl h-11 text-xs font-semibold focus-visible:ring-wise-green"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-wise-ink">Account Type</label>
                    <Select value={newAccType} onValueChange={setNewAccType}>
                      <SelectTrigger className="bg-wise-canvas-soft border-none rounded-xl h-11 text-xs font-semibold">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checking">Checking</SelectItem>
                        <SelectItem value="savings">Savings</SelectItem>
                        <SelectItem value="investment">Investment</SelectItem>
                        <SelectItem value="credit_card">Credit Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-wise-ink">Starting Balance</label>
                    <Input 
                      value={newAccBalance}
                      onChange={(e) => setNewAccBalance(e.target.value)}
                      required
                      type="number"
                      min="0"
                      step="any"
                      placeholder="e.g. 1500"
                      className="bg-wise-canvas-soft border-none rounded-xl h-11 text-xs font-semibold focus-visible:ring-wise-green"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setPlaidStep(1)}
                    className="flex-1 rounded-full h-11 font-bold text-xs"
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit"
                    className="flex-1 bg-wise-ink text-white hover:bg-wise-ink-deep font-bold rounded-full h-11 text-xs cursor-pointer"
                  >
                    Link sandbox account
                  </Button>
                </div>
              </form>
            )}

            {/* Step 3: Verifying Loader */}
            {plaidStep === 3 && (
              <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                <Loader2 className="size-10 text-emerald-500 animate-spin" />
                <div>
                  <h3 className="font-bold text-sm text-wise-ink">Establishing secure handshake...</h3>
                  <p className="text-xs text-wise-mute mt-1">Authenticating credentials with bank servers.</p>
                </div>
              </div>
            )}

            {/* Step 4: Link Success */}
            {plaidStep === 4 && (
              <div className="flex flex-col items-center justify-center py-10 gap-5 text-center">
                <div className="size-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 animate-bounce">
                  <Check className="size-8 stroke-[3]" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-wise-ink">Linked Successfully!</h3>
                  <p className="text-xs text-wise-mute mt-1">Your account balance is synced and ledger transactions are updated.</p>
                </div>
                <Button 
                  onClick={() => setIsPlaidModalOpen(false)}
                  className="bg-wise-ink text-white font-bold rounded-full px-8 h-11 w-full text-xs"
                >
                  Return to Dashboard
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* ── Rename Dialog Modal ── */}
      {isRenameModalOpen && accountToRename && (
        <Dialog open={isRenameModalOpen} onOpenChange={setIsRenameModalOpen}>
          <DialogContent className="sm:max-w-md bg-white rounded-[24px] border-none shadow-2xl p-6">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-lg font-black tracking-tight">Rename Account</DialogTitle>
              <DialogDescription className="text-xs text-wise-mute">
                Change the nickname of your connected account.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleRenameSubmit} className="flex flex-col gap-4 py-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-wise-ink">New Account Nickname</label>
                <Input 
                  value={renameName}
                  onChange={(e) => setRenameName(e.target.value)}
                  required
                  placeholder="e.g. Primary Checkings"
                  className="bg-wise-canvas-soft border-none rounded-xl h-11 text-xs font-semibold focus-visible:ring-wise-green"
                />
              </div>

              <div className="flex items-center gap-2 mt-2">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setIsRenameModalOpen(false)}
                  className="flex-1 rounded-full h-11 font-bold text-xs"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="flex-1 bg-wise-ink text-white hover:bg-wise-ink-deep font-bold rounded-full h-11 text-xs cursor-pointer"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Disconnect Dialog Modal ── */}
      {isDeleteModalOpen && accountToDelete && (
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="sm:max-w-md bg-white rounded-[24px] border-none shadow-2xl p-6">
            <DialogHeader className="pb-2">
              <div className="flex items-center gap-2 text-destructive mb-1">
                <ShieldAlert className="size-5" />
                <DialogTitle className="text-lg font-black tracking-tight">Disconnect Account</DialogTitle>
              </div>
              <DialogDescription className="text-xs text-wise-mute">
                This action is irreversible and will delete all associated transactions.
              </DialogDescription>
            </DialogHeader>

            <div className="py-2 text-xs font-semibold text-wise-body leading-relaxed">
              Are you sure you want to disconnect <span className="font-bold text-wise-ink">{accountToDelete.name}</span>? All sync engines and balance monitoring for this institution will be disabled.
            </div>

            <div className="flex items-center gap-2 mt-2">
              <Button 
                type="button"
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 rounded-full h-11 font-bold text-xs"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDeleteConfirm}
                className="flex-1 bg-destructive text-white hover:bg-destructive/90 font-bold rounded-full h-11 text-xs cursor-pointer"
              >
                Disconnect
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
