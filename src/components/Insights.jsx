import React from 'react'
import { insights } from '../data/mockData'
import styles from '../styles/Insights.module.css'

export default function Insights() {
  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Insights</div>
      <div className={styles.grid}>
        {insights.map(ins => (
          <div key={ins.id} className={styles.card}>
            <div className={styles.iconWrap} style={{ background: ins.iconBg }}>
              <span role="img" aria-label="insight" style={{ fontSize: 16 }}>{ins.icon}</span>
            </div>
            <div className={styles.text}>
              {ins.highlight
                ? ins.text.split(ins.highlight).map((part, i, arr) =>
                    i < arr.length - 1
                      ? <React.Fragment key={i}>{part}<strong className={styles.highlight}>{ins.highlight}</strong></React.Fragment>
                      : part
                  )
                : ins.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
