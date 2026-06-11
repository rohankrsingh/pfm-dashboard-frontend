export const kpiData = [
  {
    label: 'Total Balance',
    value: '$28,351.45',
    delta: '5.2% vs last month',
    trend: 'up',
    icon: '💳',
    iconBg: '#f3f0ff',
    iconColor: '#7c4dff',
  },
  {
    label: 'Monthly Income',
    value: '$6,820.00',
    delta: '3.1% vs last month',
    trend: 'up',
    icon: '⬇',
    iconBg: '#f0fdf4',
    iconColor: '#22c55e',
  },
  {
    label: 'Monthly Expenses',
    value: '$4,350.75',
    delta: '2.4% vs last month',
    trend: 'down',
    icon: '🛒',
    iconBg: '#fff1f1',
    iconColor: '#ef4444',
  },
  {
    label: 'Savings Rate',
    value: '36%',
    delta: '6% vs last month',
    trend: 'up',
    icon: '📊',
    iconBg: '#eff6ff',
    iconColor: '#3b82f6',
  },
]

export const spendingCategories = [
  { name: 'Housing', amount: 1450.0, pct: 33, color: '#4f6cf7' },
  { name: 'Food & Dining', amount: 980.5, pct: 23, color: '#22c55e' },
  { name: 'Transportation', amount: 650.25, pct: 15, color: '#f59e0b' },
  { name: 'Shopping', amount: 540.0, pct: 12, color: '#a855f7' },
  { name: 'Entertainment', amount: 380.0, pct: 9, color: '#ec4899' },
  { name: 'Other', amount: 350.0, pct: 8, color: '#9ca3af' },
]

export const incomeExpenseData = {
  months: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
  income: [6200, 6500, 6800, 6400, 7000, 6820],
  expense: [4100, 4300, 4600, 4200, 4800, 4350],
}

export const spendingTrendData = {
  months: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
  expenses: [4100, 4300, 4600, 4200, 5500, 4900],
}

export const netWorthTrend = [72000, 74000, 76000, 73000, 79000, 82000, 85430]

export const accounts = [
  {
    id: 1,
    name: 'Chase Checking',
    number: '1234',
    balance: 4325.45,
    type: 'checking',
    iconBg: '#dbeafe',
    iconColor: '#2563eb',
  },
  {
    id: 2,
    name: 'Bank of America Savings',
    number: '5678',
    balance: 8240.75,
    type: 'savings',
    iconBg: '#fee2e2',
    iconColor: '#dc2626',
  },
  {
    id: 3,
    name: 'Wells Fargo Credit Card',
    number: '9101',
    balance: -1250.5,
    type: 'credit',
    iconBg: '#fef9c3',
    iconColor: '#ca8a04',
  },
  {
    id: 4,
    name: 'Fidelity Investments',
    number: '2468',
    balance: 16785.75,
    type: 'investment',
    iconBg: '#dcfce7',
    iconColor: '#16a34a',
  },
]

export const transactions = [
  {
    id: 1,
    name: 'Whole Foods Market',
    category: 'Groceries',
    date: 'Oct 24, 2024',
    amount: -87.43,
    iconBg: '#f0fdf4',
    iconColor: '#16a34a',
    icon: '🛒',
  },
  {
    id: 2,
    name: 'Uber Technologies',
    category: 'Transportation',
    date: 'Oct 24, 2024',
    amount: -24.19,
    iconBg: '#1a1f4e',
    iconColor: '#fff',
    icon: '🚗',
  },
  {
    id: 3,
    name: 'Salary Deposit',
    category: 'Income',
    date: 'Oct 24, 2024',
    amount: 3650.0,
    iconBg: '#dbeafe',
    iconColor: '#2563eb',
    icon: '💵',
  },
  {
    id: 4,
    name: 'Netflix',
    category: 'Entertainment',
    date: 'Oct 23, 2024',
    amount: -15.49,
    iconBg: '#fee2e2',
    iconColor: '#dc2626',
    icon: '📺',
  },
  {
    id: 5,
    name: 'Starbucks',
    category: 'Food & Dining',
    date: 'Oct 23, 2024',
    amount: -6.25,
    iconBg: '#fef9c3',
    iconColor: '#ca8a04',
    icon: '☕',
  },
]

export const budgets = [
  {
    id: 1,
    name: 'Housing',
    spent: 1450,
    total: 1800,
    pct: 81,
    color: '#4f6cf7',
    iconBg: '#dbeafe',
    iconColor: '#2563eb',
    icon: '🏠',
  },
  {
    id: 2,
    name: 'Food & Dining',
    spent: 980.5,
    total: 1200,
    pct: 82,
    color: '#22c55e',
    iconBg: '#dcfce7',
    iconColor: '#16a34a',
    icon: '🍽️',
  },
  {
    id: 3,
    name: 'Transportation',
    spent: 650.25,
    total: 800,
    pct: 81,
    color: '#f59e0b',
    iconBg: '#fef9c3',
    iconColor: '#ca8a04',
    icon: '🚗',
  },
  {
    id: 4,
    name: 'Shopping',
    spent: 540,
    total: 600,
    pct: 90,
    color: '#ec4899',
    iconBg: '#fce7f3',
    iconColor: '#db2777',
    icon: '🛍️',
    warning: true,
  },
]

export const insights = [
  {
    id: 1,
    text: 'You spent 12% less on Dining out compared to last month.',
    iconBg: '#f0fdf4',
    iconColor: '#22c55e',
    icon: '📈',
  },
  {
    id: 2,
    text: 'Your highest spending category is Housing (33%).',
    iconBg: '#eff6ff',
    iconColor: '#3b82f6',
    icon: '📊',
  },
  {
    id: 3,
    text: 'You have saved $2,469.25 this month.',
    iconBg: '#fffbeb',
    iconColor: '#f59e0b',
    icon: '🐷',
    highlight: '$2,469.25',
  },
]

export const navItems = [
  { label: 'Overview', icon: '🏠', path: '/' },
  { label: 'Accounts', icon: '🏦', path: '/accounts' },
  { label: 'Transactions', icon: '↔️', path: '/transactions' },
  { label: 'Budgets', icon: '🎯', path: '/budgets' },
  { label: 'Reports', icon: '📄', path: '/reports' },
  { label: 'Goals', icon: '🎯', path: '/goals' },
  { label: 'Settings', icon: '⚙️', path: '/settings' },
]
