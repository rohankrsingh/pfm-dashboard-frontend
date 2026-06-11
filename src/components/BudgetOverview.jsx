import React from 'react'
import { budgets } from '../data/mockData'
import styles from '../styles/BudgetOverview.module.css'

export default function BudgetOverview() {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.title}>Budget Overview</div>
        <button className={styles.viewAll}>View all</button>
      </div>

      <div className={styles.list}>
        {budgets.map(b => (
          <div key={b.id} className={styles.item}>
            <div className={styles.itemHeader}>
              <div className={styles.iconWrap} style={{ background: b.iconBg }}>
                <span role="img" aria-label={b.name} style={{ fontSize: 14 }}>{b.icon}</span>
              </div>
              <div className={styles.itemName}>{b.name}</div>
              <div
                className={styles.itemPct}
                style={{ color: b.warning ? '#ef4444' : '#6b7280', fontWeight: b.warning ? 600 : 400 }}
              >
                {b.pct}%
              </div>
            </div>
            <div className={styles.vals}>
              ${b.spent.toLocaleString('en-US', { minimumFractionDigits: 2 })} / ${b.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className={styles.barBg}>
              <div
                className={styles.barFill}
                style={{ width: `${b.pct}%`, background: b.warning ? '#ef4444' : b.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
