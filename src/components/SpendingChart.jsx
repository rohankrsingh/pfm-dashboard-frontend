import React from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { spendingCategories } from '../data/mockData'
import styles from '../styles/SpendingChart.module.css'

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload
    return (
      <div className={styles.tooltip}>
        <span className={styles.tooltipDot} style={{ background: d.color }} />
        <span>{d.name}: </span>
        <strong>${d.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
      </div>
    )
  }
  return null
}

export default function SpendingChart() {
  const total = spendingCategories.reduce((s, c) => s + c.amount, 0)

  return (
    <div className={styles.card}>
      <div className={styles.title}>Spending by Category</div>
      <div className={styles.chartWrap}>
        <ResponsiveContainer width="100%" height={170}>
          <PieChart>
            <Pie
              data={spendingCategories}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={80}
              dataKey="amount"
              paddingAngle={2}
            >
              {spendingCategories.map((cat) => (
                <Cell key={cat.name} fill={cat.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className={styles.center}>
          <div className={styles.centerValue}>${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div className={styles.centerLabel}>Total</div>
        </div>
      </div>

      <div className={styles.legend}>
        {spendingCategories.map(cat => (
          <div key={cat.name} className={styles.legendRow}>
            <span className={styles.dot} style={{ background: cat.color }} />
            <span className={styles.catName}>{cat.name}</span>
            <span className={styles.catAmt}>${cat.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            <span className={styles.catPct}>({cat.pct}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}
