import React, { useState } from 'react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { netWorthTrend } from '../data/mockData'
import styles from '../styles/Sidebar.module.css'

const navItems = [
  { label: 'Overview', icon: '⊞' },
  { label: 'Accounts', icon: '🏦' },
  { label: 'Transactions', icon: '⇄' },
  { label: 'Budgets', icon: '◎' },
  { label: 'Reports', icon: '📄' },
  { label: 'Goals', icon: '⊛' },
  { label: 'Settings', icon: '⚙' },
]

const sparkData = netWorthTrend.map((v, i) => ({ v }))

export default function Sidebar() {
  const [active, setActive] = useState('Overview')

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className={styles.logoText}>
          <div className={styles.logoTitle}>PFM Dashboard</div>
          <div className={styles.logoSub}>Your Financial Compass</div>
        </div>
      </div>

      <nav className={styles.nav}>
        {navItems.map(item => (
          <button
            key={item.label}
            className={`${styles.navItem} ${active === item.label ? styles.navItemActive : ''}`}
            onClick={() => setActive(item.label)}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className={styles.netWorth}>
        <div className={styles.netWorthLabel}>Total Net Worth</div>
        <div className={styles.netWorthValue}>$85,430.50</div>
        <div className={styles.netWorthDelta}>
          <span className={styles.deltaUp}>▲ 8.5%</span> vs last month
        </div>
        <div className={styles.sparkline}>
          <ResponsiveContainer width="100%" height={44}>
            <LineChart data={sparkData}>
              <Line
                type="monotone"
                dataKey="v"
                stroke="#a78bfa"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.premium}>
        <div className={styles.premiumAvatar}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="7" r="4" stroke="#fff" strokeWidth="2"/>
          </svg>
        </div>
        <div className={styles.premiumTitle}>Upgrade to Premium</div>
        <div className={styles.premiumText}>Unlock advanced insights and custom reports.</div>
        <button className={styles.premiumBtn}>Upgrade Now</button>
      </div>

      <button className={styles.logout}>
        <span>↩</span>
        <span>Logout</span>
      </button>
    </aside>
  )
}
