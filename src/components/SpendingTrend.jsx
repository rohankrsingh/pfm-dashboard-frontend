import React, { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { spendingTrendData } from '../data/mockData'
import styles from '../styles/SpendingTrend.module.css'

const thisYearData = spendingTrendData.months.map((m, i) => ({
  month: m,
  Expenses: spendingTrendData.expenses[i],
}))

const lastYearData = spendingTrendData.months.map((m, i) => ({
  month: m,
  Expenses: spendingTrendData.expenses[i] * 0.88,
}))

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.tooltip}>
        <div className={styles.tooltipLabel}>{label}</div>
        <div className={styles.tooltipVal}>
          ${payload[0].value.toLocaleString('en-US', { minimumFractionDigits: 0 })}
        </div>
      </div>
    )
  }
  return null
}

export default function SpendingTrend() {
  const [period, setPeriod] = useState('This Year')
  const data = period === 'This Year' ? thisYearData : lastYearData

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.title}>Monthly Spending Trend</div>
        <select
          className={styles.select}
          value={period}
          onChange={e => setPeriod(e.target.value)}
        >
          <option>This Year</option>
          <option>Last Year</option>
        </select>
      </div>

      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: '#4f6cf7' }} />
          Expenses
        </span>
      </div>

      <ResponsiveContainer width="100%" height={175}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f6cf7" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#4f6cf7" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="Expenses"
            stroke="#4f6cf7"
            strokeWidth={2.5}
            fill="url(#expGrad)"
            dot={{ r: 4, fill: '#4f6cf7', strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
