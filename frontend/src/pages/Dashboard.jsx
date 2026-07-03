import { useState, useEffect } from 'react'
import { useOutletContext, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import {
  Plus,
  Link as LinkIcon,
  TrendingUp,
  ArrowDownRight,
  Sparkles,
  Coins,
  ChevronRight,
  X,
  Percent,
  ArrowUpRight,
  ShoppingCart,
  Car,
  Tv,
  Briefcase,
  Laptop,
  Wallet,
  Receipt,
  Zap,
  CreditCard
} from 'lucide-react'

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/reui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from "@/lib/utils"

const CATEGORY_COLORS = {
  'groceries': '#ffc091',      // Wise Accent Orange
  'food': '#ffc091',           // Wise Accent Orange
  'transport': '#38c8ff',      // Wise Accent Cyan
  'transportation': '#38c8ff', // Wise Accent Cyan
  'entertainment': '#ffd11a',  // Wise Warning Yellow
  'investments': '#9fe870',    // Wise Green Brand CTA
  'other': '#9fe870',          // Wise Green Brand CTA
  'salary': '#2ead4b',         // Positive Green
  'freelance': '#c5edab',      // Wise Green Neutral
  'utilities': '#c5edab',      // Wise Green Neutral
  'loan_payments': '#ff8080',  // Soft Red
}

const CATEGORY_ICONS = {
  'groceries': ShoppingCart,
  'food': ShoppingCart,
  'transport': Car,
  'transportation': Car,
  'entertainment': Tv,
  'investments': TrendingUp,
  'other': TrendingUp,
  'salary': Briefcase,
  'freelance': Laptop,
  'utilities': Zap,
  'loan_payments': CreditCard,
}

export default function Dashboard() {
  const { userProfile, accounts, fetchLayoutData } = useOutletContext()

  // ── States ──
  const [transactions, setTransactions] = useState([])
  const [isTxLoading, setIsTxLoading] = useState(true)
  const [summary, setSummary] = useState({
    totalBalance: 0,
    accountCount: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    monthlyNet: 0,
    expenseByCategory: {}
  })
  const [monthlyHistoryData, setMonthlyHistoryData] = useState([])

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false)
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)

  // Form values
  const [newTxName, setNewTxName] = useState('')
  const [newTxAmount, setNewTxAmount] = useState('')
  const [newTxType, setNewTxType] = useState('expense')
  const [newTxCategory, setNewTxCategory] = useState('Groceries')
  const [newTxPaidBy, setNewTxPaidBy] = useState('visa')
  const [newTxAccountId, setNewTxAccountId] = useState('')
  const [linkBankName, setLinkBankName] = useState('HDFC Bank')
  const [linkBankBalance, setLinkBankBalance] = useState('5000')

  // Mapped accounts for local layout usage
  const mappedAccounts = accounts.map(acc => ({
    id: acc._id,
    platform: acc.name,
    technologies: acc.type === 'checking' ? 'Checking Account' :
      acc.type === 'savings' ? 'Savings Account' :
        acc.type === 'investment' ? 'Investment Portfolio' : 'Credit Card',
    earnings: `₹${acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    rawBalance: acc.balance,
    progressPercentage: 50,
    img: acc.type === 'investment'
      ? 'https://cdn.shadcnstudio.com/ss-assets/blocks/dashboard-application/widgets/bitbank.png'
      : 'https://cdn.shadcnstudio.com/ss-assets/blocks/dashboard-application/widgets/zipcar.png'
  }))

  useEffect(() => {
    if (mappedAccounts.length > 0 && !newTxAccountId) {
      setNewTxAccountId(mappedAccounts[0].id)
    }
  }, [mappedAccounts, newTxAccountId])

  const fetchDashboardSummary = async () => {
    try {
      setIsTxLoading(true)
      const [summaryData, historyData] = await Promise.all([
        api.getDashboardSummary(),
        api.getCashFlowHistory()
      ])
      setSummary(summaryData.summary)
      setMonthlyHistoryData(historyData.history)

      const txsData = summaryData.summary.recentTransactions || []
      const mappedTransactions = txsData.map(tx => {
        const initials = tx.description
          .split(' ')
          .map(w => w[0])
          .join('')
          .toUpperCase()
          .substring(0, 2)

        const catDisplay = tx.category === 'food' ? 'Groceries' :
          tx.category === 'transportation' ? 'Transport' :
            tx.category === 'entertainment' ? 'Entertainment' :
              tx.category === 'salary' ? 'Salary' :
                tx.category === 'other' ? 'Investments' : 'Freelance'

        return {
          id: tx._id,
          avatar: '',
          avatarFallback: initials || 'TX',
          name: tx.description,
          email: catDisplay, // UI uses 'email' field for category name
          amount: tx.amount,
          status: 'paid',
          paidBy: 'bank',
          type: tx.type === 'income' ? 'credit' : 'debit',
          date: new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
        }
      })
      setTransactions(mappedTransactions)
    } catch (err) {
      console.error('Failed to load transactions summary:', err)
      toast.error('Failed to load dashboard data: ' + err.message)
    } finally {
      setIsTxLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardSummary()
  }, [])

  // Handlers
  const handleAddTransaction = async (e) => {
    e.preventDefault()
    if (!newTxName || !newTxAmount || !newTxAccountId) {
      toast.error('Please enter all details and select a linked account first.')
      return
    }

    const amountNum = parseFloat(newTxAmount)
    if (isNaN(amountNum)) return

    try {
      const catMap = {
        'Groceries': 'food',
        'Transport': 'transportation',
        'Entertainment': 'entertainment',
        'Investments': 'other'
      }
      const backendCategory = catMap[newTxCategory] || 'other'

      await api.createTransaction({
        description: newTxName,
        amount: amountNum,
        type: newTxType,
        category: backendCategory,
        accountId: newTxAccountId,
        date: new Date()
      })

      setNewTxName('')
      setNewTxAmount('')
      setNewTxType('expense')
      setNewTxCategory('Groceries')
      setNewTxPaidBy('visa')
      setIsTxModalOpen(false)
      toast.success('Transaction recorded successfully.')

      await Promise.all([
        fetchLayoutData(),
        fetchDashboardSummary()
      ])
    } catch (err) {
      toast.error(err.message || 'Failed to save transaction')
    }
  }

  const handleLinkBank = async (e) => {
    e.preventDefault()
    const balanceNum = parseFloat(linkBankBalance)
    if (!linkBankName || isNaN(balanceNum)) {
      toast.error('Please fill in all account details.')
      return
    }

    try {
      let type = 'checking'
      if (linkBankName.includes('Fidelity') || linkBankName.includes('Coinbase')) {
        type = 'investment'
      }

      const colors = {
        'Fidelity Investments': '#10B981',
        'Bank of America': '#EF4444',
        'Wells Fargo': '#F59E0B',
        'Citibank Checking': '#3B82F6',
        'Coinbase Crypto': '#6366F1',
        'HDFC Bank': '#004C8F',
        'ICICI Bank': '#E35E14',
        'State Bank of India': '#00BFFF',
        'Axis Bank': '#800020',
        'Kotak Mahindra Bank': '#EC1C24'
      }
      const color = colors[linkBankName] || '#3B82F6'

      await api.createAccount(linkBankName, type, balanceNum, color)

      setIsLinkModalOpen(false)
      setLinkBankName('HDFC Bank')
      setLinkBankBalance('5000')
      toast.success(`${linkBankName} linked successfully.`)

      await fetchLayoutData()
    } catch (err) {
      toast.error(err.message || 'Failed to link account')
    }
  }

  // Custom Chart Tooltips
  const CustomDonutTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-primary text-white p-3 rounded-xl shadow-lg border border-white/10 text-xs">
          <p className="font-bold">{data.name}</p>
          <p className="mt-1 font-mono text-primary">₹{data.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({data.percentage.toFixed(1)}%)</p>
        </div>
      )
    }
    return null
  }

  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const inc = payload[0]?.value || 0
      const exp = payload[1]?.value || 0
      const net = inc - exp
      return (
        <div className="bg-primary text-white p-3 rounded-xl shadow-lg border border-white/10 text-xs flex flex-col gap-1.5">
          <p className="font-bold text-muted-foreground border-b border-white/10 pb-1 mb-0.5">{label}</p>
          <div className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-primary" />
              <span>Income</span>
            </span>
            <span className="font-mono font-bold text-primary">₹{inc.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-destructive" />
              <span>Expenses</span>
            </span>
            <span className="font-mono font-bold text-destructive">₹{exp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex items-center justify-between gap-6 border-t border-white/10 pt-1 mt-0.5 font-semibold">
            <span>Net Flow</span>
            <span className={`font-mono ${net >= 0 ? 'text-[#9fe870]' : 'text-[#ffc091]'}`}>
              {net >= 0 ? '+' : ''}₹{net.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      )
    }
    return null
  }

  // ── Dynamic Financial Calculations ──

  // 1. Total Net Worth, Spending, and Income
  const totalBalance = accounts.reduce((sum, acc) => {
    if (acc.type === 'credit_card') return sum - acc.balance
    return sum + acc.balance
  }, 0)
  const totalSpending = summary.monthlyExpenses
  const totalIncome = summary.monthlyIncome

  const debitTransactions = transactions.filter(t => t.type === 'debit')
  const creditTransactions = transactions.filter(t => t.type === 'credit')

  // 3. Savings Rate: (Income - Expenses) / Income * 100
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalSpending) / totalIncome) * 100 : 0

  // ── Trend Metrics (vs Last Month Mock Targets) ──
  const lastMonthBalance = 37200.00
  const balanceTrend = lastMonthBalance > 0 ? ((totalBalance - lastMonthBalance) / lastMonthBalance) * 100 : 0

  const lastMonthSpending = 680.00
  const spendingTrend = lastMonthSpending > 0 ? ((totalSpending - lastMonthSpending) / lastMonthSpending) * 100 : 0

  const lastMonthIncome = 5000.00
  const incomeTrend = lastMonthIncome > 0 ? ((totalIncome - lastMonthIncome) / lastMonthIncome) * 100 : 0

  const lastMonthSavingsRate = ((lastMonthIncome - lastMonthSpending) / lastMonthIncome) * 100
  const savingsRateTrend = savingsRate - lastMonthSavingsRate

  // ── Donut Chart Categorization ──
  const donutData = Object.entries(summary.expenseByCategory || {}).map(([name, value]) => {
    const displayNames = {
      food: 'Groceries',
      transportation: 'Transport',
      entertainment: 'Entertainment',
      salary: 'Salary',
      utilities: 'Utilities',
      healthcare: 'Healthcare',
      shopping: 'Shopping',
      other: 'Investments'
    }
    const displayName = displayNames[name.toLowerCase()] || name
    return {
      name: displayName,
      value,
      percentage: totalSpending > 0 ? (value / totalSpending) * 100 : 0,
      color: CATEGORY_COLORS[name.toLowerCase()] || '#868685'
    }
  }).sort((a, b) => b.value - a.value)


  return (
    <>
      <main className="p-6 md:p-8 flex flex-col gap-6 md:gap-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300">

        {/* Welcome Greeting Row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
              Hello, {userProfile.name}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Here's an overview of your money sandbox as of today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsTxModalOpen(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-[24px] h-12 px-6 cursor-pointer gap-2 transition-all shadow-xs"
            >
              <Plus className="size-4 shrink-0" />
              Add Transaction
            </Button>
            <Button
              onClick={() => setIsLinkModalOpen(true)}
              className="bg-primary text-foreground hover:bg-primary-hover font-bold rounded-[24px] h-12 px-6 cursor-pointer gap-2 transition-all shadow-xs"
            >
              <LinkIcon className="size-4 shrink-0" />
              Sync Bank Account
            </Button>
          </div>
        </div>

        {/* Top Bento Stats Grid: 4 Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isTxLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-[24px] bg-card p-6 h-36 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-2.5 w-24 rounded-full" />
                  <Skeleton className="size-8 rounded-full" />
                </div>
                <div className="space-y-2 mt-auto">
                  <Skeleton className="h-8 w-36 rounded-full" />
                  <Skeleton className="h-2.5 w-24 rounded-full" />
                </div>
              </div>
            ))
          ) : (
            <>
              {/* Card 1: Total Balance */}
              <Card className="rounded-[24px] border-none bg-card p-6 shadow-xs flex flex-col justify-between h-36">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Balance</span>
                  <div className="size-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    <Coins className="size-4" />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-foreground tracking-tight font-sans">
                    ₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {mappedAccounts.length} linked account{mappedAccounts.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </Card>

              {/* Card 2: Monthly Spending */}
              <Card className="rounded-[24px] border-none bg-card p-6 shadow-xs flex flex-col justify-between h-36">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Monthly Spending</span>
                  <div className="size-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    <ArrowDownRight className="size-4 text-destructive" />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-foreground tracking-tight font-sans">
                    ₹{totalSpending.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {debitTransactions.length} expense{debitTransactions.length !== 1 ? 's' : ''} this period
                  </p>
                </div>
              </Card>

              {/* Card 3: Monthly Income */}
              <Card className="rounded-[24px] border-none bg-card p-6 shadow-xs flex flex-col justify-between h-36">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Monthly Income</span>
                  <div className="size-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    <TrendingUp className="size-4 text-success" />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-foreground tracking-tight font-sans">
                    ₹{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {creditTransactions.length} income record{creditTransactions.length !== 1 ? 's' : ''} this period
                  </p>
                </div>
              </Card>

              {/* Card 4: Savings Rate */}
              <Card className="rounded-[24px] border-none bg-card p-6 shadow-xs flex flex-col justify-between h-36">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Savings Rate</span>
                  <div className="size-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    <Percent className="size-4" />
                  </div>
                </div>
                <div>
                  <h3 className={`text-3xl font-black tracking-tight font-sans ${savingsRate >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {savingsRate.toFixed(1)}%
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {savingsRate >= 20 ? 'On track — great work!' : savingsRate > 0 ? 'Room to improve' : 'No income recorded'}
                  </p>
                </div>
              </Card>
            </>
          )}
        </div>

        {/* Main Workspace Grid: 60/40 Split */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 md:gap-8 items-start">

          {/* Left Column (60% Width - lg:col-span-6) */}
          <div className="lg:col-span-6 flex flex-col gap-6 md:gap-8">

            {/* Donut Chart Card */}
            <Card className="rounded-[24px] border-none bg-card p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-foreground">Category Expenses</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Distribution of spending across merchant categories.</p>
                </div>
                <span className="text-[10px] bg-muted text-muted-foreground font-bold uppercase px-2.5 py-0.5 rounded-full">
                  This Month
                </span>
              </div>

              {/* Donut Chart View */}
              <div className="flex flex-col items-center justify-center py-4">
                <div className="w-full max-w-[280px] h-[240px] flex items-center justify-center relative">
                  {donutData.length > 0 ? (
                    <>
                      <PieChart width={280} height={240}>
                        <Pie
                          data={donutData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={95}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {donutData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomDonutTooltip />} />
                      </PieChart>

                      {/* Inner Label for Donut Center */}
                      <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Total Spent</span>
                        <span className="text-xl font-black text-foreground mt-0.5 font-sans">
                          ₹{totalSpending.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-xs text-muted-foreground">No spending recorded.</div>
                  )}
                </div>

                {/* Donut Color Legends */}
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-6 max-w-md animate-in fade-in duration-300">
                  {donutData.map((item, index) => (
                    <div key={index} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="font-semibold">{item.name}</span>
                      <span className="text-muted-foreground font-mono">({item.percentage.toFixed(0)}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Top Categories Table with Progress Bars */}
            <Card className="rounded-[24px] border-none bg-card p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-foreground">Top Spending Sectors</h3>
                <span className="text-xs text-muted-foreground font-semibold">Sorted by amount</span>
              </div>

              <div className="flex flex-col gap-4">
                {donutData.slice(0, 5).map((cat, idx) => (
                  <div key={idx} className="flex flex-col gap-1.5 animate-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                    <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                      <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                        <span>{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span>₹{cat.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        <span className="text-muted-foreground text-[10px]">({cat.percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${cat.percentage}%`,
                          backgroundColor: cat.color
                        }}
                      />
                    </div>
                  </div>
                ))}
                {donutData.length === 0 && (
                  <div className="text-center py-6 text-xs text-muted-foreground">
                    No category data found.
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column (40% Width - lg:col-span-4) */}
          <div className="lg:col-span-4 h-full">
            {/* Recent Activity Ledger Card */}
            <Card className="rounded-[24px] border-none bg-card p-7 shadow-xs flex flex-col justify-between min-h-[500px]">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-lg font-black text-foreground">Recent Activity</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Your sandbox ledger activity</p>
                  </div>
                  <span className="text-[10px] bg-muted text-muted-foreground font-bold uppercase px-2.5 py-1 rounded-full tracking-wider">
                    Live Ledger
                  </span>
                </div>

                <div className="flex flex-col gap-2.5">
                  {isTxLoading ? (
                    <div className="flex flex-col gap-3 py-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 px-2.5 py-2">
                          <Skeleton className="size-11 rounded-full shrink-0" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-3 w-3/4 rounded-full" />
                            <Skeleton className="h-2.5 w-1/2 rounded-full" />
                          </div>
                          <Skeleton className="h-4 w-16 rounded-full" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    transactions.slice(0, 8).map((tx) => {
                      const isCredit = tx.type === 'credit'
                      const IconComponent = CATEGORY_ICONS[tx.email.toLowerCase()] || Wallet
                      const iconColor = CATEGORY_COLORS[tx.email.toLowerCase()] || '#868685'

                      return (
                        <div key={tx.id} className="flex items-center justify-between gap-4 py-2.5 px-2.5 rounded-2xl hover:bg-muted/40 transition-colors cursor-pointer">
                          <div className="flex items-center gap-4 min-w-0">
                            {/* Category-specific icon rendering */}
                            <div
                              className="size-11 rounded-full flex items-center justify-center shrink-0 transition-transform"
                              style={{
                                backgroundColor: `${iconColor}12`,
                                color: iconColor
                              }}
                            >
                              <IconComponent className="size-5.5 shrink-0" />
                            </div>

                            <div className="min-w-0">
                              <p className="text-sm font-bold text-foreground truncate">{tx.name}</p>
                              <div className="flex items-center gap-2.5 mt-1">
                                <span className="text-xs text-muted-foreground">{tx.date}</span>
                                <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-bold uppercase shrink-0">
                                  {tx.email}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className={cn("text-sm font-black shrink-0 tabular-nums", isCredit ? 'text-success' : 'text-destructive')}>
                            {isCredit ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                      )
                    })
                  )}
                  {!isTxLoading && transactions.length === 0 && (
                    <div className="flex flex-col items-center justify-center text-center py-12 px-4 gap-3 animate-in fade-in duration-300">
                      <div className="size-16 rounded-[24px] bg-muted flex items-center justify-center mb-2">
                        <Receipt className="size-8 text-muted-foreground/50" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-foreground">No transactions yet</h4>
                        <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
                          Your recent activity will appear here once you record an expense or income.
                        </p>
                      </div>
                      <Button
                        onClick={() => setIsTxModalOpen(true)}
                        className="bg-muted text-foreground hover:bg-accent font-bold rounded-full h-10 px-5 mt-2 cursor-pointer gap-2 transition-all shadow-none"
                      >
                        <Plus className="size-3.5 shrink-0" />
                        Add First Transaction
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-border/50 pt-5 mt-6">
                <Button
                  variant="ghost"
                  onClick={() => setIsTxModalOpen(true)}
                  className="w-full text-sm font-bold text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 cursor-pointer rounded-full h-12 hover:bg-muted transition-all"
                >
                  <span>Record Sandbox Transaction</span>
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Bottom Section: Full-Width 6-Month Chart */}
        <div className="w-full">
          <Card className="rounded-[24px] border-none bg-card p-6 shadow-xs w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-foreground">Cash Flow Analysis</h3>
                <p className="text-xs text-muted-foreground mt-0.5">6-month comparison of total money in (Teal) vs money out (Red).</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="size-3 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Income</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-3 rounded-full bg-destructive" />
                  <span className="text-muted-foreground">Expenses</span>
                </div>
              </div>
            </div>

            {/* Bar Chart View */}
            <div className="w-full h-[320px]">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={monthlyHistoryData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  barGap={6}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(14, 15, 12, 0.06)" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#868685', fontSize: 11, fontWeight: 600 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `₹${val}`}
                    tick={{ fill: '#868685', fontSize: 10, fontFamily: 'monospace' }}
                  />
                  <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(14, 15, 12, 0.02)' }} />
                  <Bar
                    dataKey="income"
                    fill="#38c8ff" // Wise Accent Cyan
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                  />
                  <Bar
                    dataKey="expenses"
                    fill="#d03238" // Wise Negative Red
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

      </main>

      {/* ── Add Transaction Dialog ── */}
      {isTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-card rounded-3xl w-full max-w-lg p-8 shadow-xl border border-border relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsTxModalOpen(false)}
              aria-label="Close modal"
              className="absolute top-5 right-5 text-muted-foreground hover:text-foreground hover:bg-muted p-2 rounded-full transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <h3 className="text-2xl font-black text-foreground mb-1">Add Manual Transaction</h3>
            <p className="text-sm text-muted-foreground mb-6">Record a cash or un-synced credit transaction manually.</p>

            <form onSubmit={handleAddTransaction} className="space-y-5">
              {/* Type Toggle */}
              <div className="flex rounded-2xl bg-muted p-1 gap-1">
                <button
                  type="button"
                  onClick={() => { setNewTxType('expense'); setNewTxCategory('Groceries') }}
                  className={`flex-1 h-10 rounded-xl text-sm font-bold transition-all cursor-pointer ${newTxType === 'expense' ? 'bg-card text-destructive shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  ↓ Expense
                </button>
                <button
                  type="button"
                  onClick={() => { setNewTxType('income'); setNewTxCategory('Salary') }}
                  className={`flex-1 h-10 rounded-xl text-sm font-bold transition-all cursor-pointer ${newTxType === 'income' ? 'bg-card text-success shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  ↑ Income
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{newTxType === 'income' ? 'Source / Description' : 'Merchant Name'}</label>
                <Input
                  placeholder={newTxType === 'income' ? 'e.g. Salary, Client Payment' : 'e.g. Whole Foods, Gas Station'}
                  value={newTxName}
                  onChange={(e) => setNewTxName(e.target.value)}
                  className="rounded-2xl h-12 px-4 focus:ring-4 focus:ring-primary/20 text-sm font-medium border-border"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Amount (₹)</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newTxAmount}
                  onChange={(e) => setNewTxAmount(e.target.value)}
                  className="rounded-2xl h-12 px-4 focus:ring-4 focus:ring-primary/20 text-sm font-medium border-border"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Account</label>
                <Select value={newTxAccountId} onValueChange={setNewTxAccountId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Account" />
                  </SelectTrigger>
                  <SelectContent>
                    {mappedAccounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>{acc.platform}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Category</label>
                  <Select value={newTxCategory} onValueChange={setNewTxCategory}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {newTxType === 'expense' ? (
                        <>
                          <SelectItem value="Groceries">Groceries</SelectItem>
                          <SelectItem value="Transport">Transport</SelectItem>
                          <SelectItem value="Entertainment">Entertainment</SelectItem>
                          <SelectItem value="Investments">Investments</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="Salary">Salary</SelectItem>
                          <SelectItem value="Freelance">Freelance</SelectItem>
                          <SelectItem value="Investments">Investments</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Method</label>
                  <Select value={newTxPaidBy} onValueChange={setNewTxPaidBy}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Method">
                        {newTxPaidBy === 'visa' && 'Visa card'}
                        {newTxPaidBy === 'mastercard' && 'Mastercard'}
                        {newTxPaidBy === 'cash' && 'Cash wallet'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visa">Visa card</SelectItem>
                      <SelectItem value="mastercard">Mastercard</SelectItem>
                      <SelectItem value="cash">Cash wallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsTxModalOpen(false)}
                  className="rounded-full h-12 px-6 cursor-pointer font-bold transition-all text-sm"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className={`font-bold rounded-full h-12 px-7 cursor-pointer transition-all text-sm shadow-xs ${newTxType === 'income' ? 'bg-success text-white hover:bg-success-deep' : 'bg-primary text-foreground hover:bg-primary-hover'}`}
                >
                  {newTxType === 'income' ? 'Record Income' : 'Save Expense'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Link Bank Account Dialog ── */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-card rounded-3xl w-full max-w-lg p-8 shadow-xl border border-border relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsLinkModalOpen(false)}
              aria-label="Close modal"
              className="absolute top-5 right-5 text-muted-foreground hover:text-foreground hover:bg-muted p-2 rounded-full transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-2 mb-2 text-primary-foreground">
              <Sparkles className="size-5 text-foreground" />
              <h3 className="text-2xl font-black text-foreground">Secure Plaid Sync</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">Link your checking, savings, or brokerage accounts securely using end-to-end sandbox sync.</p>

            <form onSubmit={handleLinkBank} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Financial Institution</label>
                <Select value={linkBankName} onValueChange={setLinkBankName}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Institution" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HDFC Bank">HDFC Bank</SelectItem>
                    <SelectItem value="ICICI Bank">ICICI Bank</SelectItem>
                    <SelectItem value="State Bank of India">State Bank of India</SelectItem>
                    <SelectItem value="Axis Bank">Axis Bank</SelectItem>
                    <SelectItem value="Kotak Mahindra Bank">Kotak Mahindra Bank</SelectItem>
                    <SelectItem value="Fidelity Investments">Fidelity Investments</SelectItem>
                    <SelectItem value="Bank of America">Bank of America</SelectItem>
                    <SelectItem value="Wells Fargo">Wells Fargo</SelectItem>
                    <SelectItem value="Citibank Checking">Citibank Checking</SelectItem>
                    <SelectItem value="Coinbase Crypto">Coinbase Crypto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Estimated Balance (₹)</label>
                <Input
                  type="number"
                  placeholder="5000.00"
                  value={linkBankBalance}
                  onChange={(e) => setLinkBankBalance(e.target.value)}
                  className="rounded-2xl h-12 px-4 focus:ring-4 focus:ring-primary/20 text-sm font-medium border-border"
                  required
                />
              </div>

              <div className="bg-muted p-4 rounded-2xl border border-border/50 space-y-1">
                <span className="text-[11px] font-bold text-muted-foreground uppercase block tracking-wider">Sandbox Mode Notice</span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  No real bank credentials will be stored. Simply click sync below to instantly import mock records for sandbox testing.
                </p>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="rounded-full h-12 px-6 cursor-pointer font-bold transition-all text-sm"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary text-foreground hover:bg-primary-hover font-bold rounded-full h-12 px-7 cursor-pointer transition-all text-sm shadow-xs"
                >
                  Sync & Link Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
