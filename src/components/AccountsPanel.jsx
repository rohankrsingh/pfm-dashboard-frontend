import React from 'react'
import { accounts } from '../data/mockData'
import styles from '../styles/AccountsPanel.module.css'

const accountIcons = {
  checking: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <path d="M3 9h18M9 21V9"/>
    </svg>
  ),
  savings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  credit: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  investment: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
}

export default function AccountsPanel() {
  const total = accounts.reduce((s, a) => s + a.balance, 0)

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.title}>Accounts</div>
        <button className={styles.viewAll}>View all</button>
      </div>

      <div className={styles.list}>
        {accounts.map(acc => (
          <div key={acc.id} className={styles.row}>
            <div className={styles.iconWrap} style={{ background: acc.iconBg }}>
              <span style={{ color: acc.iconColor }}>
                {accountIcons[acc.type]}
              </span>
            </div>
            <div className={styles.info}>
              <div className={styles.name}>{acc.name}</div>
              <div className={styles.number}>···· {acc.number}</div>
            </div>
            <div className={`${styles.balance} ${acc.balance < 0 ? styles.negative : styles.positive}`}>
              {acc.balance < 0
                ? `-$${Math.abs(acc.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                : `$${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.totalRow}>
        <span className={styles.totalLabel}>Total Balance</span>
        <span className={styles.totalValue}>
          ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  )
}
