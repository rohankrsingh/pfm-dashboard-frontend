import { useState, useEffect } from 'react'
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom'
import { api } from '@/lib/api'
import {
  LayoutDashboard,
  BuildingIcon,
  Receipt,
  ChevronsUpDownIcon,
  SunIcon,
  MoonIcon,
  MonitorIcon,
  PhoneIcon,
  SettingsIcon,
  LifeBuoyIcon,
  LogOutIcon,
  CheckIcon
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
import { Separator } from '@/components/ui/separator'
import { cn } from "@/lib/utils"

const statuses = [
  { value: "available", label: "Available", color: "bg-green-500" },
  { value: "away", label: "Away", color: "bg-amber-500" },
  { value: "busy", label: "Busy", color: "bg-red-500" },
  { value: "offline", label: "Offline", color: "bg-gray-400" },
]

export default function DashboardLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    currency: 'INR'
  })
  const [accounts, setAccounts] = useState([])
  const [status, setStatus] = useState("available")
  const [theme, setTheme] = useState("light")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchLayoutData = async () => {
    try {
      setIsLoading(true)
      setError('')

      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login')
        return
      }

      // Fetch user profile and accounts in parallel
      const [meData, accsData] = await Promise.all([
        api.getMe(),
        api.getAccounts()
      ])

      setUserProfile({
        name: meData.user.name,
        email: meData.user.email,
        currency: 'INR'
      })
      setAccounts(accsData.accounts || [])
    } catch (err) {
      console.error('Failed to load layout data:', err)
      setError(err.message || 'Failed to load layout data')
      if (err.message && err.message.toLowerCase().includes('authorized')) {
        api.logout()
        navigate('/login')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLayoutData()
  }, [])

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const handleLogout = () => {
    api.logout()
    navigate('/')
  }

  const activeStatus = statuses.find((s) => s.value === status) || statuses[0]
  const pageName = location.pathname.startsWith('/accounts')
    ? 'Accounts'
    : location.pathname.startsWith('/transactions')
      ? 'Transactions'
      : location.pathname.startsWith('/settings')
        ? 'Settings'
        : 'Dashboard'

  if (isLoading && accounts.length === 0) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-wise-canvas-soft font-sans gap-4">
        <div className="w-12 h-12 border-4 border-wise-ink border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-bold text-wise-ink uppercase tracking-wider animate-pulse">Loading dashboard...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-wise-canvas-soft font-sans gap-4 p-6 text-center">
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold rounded-2xl max-w-md">
          <p className="font-bold mb-1">Error Loading Dashboard</p>
          <p className="text-xs leading-relaxed opacity-90">{error}</p>
        </div>
        <Button onClick={fetchLayoutData} className="bg-wise-ink text-white font-bold rounded-full px-6 py-2 cursor-pointer">
          Try Again
        </Button>
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
                      render={<Link to="/dashboard" />}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all",
                        location.pathname === "/dashboard"
                          ? "bg-primary text-wise-ink shadow-sm"
                          : "hover:bg-wise-canvas-soft text-wise-mute hover:text-wise-ink"
                      )}
                    >
                      <LayoutDashboard className="size-4 shrink-0" />
                      <span>Dashboard Overview</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      render={<Link to="/accounts" />}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all",
                        location.pathname === "/accounts"
                          ? "bg-primary text-wise-ink shadow-sm"
                          : "hover:bg-wise-canvas-soft text-wise-mute hover:text-wise-ink"
                      )}
                    >
                      <BuildingIcon className="size-4 shrink-0" />
                      <span>Linked Accounts</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      render={<Link to="/transactions" />}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all",
                        location.pathname === "/transactions"
                          ? "bg-primary text-wise-ink shadow-sm"
                          : "hover:bg-wise-canvas-soft text-wise-mute hover:text-wise-ink"
                      )}
                    >
                      <Receipt className="size-4 shrink-0" />
                      <span>Transactions</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      render={<Link to="/settings" />}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all",
                        location.pathname === "/settings"
                          ? "bg-primary text-wise-ink shadow-sm"
                          : "hover:bg-wise-canvas-soft text-wise-mute hover:text-wise-ink"
                      )}
                    >
                      <SettingsIcon className="size-4 shrink-0" />
                      <span>Settings</span>
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
                    <BreadcrumbPage className="font-bold text-wise-ink">{pageName}</BreadcrumbPage>
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
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                    >
                      <span className="flex items-center gap-2">
                        <PhoneIcon className="size-4" aria-hidden="true" />
                        Linked Wallet
                      </span>
                      <Badge variant="secondary" size="sm" className="ml-auto">
                        1
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
                    <DropdownMenuItem
                      onSelect={() => navigate('/settings')}
                      className="cursor-pointer"
                    >
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

          {/* Render nested routes */}
          <Outlet context={{ userProfile, accounts, setAccounts, fetchLayoutData, status, setStatus, theme, setTheme }} />
        </div>
      </SidebarProvider>
    </div>
  )
}
