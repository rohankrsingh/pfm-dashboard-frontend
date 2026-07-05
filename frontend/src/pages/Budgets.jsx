import { useState, useEffect, useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import {
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  Target,
  ShoppingCart,
  Car,
  Tv,
  Briefcase,
  Laptop,
  Zap,
  Stethoscope,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { cn } from '@/lib/utils'

// ── Constants ─────────────────────────────────────────────────────────────
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

function formatAmount(n) {
  return `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export default function Budgets() {
  const { userProfile } = useOutletContext()
  
  // State
  const [budgets, setBudgets] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add') // 'add' | 'edit'
  const [editId, setEditId] = useState(null)
  const [formData, setFormData] = useState({ category: '', amount: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Derived Data
  const currentMonthStr = format(currentDate, 'yyyy-MM')
  
  const { totalBudgeted, totalSpent } = useMemo(() => {
    return budgets.reduce((acc, b) => {
      acc.totalBudgeted += b.amount
      acc.totalSpent += b.spent
      return acc
    }, { totalBudgeted: 0, totalSpent: 0 })
  }, [budgets])

  // ── Data Fetching ───────────────────────────────────────────────────────
  const fetchBudgets = async () => {
    try {
      setIsLoading(true)
      const res = await api.getBudgets(currentMonthStr)
      setBudgets(res.budgets || [])
    } catch (err) {
      toast.error(err.message || 'Failed to fetch budgets')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBudgets()
  }, [currentMonthStr])

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handlePrevMonth = () => {
    setCurrentDate(prev => {
      const d = new Date(prev)
      d.setMonth(d.getMonth() - 1)
      return d
    })
  }

  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const d = new Date(prev)
      d.setMonth(d.getMonth() + 1)
      return d
    })
  }

  const handleOpenAddModal = () => {
    setModalMode('add')
    setFormData({ category: '', amount: '' })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (budget) => {
    setModalMode('edit')
    setEditId(budget._id)
    setFormData({ category: budget.category, amount: budget.amount })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.category || !formData.amount) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      setIsSubmitting(true)
      if (modalMode === 'add') {
        await api.createBudget({
          ...formData,
          amount: Number(formData.amount),
          month: currentMonthStr
        })
        toast.success('Budget created successfully')
      } else {
        await api.updateBudget(editId, {
          amount: Number(formData.amount)
        })
        toast.success('Budget updated')
      }
      setIsModalOpen(false)
      fetchBudgets()
    } catch (err) {
      toast.error(err.message || 'Failed to save budget')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return
    
    try {
      await api.deleteBudget(id)
      toast.success('Budget deleted')
      fetchBudgets()
    } catch (err) {
      toast.error(err.message || 'Failed to delete budget')
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────
  const overspentTotal = totalSpent > totalBudgeted
  const totalPercentage = totalBudgeted > 0 ? Math.min(100, (totalSpent / totalBudgeted) * 100) : 0

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8 flex flex-col gap-8 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Budgets</h1>
          <p className="text-sm font-semibold text-muted-foreground mt-1">
            Set limits and track your spending goals
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-card rounded-full p-1 border border-border/50 shadow-xs">
            <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-10 w-10 rounded-full hover:bg-muted shrink-0">
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-sm font-bold w-24 text-center">{format(currentDate, 'MMMM yyyy')}</span>
            <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-10 w-10 rounded-full hover:bg-muted shrink-0">
              <ChevronRight className="size-4" />
            </Button>
          </div>
          <Button 
            onClick={handleOpenAddModal}
            className="bg-primary hover:bg-primary/90 text-foreground font-bold rounded-full h-11 px-6 shadow-xs cursor-pointer"
          >
            <Plus className="size-4 mr-2" />
            New Budget
          </Button>
        </div>
      </div>

      {/* Overview Card */}
      <Card className="rounded-[24px] border-none bg-card p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Target className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-6">Monthly Overview</h3>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-1">Total Spent</p>
              <div className="flex items-baseline gap-2">
                <span className={cn("text-4xl font-black tracking-tight", overspentTotal ? "text-destructive" : "text-foreground")}>
                  {formatAmount(totalSpent)}
                </span>
                <span className="text-sm font-semibold text-muted-foreground">
                  of {formatAmount(totalBudgeted)}
                </span>
              </div>
            </div>
            
            <div className="w-full md:w-1/2">
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-muted-foreground">Progress</span>
                <span className={overspentTotal ? "text-destructive" : "text-foreground"}>
                  {totalPercentage.toFixed(0)}%
                </span>
              </div>
              <Progress 
                value={totalPercentage} 
                className={cn("h-3", overspentTotal ? "[&>div]:bg-destructive" : "[&>div]:bg-success")} 
              />
              {overspentTotal && (
                <p className="text-xs text-destructive mt-2 font-semibold">
                  You are over budget by {formatAmount(totalSpent - totalBudgeted)}.
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Budgets Grid */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-4">Category Budgets</h3>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="rounded-2xl border-none p-5 shadow-xs">
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 rounded-full" />
                    <Skeleton className="h-3 w-16 rounded-full" />
                  </div>
                </div>
                <Skeleton className="h-2 w-full rounded-full mt-4" />
              </Card>
            ))}
          </div>
        ) : budgets.length === 0 ? (
          <Card className="rounded-[24px] border-none bg-card p-12 shadow-xs flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Target className="size-8 text-muted-foreground/50" />
            </div>
            <h4 className="text-base font-bold text-foreground">No budgets set</h4>
            <p className="text-sm text-muted-foreground mt-1 max-w-[280px]">
              Set spending limits for categories to track your financial goals.
            </p>
            <Button 
              onClick={handleOpenAddModal}
              variant="outline"
              className="mt-6 rounded-full font-bold border-border cursor-pointer h-11 px-6"
            >
              Create first budget
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.map(budget => {
              const meta = CATEGORY_META[budget.category.toLowerCase()] || CATEGORY_META.other
              const Icon = meta.icon
              const isOver = budget.spent > budget.amount
              const percent = Math.min(100, (budget.spent / budget.amount) * 100)

              return (
                <Card key={budget._id} className="rounded-[20px] border-none bg-card p-5 shadow-xs hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: meta.bg, color: meta.color }}>
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground leading-tight">{meta.label}</h4>
                        <p className="text-xs font-semibold text-muted-foreground mt-0.5">
                          {formatAmount(budget.spent)} / {formatAmount(budget.amount)}
                        </p>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-muted shrink-0 cursor-pointer" aria-label="Budget actions" />}>
                        <MoreVertical className="size-4 text-muted-foreground" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem onClick={() => handleOpenEditModal(budget)} className="cursor-pointer">
                          <Edit2 className="size-3.5 mr-2" />
                          Edit Limit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-primary/5" />
                        <DropdownMenuItem onClick={() => handleDelete(budget._id)} className="cursor-pointer text-destructive focus:text-destructive">
                          <Trash2 className="size-3.5 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-muted-foreground">{percent.toFixed(0)}%</span>
                    {isOver && <span className="text-destructive text-[10px] uppercase">Overspent</span>}
                  </div>
                  <Progress 
                    value={percent} 
                    className={cn("h-2", isOver ? "[&>div]:bg-destructive" : "[&>div]:bg-success")} 
                  />
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[400px] p-0 border-none rounded-[24px] overflow-hidden bg-card">
          <div className="p-6 pb-0">
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-foreground">
                {modalMode === 'add' ? 'Set Budget' : 'Edit Budget'}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm font-medium">
                {modalMode === 'add' ? 'Set a monthly spending limit for a category.' : 'Update your spending limit for this category.'}
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">Category</label>
                <Select
                  value={formData.category}
                  onValueChange={v => setFormData({ ...formData, category: v })}
                  disabled={modalMode === 'edit'}
                >
                  <SelectTrigger className="w-full h-12 rounded-xl border-border focus:ring-wise-green">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.filter(c => c.value !== 'salary').map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">Monthly Limit (₹)</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  className="h-12 rounded-xl border-border focus-visible:ring-wise-green"
                  required
                  min="1"
                />
              </div>

            </div>

            <DialogFooter className="pt-2 sm:justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full font-bold hover:bg-muted cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90 text-foreground font-bold rounded-full px-6 cursor-pointer shadow-xs"
              >
                {isSubmitting ? 'Saving...' : 'Save Budget'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
