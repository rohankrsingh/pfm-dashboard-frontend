import React, { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { incomeExpenseData } from '../data/mockData'
import styles from '../styles/IncomeExpenseChart.module.css'

const months = incomeExpenseData.months
const thisMonthData = months.map((m, i) => ({
  month: m,
  Income: incomeExpenseData.income[i],
  Expense: incomeExpenseData.expense[i],
}))

const lastMonthData = months.map((m, i) => ({
  month: m,
  Income: incomeExpenseData.income[i] * 0.92,
  Expense: incomeExpenseData.expense[i] * 0.95,
}))

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.tooltip}>
        <div className={styles.tooltipLabel}>{label}</div>
        {payload.map(p => (
          <div key={p.name} className={styles.tooltipRow}>
            <span className={styles.tooltipDot} style={{ background: p.fill }} />
            <span>{p.name}: </span>
            <strong>${p.value.toLocaleString('en-US', { minimumFractionDigits: 0 })}</strong>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function IncomeExpenseChart() {
  const [period, setPeriod] = useState('This Month')
  const data = period === 'This Month' ? thisMonthData : lastMonthData

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.title}>Income vs. Expense</div>
        <select
          className={styles.select}
          value={period}
          onChange={e => setPeriod(e.target.value)}
        >
          <option>This Month</option>
          <option>Last Month</option>
        </select>
      </div>

      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: '#22c55e' }} />
          Income
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: '#ef4444' }} />
          Expenses
        </span>
      </div>

      <ResponsiveContainer width="100%" height={188}>
        <BarChart data={data} barGap={3} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="Income" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={22} />
          <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
