import { useState, useEffect } from 'react'
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom'
import { api } from '@/lib/api'
import Logo from '@/components/common/Logo'
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
  CheckIcon,
  Target
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
import { useTheme } from '@/components/common/ThemeProvider'

export default function DashboardLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    currency: 'INR'
  })
  const [accounts, setAccounts] = useState([])

  const { theme, setTheme } = useTheme()
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

  const handleLogout = () => {
    api.logout()
    navigate('/')
  }


  const pageName = location.pathname.startsWith('/accounts')
    ? 'Accounts'
    : location.pathname.startsWith('/transactions')
      ? 'Transactions'
      : location.pathname.startsWith('/budgets')
        ? 'Budgets & Goals'
        : location.pathname.startsWith('/settings')
        ? 'Settings'
        : 'Dashboard'

  if (isLoading && accounts.length === 0) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-muted font-sans gap-4">
        <div className="w-12 h-12 border-4 border-border border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-bold text-foreground uppercase tracking-wider animate-pulse">Loading dashboard...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-muted font-sans gap-4 p-6 text-center">
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold rounded-2xl max-w-md">
          <p className="font-bold mb-1">Error Loading Dashboard</p>
          <p className="text-xs leading-relaxed opacity-90">{error}</p>
        </div>
        <Button onClick={fetchLayoutData} className="bg-primary text-primary-foreground font-bold rounded-full px-6 py-2 cursor-pointer">
          Retry Connection
        </Button>
      </div>
    )
  }

  return (
    <div className='flex min-h-dvh w-full text-foreground bg-background font-sans pb-16 md:pb-0'>
      <SidebarProvider>
        {/* Sidebar Layout */}
        <Sidebar className="border-r border-border bg-card">
          <SidebarContent className="bg-card">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem className="mb-4">
                    <div className="flex items-center gap-2.5 px-3 py-4">
                      <Logo showText={false} />
                      <div className="flex flex-col">
                        <span className="text-base font-black tracking-tight text-foreground">PFM Sync</span>
                        <span className="text-[10px] font-semibold text-muted-foreground">Internship Project</span>
                      </div>
                    </div>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-muted-foreground font-bold text-xs uppercase px-3">PFM Management</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="px-1.5 space-y-1">
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      render={<Link to="/dashboard" />}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all",
                        location.pathname === "/dashboard"
                          ? "bg-primary text-foreground shadow-sm"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
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
                          ? "bg-primary text-foreground shadow-sm"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
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
                          ? "bg-primary text-foreground shadow-sm"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Receipt className="size-4 shrink-0" />
                      <span>Transactions</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      render={<Link to="/budgets" />}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all",
                        location.pathname === "/budgets"
                          ? "bg-primary text-foreground shadow-sm"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Target className="size-4 shrink-0" />
                      <span>Budgets & Goals</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      render={<Link to="/settings" />}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all",
                        location.pathname === "/settings"
                          ? "bg-primary text-foreground shadow-sm"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
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
          <header className='bg-background h-16 border-b border-border flex items-center justify-between px-6 sticky top-0 z-40 backdrop-blur-md bg-background/95'>
            <div className='flex items-center gap-4'>
              <div className="hidden md:block">
                <SidebarTrigger className='[&_svg]:size-5! hover:bg-muted p-2 rounded-xl transition-colors cursor-pointer' />
              </div>
              <Separator orientation='vertical' className='hidden h-4! sm:block bg-primary/15' />
              <Breadcrumb className='hidden sm:block'>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink render={<Link to="/" />}>Home</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-bold text-foreground">{pageName}</BreadcrumbPage>
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
                      className="flex items-center gap-2 px-3 py-1.5 h-10 rounded-xl hover:bg-muted cursor-pointer text-xs font-semibold text-muted-foreground hover:text-foreground border-none outline-none" 
                    />
                  }
                >
                  <Avatar size="sm">
                    <AvatarImage src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png" />
                    <AvatarFallback>EV</AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-bold text-foreground">{userProfile.name}</span>
                  <ChevronsUpDownIcon className="size-3.5 text-muted-foreground ml-1 opacity-60" aria-hidden="true" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-60" align="end" sideOffset={8}>
                  <div className="flex items-center gap-3 px-1 pt-1.5 pb-2">
                    <Avatar className="size-9">
                      <AvatarImage src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png" />
                      <AvatarFallback>EV</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-foreground text-sm font-bold leading-tight">
                        {userProfile.name}
                      </span>
                      <span className="text-muted-foreground text-xs leading-tight">
                        {userProfile.email}
                      </span>
                    </div>
                  </div>
                  
                  {/* Theme Selector */}
                  <div className="py-2 px-1">
                    <Tabs value={theme} onValueChange={setTheme}>
                      <TabsList className="w-full bg-muted p-1 rounded-xl flex h-10 items-center">
                        <TabsTrigger value="light" className="h-8 flex-1 text-xs font-semibold flex items-center justify-center rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground text-muted-foreground transition-all cursor-pointer">
                          <SunIcon className="size-4" aria-hidden="true" />
                        </TabsTrigger>
                        <TabsTrigger value="dark" className="h-8 flex-1 text-xs font-semibold flex items-center justify-center rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground text-muted-foreground transition-all cursor-pointer">
                          <MoonIcon className="size-4" aria-hidden="true" />
                        </TabsTrigger>
                        <TabsTrigger value="system" className="h-8 flex-1 text-xs font-semibold flex items-center justify-center rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground text-muted-foreground transition-all cursor-pointer">
                          <MonitorIcon className="size-4" aria-hidden="true" />
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  
                  <DropdownMenuSeparator className="bg-primary/5" />
                  
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
                    {/* Hide Linked Wallet since we don't have that feature built yet */}
                  </DropdownMenuGroup>
                  
                  <DropdownMenuSeparator className="bg-primary/5" />
                  
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onSelect={() => navigate('/settings')}
                      className="cursor-pointer"
                    >
                      <SettingsIcon className="size-4" aria-hidden="true" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => toast.success("Help center coming soon")}
                      className="cursor-pointer"
                    >
                      <LifeBuoyIcon className="size-4" aria-hidden="true" />
                      Help Center
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  
                  <DropdownMenuSeparator className="bg-primary/5" />
                  
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
          <Outlet context={{ userProfile, accounts, setAccounts, fetchLayoutData, theme, setTheme }} />
        </div>
      </SidebarProvider>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full bg-background border-t border-border flex items-center justify-around h-16 z-50 px-2 pb-safe">
        <Link 
          to="/dashboard" 
          className={cn(
            "flex flex-col items-center justify-center w-full h-full gap-1 text-[10px] font-medium transition-colors",
            location.pathname === "/dashboard" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <LayoutDashboard className="size-5" />
          <span>Home</span>
        </Link>
        <Link 
          to="/accounts" 
          className={cn(
            "flex flex-col items-center justify-center w-full h-full gap-1 text-[10px] font-medium transition-colors",
            location.pathname === "/accounts" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <BuildingIcon className="size-5" />
          <span>Accounts</span>
        </Link>
        <Link 
          to="/transactions" 
          className={cn(
            "flex flex-col items-center justify-center w-full h-full gap-1 text-[10px] font-medium transition-colors",
            location.pathname === "/transactions" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Receipt className="size-5" />
          <span>Activity</span>
        </Link>
        <Link 
          to="/budgets" 
          className={cn(
            "flex flex-col items-center justify-center w-full h-full gap-1 text-[10px] font-medium transition-colors",
            location.pathname === "/budgets" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Target className="size-5" />
          <span>Budgets</span>
        </Link>
      </nav>
    </div>
  )
}
