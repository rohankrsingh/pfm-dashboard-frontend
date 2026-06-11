import React from 'react'
import { transactions } from '../data/mockData'
import styles from '../styles/Transactions.module.css'

export default function RecentTransactions() {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.title}>Recent Transactions</div>
        <button className={styles.viewAll}>View all</button>
      </div>

      <div className={styles.list}>
        {transactions.map(tx => (
          <div key={tx.id} className={styles.row}>
            <div
              className={styles.iconWrap}
              style={{ background: tx.iconBg }}
            >
              <span role="img" aria-label={tx.category} className={styles.emoji}>
                {tx.icon}
              </span>
            </div>
            <div className={styles.info}>
              <div className={styles.name}>{tx.name}</div>
              <div className={styles.meta}>{tx.category} · {tx.date}</div>
            </div>
            <div className={`${styles.amount} ${tx.amount > 0 ? styles.income : styles.expense}`}>
              {tx.amount > 0
                ? `+$${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                : `-$${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
