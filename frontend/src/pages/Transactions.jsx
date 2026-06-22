import { useState, useEffect, useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import {
  Search,
  Plus,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Car,
  Tv,
  Briefcase,
  Laptop,
  Wallet,
  Stethoscope,
  Zap,
  TrendingUp,
  TrendingDown,
  Coins,
  MoreHorizontalIcon,
  CalendarIcon,
  Receipt
} from 'lucide-react'

import { Button }   from '@/components/ui/button'
import { Card }     from '@/components/ui/card'
import { Input }    from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge }    from '@/components/reui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'

// ── Design system constants ────────────────────────────────────────────────
const CATEGORY_META = {
  food:           { label: 'Groceries',      icon: ShoppingCart, color: '#ffc091', bg: '#ffc09118' },
  transportation: { label: 'Transport',      icon: Car,          color: '#38c8ff', bg: '#38c8ff18' },
  entertainment:  { label: 'Entertainment',  icon: Tv,           color: '#ffd11a', bg: '#ffd11a18' },
  salary:         { label: 'Salary',         icon: Briefcase,    color: '#2ead4b', bg: '#2ead4b18' },
  other:          { label: 'Other',          icon: Laptop,       color: '#9fe870', bg: '#9fe87018' },
  utilities:      { label: 'Utilities',      icon: Zap,          color: '#a78bfa', bg: '#a78bfa18' },
  healthcare:     { label: 'Healthcare',     icon: Stethoscope,  color: '#f472b6', bg: '#f472b618' },
  shopping:       { label: 'Shopping',       icon: ShoppingCart, color: '#fb923c', bg: '#fb923c18' },
}

const CATEGORIES = Object.entries(CATEGORY_META).map(([value, meta]) => ({
  value,
  label: meta.label
}))

const TYPE_OPTIONS = [
  { value: 'all',     label: 'All Types' },
  { value: 'income',  label: 'Income'    },
  { value: 'expense', label: 'Expenses'  },
]

const SORT_OPTIONS = [
  { value: 'date_desc',   label: 'Newest first'   },
  { value: 'date_asc',    label: 'Oldest first'   },
  { value: 'amount_desc', label: 'Highest amount' },
  { value: 'amount_asc',  label: 'Lowest amount'  },
]

const PAGE_SIZE = 10

// ── Helpers ────────────────────────────────────────────────────────────────
function formatAmount(n) {
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function relativeDate(dateStr) {
  const d     = new Date(dateStr)
  const now   = new Date()
  const diffD = Math.floor((now - d) / 86400000)
  if (diffD === 0) return 'Today'
  if (diffD === 1) return 'Yesterday'
  if (diffD < 7)  return `${diffD}d ago`
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ── Component ──────────────────────────────────────────────────────────────
export default function Transactions() {
  const { accounts, fetchLayoutData } = useOutletContext()

  const [allTransactions, setAllTransactions] = useState([])
  const [isLoading,       setIsLoading]       = useState(true)

  // filters
  const [search,     setSearch]     = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterCat,  setFilterCat]  = useState('all')
  const [filterAcc,  setFilterAcc]  = useState('all')
  const [sortBy,     setSortBy]     = useState('date_desc')
  const [page,       setPage]       = useState(1)

  // add modal
  const [isAddOpen,    setIsAddOpen]    = useState(false)
  const [addDesc,      setAddDesc]      = useState('')
  const [addAmount,    setAddAmount]    = useState('')
  const [addCat,       setAddCat]       = useState('food')
  const [addType,      setAddType]      = useState('expense')
  const [addAccId,     setAddAccId]     = useState('')
  const [addDate,      setAddDate]      = useState(new Date())
  const [addDateOpen,  setAddDateOpen]  = useState(false)
  const [addNotes,     setAddNotes]     = useState('')
  const [isSaving,     setIsSaving]     = useState(false)

  // date range filter
  const [dateRange,     setDateRange]     = useState({ from: undefined, to: undefined })
  const [datePickOpen,  setDatePickOpen]  = useState(false)

  // delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting,   setIsDeleting]   = useState(false)

  // ── fetch ────────────────────────────────────────────────────────────────
  const fetchTransactions = async () => {
    try {
      setIsLoading(true)
      const res = await api.getTransactions()
      setAllTransactions(res.transactions || [])
    } catch (err) {
      console.error('Failed to fetch transactions:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  useEffect(() => {
    if (accounts.length > 0 && !addAccId) setAddAccId(accounts[0]._id)
  }, [accounts])

  // ── filter + sort + paginate ─────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...allTransactions]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(t =>
        t.description.toLowerCase().includes(q) ||
        (CATEGORY_META[t.category]?.label || '').toLowerCase().includes(q)
      )
    }
    if (filterType !== 'all') list = list.filter(t => t.type === filterType)
    if (filterCat  !== 'all') list = list.filter(t => t.category === filterCat)
    if (filterAcc  !== 'all') list = list.filter(t => (t.accountId?._id || t.accountId) === filterAcc)
    if (dateRange.from) list = list.filter(t => new Date(t.date) >= dateRange.from)
    if (dateRange.to)   list = list.filter(t => new Date(t.date) <= new Date(dateRange.to.setHours(23,59,59,999)))

    list.sort((a, b) => {
      switch (sortBy) {
        case 'date_asc':    return new Date(a.date) - new Date(b.date)
        case 'amount_desc': return b.amount - a.amount
        case 'amount_asc':  return a.amount - b.amount
        default:            return new Date(b.date) - new Date(a.date)
      }
    })
    return list
  }, [allTransactions, search, filterType, filterCat, filterAcc, sortBy, dateRange])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => { setPage(1) }, [search, filterType, filterCat, filterAcc, sortBy, dateRange])

  // ── summary stats ─────────────────────────────────────────────────────────
  const totalIncome  = allTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = allTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const netFlow      = totalIncome - totalExpense

  // ── handlers ─────────────────────────────────────────────────────────────
  const handleAdd = async (e) => {
    e.preventDefault()
    if (!addDesc || !addAmount || !addAccId) return
    setIsSaving(true)
    try {
      await api.createTransaction({
        description: addDesc,
        amount: parseFloat(addAmount),
        type: addType,
        category: addCat,
        accountId: addAccId,
        date: new Date(addDate),
        notes: addNotes
      })
      setIsAddOpen(false)
      setAddDesc(''); setAddAmount(''); setAddNotes('')
      setAddCat('food'); setAddType('expense')
      setAddDate(new Date())
      toast.success('Transaction saved successfully.')
      await Promise.all([fetchTransactions(), fetchLayoutData()])
    } catch (err) {
      toast.error(err.message || 'Failed to save transaction')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await api.deleteTransaction(deleteTarget._id)
      setDeleteTarget(null)
      toast.success('Transaction deleted — balance updated.')
      await Promise.all([fetchTransactions(), fetchLayoutData()])
    } catch (err) {
      toast.error(err.message || 'Failed to delete transaction')
    } finally {
      setIsDeleting(false)
    }
  }

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <>
      <main className="p-6 md:p-8 flex flex-col gap-6 md:gap-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300">

        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-wise-ink">Transactions</h1>
            <p className="text-xs text-wise-mute mt-0.5">
              Full ledger — {allTransactions.length} records across all linked accounts
            </p>
          </div>
          <Button
            onClick={() => setIsAddOpen(true)}
            className="bg-wise-ink text-white hover:bg-wise-ink-deep font-bold rounded-full h-12 px-6 gap-2 cursor-pointer shadow-xs"
          >
            <Plus className="size-4 shrink-0" />
            Record Transaction
          </Button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="rounded-[24px] border-none bg-white p-6 shadow-xs flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-wise-mute uppercase tracking-wider">Total Income</span>
              <div className="size-8 rounded-full bg-wise-green-pale flex items-center justify-center">
                <TrendingUp className="size-4 text-wise-positive" />
              </div>
            </div>
            <span className="text-2xl font-black text-wise-ink tracking-tight">{formatAmount(totalIncome)}</span>
            <span className="text-[10px] text-wise-mute font-semibold">
              {allTransactions.filter(t => t.type === 'income').length} income records
            </span>
          </Card>

          <Card className="rounded-[24px] border-none bg-white p-6 shadow-xs flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-wise-mute uppercase tracking-wider">Total Expenses</span>
              <div className="size-8 rounded-full bg-red-50 flex items-center justify-center">
                <TrendingDown className="size-4 text-wise-negative" />
              </div>
            </div>
            <span className="text-2xl font-black text-wise-ink tracking-tight">{formatAmount(totalExpense)}</span>
            <span className="text-[10px] text-wise-mute font-semibold">
              {allTransactions.filter(t => t.type === 'expense').length} expense records
            </span>
          </Card>

          <Card className="rounded-[24px] border-none bg-white p-6 shadow-xs flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-wise-mute uppercase tracking-wider">Net Cash Flow</span>
              <div className={cn("size-8 rounded-full flex items-center justify-center", netFlow >= 0 ? "bg-wise-green-pale" : "bg-red-50")}>
                <Coins className={cn("size-4", netFlow >= 0 ? "text-wise-positive" : "text-wise-negative")} />
              </div>
            </div>
            <span className={cn("text-2xl font-black tracking-tight", netFlow >= 0 ? "text-wise-positive" : "text-wise-negative")}>
              {netFlow >= 0 ? '+' : ''}{formatAmount(netFlow)}
            </span>
            <div className="w-full bg-wise-canvas-soft rounded-full h-1.5 overflow-hidden mt-1">
              <div
                className={cn("h-full rounded-full transition-all duration-500", netFlow >= 0 ? "bg-wise-positive" : "bg-wise-negative")}
                style={{ width: totalIncome > 0 ? `${Math.min(100, (Math.min(totalIncome, totalExpense) / Math.max(totalIncome, totalExpense)) * 100)}%` : '0%' }}
              />
            </div>
          </Card>
        </div>

        {/* Filter bar */}
        <Card className="rounded-[24px] border-none bg-white p-4 md:p-5 shadow-xs">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-wise-mute size-4 pointer-events-none" />
              <Input
                placeholder="Search transactions…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 h-10 rounded-full border-wise-ink/10 text-sm bg-wise-canvas-soft focus:bg-white transition-colors"
              />
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-36 h-10 rounded-full border-wise-ink/10 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={filterCat} onValueChange={setFilterCat}>
              <SelectTrigger className="w-full md:w-40 h-10 rounded-full border-wise-ink/10 text-sm">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={filterAcc} onValueChange={setFilterAcc}>
              <SelectTrigger className="w-full md:w-44 h-10 rounded-full border-wise-ink/10 text-sm">
                <SelectValue placeholder="All Accounts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                {accounts.map(a => <SelectItem key={a._id} value={a._id}>{a.name}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-40 h-10 rounded-full border-wise-ink/10 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>

            {/* Date range picker */}
            <Popover open={datePickOpen} onOpenChange={setDatePickOpen}>
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    className={cn(
                      'h-10 rounded-full border-wise-ink/10 text-sm font-semibold gap-2 px-4 justify-between min-w-[160px] cursor-pointer',
                      (dateRange.from || dateRange.to) ? 'border-wise-green text-wise-ink bg-wise-green-pale/30' : 'text-wise-mute'
                    )}
                  />
                }
              >
                <CalendarIcon className="size-4 shrink-0" />
                <span className="truncate text-xs">
                  {dateRange.from && dateRange.to
                    ? `${format(dateRange.from, 'dd MMM')} – ${format(dateRange.to, 'dd MMM')}`
                    : dateRange.from
                      ? `From ${format(dateRange.from, 'dd MMM')}`
                      : 'Date range'}
                </span>
                {(dateRange.from || dateRange.to) && (
                  <span
                    role="button"
                    onClick={(e) => { e.stopPropagation(); setDateRange({ from: undefined, to: undefined }) }}
                    className="ml-auto text-wise-mute hover:text-wise-ink cursor-pointer"
                  >
                    <X className="size-3" />
                  </span>
                )}
              </PopoverTrigger>
              <PopoverContent align="end" className="w-auto p-0">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => {
                    setDateRange(range || { from: undefined, to: undefined })
                    if (range?.from && range?.to) setDatePickOpen(false)
                  }}
                  initialFocus
                />
                {(dateRange.from || dateRange.to) && (
                  <div className="p-3 pt-0 border-t border-wise-ink/5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs font-bold rounded-full cursor-pointer text-wise-mute hover:text-wise-negative"
                      onClick={() => { setDateRange({ from: undefined, to: undefined }); setDatePickOpen(false) }}
                    >
                      Clear date range
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>

          {/* Active filter chips */}
          {(filterType !== 'all' || filterCat !== 'all' || filterAcc !== 'all' || search || dateRange.from || dateRange.to) && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-wise-ink/5">
              <span className="text-[10px] font-bold text-wise-mute uppercase tracking-wider self-center">Active:</span>
              {search && (
                <button onClick={() => setSearch('')} className="flex items-center gap-1 text-xs font-semibold bg-wise-canvas-soft px-2.5 py-1 rounded-full hover:bg-wise-ink/10 transition-colors cursor-pointer">
                  "{search}" <X className="size-3" />
                </button>
              )}
              {filterType !== 'all' && (
                <button onClick={() => setFilterType('all')} className="flex items-center gap-1 text-xs font-semibold bg-wise-canvas-soft px-2.5 py-1 rounded-full hover:bg-wise-ink/10 transition-colors capitalize cursor-pointer">
                  {filterType} <X className="size-3" />
                </button>
              )}
              {filterCat !== 'all' && (
                <button onClick={() => setFilterCat('all')} className="flex items-center gap-1 text-xs font-semibold bg-wise-canvas-soft px-2.5 py-1 rounded-full hover:bg-wise-ink/10 transition-colors cursor-pointer">
                  {CATEGORY_META[filterCat]?.label || filterCat} <X className="size-3" />
                </button>
              )}
              {filterAcc !== 'all' && (
                <button onClick={() => setFilterAcc('all')} className="flex items-center gap-1 text-xs font-semibold bg-wise-canvas-soft px-2.5 py-1 rounded-full hover:bg-wise-ink/10 transition-colors cursor-pointer">
                  {accounts.find(a => a._id === filterAcc)?.name || 'Account'} <X className="size-3" />
                </button>
              )}
              {(dateRange.from || dateRange.to) && (
                <button onClick={() => setDateRange({ from: undefined, to: undefined })} className="flex items-center gap-1 text-xs font-semibold bg-wise-green-pale/40 text-wise-ink px-2.5 py-1 rounded-full hover:bg-wise-ink/10 transition-colors cursor-pointer">
                  <CalendarIcon className="size-3" />
                  {dateRange.from && dateRange.to
                    ? `${format(dateRange.from, 'dd MMM')} – ${format(dateRange.to, 'dd MMM')}`
                    : dateRange.from ? `From ${format(dateRange.from, 'dd MMM')}` : ''}
                  <X className="size-3" />
                </button>
              )}
            </div>
          )}
        </Card>

        {/* Table card */}
        <Card className="rounded-[24px] border-none bg-white shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="divide-y divide-wise-ink/5">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <Skeleton className="size-10 rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-2 min-w-0">
                    <Skeleton className="h-3 w-2/5 rounded-full" />
                    <Skeleton className="h-2.5 w-1/4 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-20 rounded-full hidden sm:block" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="size-6 rounded-full" />
                </div>
              ))}
            </div>
          ) : paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-6">
              <div className="size-14 rounded-2xl bg-wise-canvas-soft flex items-center justify-center">
                <Wallet className="size-7 text-wise-mute opacity-50" />
              </div>
              <div>
                <p className="text-sm font-bold text-wise-ink">No transactions found</p>
                <p className="text-xs text-wise-mute mt-1 max-w-xs">
                  {allTransactions.length === 0
                    ? 'Record your first transaction to get started.'
                    : 'Try adjusting your search filters.'}
                </p>
              </div>
              {allTransactions.length === 0 && (
                <Button
                  onClick={() => setIsAddOpen(true)}
                  className="mt-2 bg-primary text-wise-ink font-bold h-10 px-5 rounded-full text-xs cursor-pointer hover:bg-wise-green-hover"
                >
                  <Plus className="size-3.5 mr-1.5" /> Add first transaction
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-wise-ink/5 bg-wise-canvas-soft/60 hover:bg-wise-canvas-soft/60">
                    <TableHead className="pl-6 text-[10px] font-bold text-wise-mute uppercase tracking-wider h-11">Transaction</TableHead>
                    <TableHead className="hidden sm:table-cell text-[10px] font-bold text-wise-mute uppercase tracking-wider h-11">Account</TableHead>
                    <TableHead className="hidden md:table-cell text-[10px] font-bold text-wise-mute uppercase tracking-wider h-11">Category</TableHead>
                    <TableHead className="text-[10px] font-bold text-wise-mute uppercase tracking-wider h-11">Date</TableHead>
                    <TableHead className="text-right text-[10px] font-bold text-wise-mute uppercase tracking-wider h-11">Amount</TableHead>
                    <TableHead className="w-10 pr-4" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((tx) => {
                    const meta     = CATEGORY_META[tx.category] || CATEGORY_META['other']
                    const Icon     = meta.icon
                    const isIncome = tx.type === 'income'
                    const accName  = tx.accountId?.name || accounts.find(a => a._id === tx.accountId)?.name || '—'

                    return (
                      <TableRow
                        key={tx._id}
                        className="border-wise-ink/[0.04] hover:bg-wise-canvas-soft/40 transition-colors"
                      >
                        {/* Description */}
                        <TableCell className="pl-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className="size-9 rounded-xl flex items-center justify-center shrink-0"
                              style={{ backgroundColor: meta.bg, color: meta.color }}
                            >
                              <Icon className="size-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-wise-ink truncate max-w-[160px] md:max-w-none">
                                {tx.description}
                              </p>
                              {tx.notes && (
                                <p className="text-[10px] text-wise-mute truncate max-w-[120px] hidden sm:block">{tx.notes}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Account */}
                        <TableCell className="hidden sm:table-cell py-3.5">
                          <span className="text-xs font-semibold text-wise-body truncate max-w-[110px] block">
                            {accName}
                          </span>
                        </TableCell>

                        {/* Category badge */}
                        <TableCell className="hidden md:table-cell py-3.5">
                          <Badge
                            variant="secondary"
                            size="sm"
                            className="font-bold text-[10px] rounded-full px-2"
                            style={{ backgroundColor: meta.bg, color: meta.color, border: 'none' }}
                          >
                            {meta.label}
                          </Badge>
                        </TableCell>

                        {/* Date */}
                        <TableCell className="py-3.5">
                          <span className="text-xs text-wise-mute font-semibold whitespace-nowrap">
                            {relativeDate(tx.date)}
                          </span>
                        </TableCell>

                        {/* Amount */}
                        <TableCell className="text-right py-3.5">
                          <span className={cn(
                            "text-sm font-black tabular-nums whitespace-nowrap",
                            isIncome ? "text-wise-positive" : "text-wise-negative"
                          )}>
                            {isIncome ? '+' : '−'}{formatAmount(tx.amount)}
                          </span>
                        </TableCell>

                        {/* Actions — three-dot dropdown */}
                        <TableCell className="pr-4 py-3.5">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 rounded-full cursor-pointer text-wise-mute hover:text-wise-ink hover:bg-wise-canvas-soft"
                                />
                              }
                            >
                              <MoreHorizontalIcon className="size-4" />
                              <span className="sr-only">Open actions</span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem
                                className="text-xs font-semibold cursor-pointer"
                                onSelect={() => {
                                  navigator.clipboard?.writeText(tx._id)
                                }}
                              >
                                Copy ID
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                className="text-xs font-semibold cursor-pointer"
                                onSelect={() => setDeleteTarget(tx)}
                              >
                                <Trash2 className="size-3.5 mr-1.5" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              {/* Pagination footer */}
              {filtered.length > PAGE_SIZE && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-wise-ink/5 bg-wise-canvas-soft/40">
                  <span className="text-xs text-wise-mute font-semibold">
                    {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="h-8 w-8 rounded-full cursor-pointer hover:bg-wise-canvas-soft disabled:opacity-30"
                    >
                      <ChevronLeft className="size-4" />
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                      .reduce((acc, p, idx, arr) => {
                        if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…')
                        acc.push(p)
                        return acc
                      }, [])
                      .map((item, idx) =>
                        item === '…' ? (
                          <span key={`el-${idx}`} className="text-xs text-wise-mute px-1">…</span>
                        ) : (
                          <Button
                            key={item}
                            variant="ghost"
                            size="icon"
                            onClick={() => setPage(item)}
                            className={cn(
                              "h-8 w-8 rounded-full text-xs font-bold cursor-pointer",
                              page === item
                                ? "bg-wise-ink text-white hover:bg-wise-ink"
                                : "hover:bg-wise-canvas-soft text-wise-body"
                            )}
                          >
                            {item}
                          </Button>
                        )
                      )
                    }
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="h-8 w-8 rounded-full cursor-pointer hover:bg-wise-canvas-soft disabled:opacity-30"
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>

      </main>

      {/* ── Add Transaction Modal ── */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-xl border border-wise-ink/10 relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsAddOpen(false)}
              className="absolute top-5 right-5 text-wise-body hover:text-wise-ink hover:bg-wise-canvas-soft p-2 rounded-full transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <h3 className="text-2xl font-black text-wise-ink mb-1">Record Transaction</h3>
            <p className="text-sm text-wise-body mb-6">Log a manual transaction to your ledger.</p>

            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-wise-body uppercase tracking-wider">Description</label>
                <Input
                  placeholder="e.g. Swiggy order, petrol, salary credit"
                  value={addDesc}
                  onChange={e => setAddDesc(e.target.value)}
                  className="rounded-2xl h-12 px-4 border-wise-ink/15 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-wise-body uppercase tracking-wider">Amount (₹)</label>
                  <Input
                    type="number" step="0.01" min="0.01" placeholder="0.00"
                    value={addAmount}
                    onChange={e => setAddAmount(e.target.value)}
                    className="rounded-2xl h-12 px-4 border-wise-ink/15 text-sm"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-wise-body uppercase tracking-wider">Type</label>
                  <Select value={addType} onValueChange={setAddType}>
                    <SelectTrigger className="w-full h-12 rounded-2xl border-wise-ink/15">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-wise-body uppercase tracking-wider">Category</label>
                  <Select value={addCat} onValueChange={setAddCat}>
                    <SelectTrigger className="w-full h-12 rounded-2xl border-wise-ink/15">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-wise-body uppercase tracking-wider">Account</label>
                  <Select value={addAccId} onValueChange={setAddAccId}>
                    <SelectTrigger className="w-full h-12 rounded-2xl border-wise-ink/15">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map(a => <SelectItem key={a._id} value={a._id}>{a.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Date — Calendar Popover */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-wise-body uppercase tracking-wider">Date</label>
                  <Popover open={addDateOpen} onOpenChange={setAddDateOpen}>
                    <PopoverTrigger
                      render={
                        <Button
                          variant="outline"
                          className="w-full h-12 rounded-2xl border-wise-ink/15 text-sm font-semibold justify-between px-4 cursor-pointer text-left"
                        />
                      }
                    >
                      <span className="text-wise-ink">
                        {addDate ? format(addDate, 'dd MMM yyyy') : 'Pick a date'}
                      </span>
                      <CalendarIcon className="size-4 text-wise-mute shrink-0" />
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={addDate}
                        onSelect={(d) => {
                          if (d) { setAddDate(d); setAddDateOpen(false) }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-wise-body uppercase tracking-wider">Notes (optional)</label>
                  <Input
                    placeholder="Reference, tag…"
                    value={addNotes}
                    onChange={e => setAddNotes(e.target.value)}
                    className="rounded-2xl h-12 px-4 border-wise-ink/15 text-sm"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)}
                  className="rounded-full h-12 px-6 font-bold text-sm cursor-pointer">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}
                  className="bg-wise-ink text-white hover:bg-wise-ink-deep font-bold rounded-full h-12 px-7 text-sm cursor-pointer">
                  {isSaving ? 'Saving…' : 'Save Transaction'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-xl border border-wise-ink/10 animate-in zoom-in-95 duration-150">
            <div className="size-12 rounded-full bg-red-100 flex items-center justify-center text-wise-negative border border-red-200 mb-4">
              <Trash2 className="size-5" />
            </div>
            <h3 className="text-xl font-black text-wise-ink mb-1">Delete transaction?</h3>
            <p className="text-xs text-wise-body mb-2 leading-relaxed font-semibold">
              {deleteTarget.description} — {formatAmount(deleteTarget.amount)}
            </p>
            <p className="text-xs text-wise-mute mb-6 leading-relaxed">
              This reverses the balance on the linked account and cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-full h-11 font-bold text-xs cursor-pointer">
                Cancel
              </Button>
              <Button onClick={handleDelete} disabled={isDeleting}
                className="flex-1 bg-wise-negative text-white hover:bg-red-700 font-bold rounded-full h-11 text-xs cursor-pointer">
                {isDeleting ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
