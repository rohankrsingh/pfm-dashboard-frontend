import React from 'react'
import Topbar from '../components/Topbar'
import KpiCards from '../components/KpiCards'
import SpendingChart from '../components/SpendingChart'
import IncomeExpenseChart from '../components/IncomeExpenseChart'
import AccountsPanel from '../components/AccountsPanel'
import RecentTransactions from '../components/Transactions'
import SpendingTrend from '../components/SpendingTrend'
import BudgetOverview from '../components/BudgetOverview'
import Insights from '../components/Insights'
import styles from '../styles/Overview.module.css'

export default function Overview() {
  return (
    <div className={styles.main}>
      <Topbar title="Overview" />
      <KpiCards />

      <div className={styles.midRow}>
        <SpendingChart />
        <IncomeExpenseChart />
        <AccountsPanel />
      </div>

      <div className={styles.botRow}>
        <RecentTransactions />
        <SpendingTrend />
        <BudgetOverview />
      </div>

      <Insights />
    </div>
  )
}
