import React from 'react'
import { kpiData } from '../data/mockData'
import styles from '../styles/KpiCards.module.css'

function TrendIcon({ trend }) {
  return trend === 'up' ? (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  ) : (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
      <polyline points="17 18 23 18 23 12"/>
    </svg>
  )
}

const kpiIcons = [
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c4dff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="8 12 12 16 16 12"/><line x1="12" y1="8" x2="12" y2="16"/></svg>,
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>,
]

export default function KpiCards() {
  return (
    <div className={styles.grid}>
      {kpiData.map((kpi, i) => (
        <div key={kpi.label} className={styles.card}>
          <div className={styles.label}>{kpi.label}</div>
          <div className={styles.value}>{kpi.value}</div>
          <div className={`${styles.delta} ${kpi.trend === 'up' ? styles.up : styles.down}`}>
            <TrendIcon trend={kpi.trend} />
            <span>{kpi.delta}</span>
          </div>
          <div className={styles.iconWrap} style={{ background: kpi.iconBg }}>
            {kpiIcons[i]}
          </div>
        </div>
      ))}
    </div>
  )
}
