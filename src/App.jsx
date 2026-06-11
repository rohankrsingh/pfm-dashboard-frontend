import React from 'react'
import Sidebar from './components/Sidebar'
import Overview from './pages/Overview'
import './styles/App.css'

export default function App() {
  return (
    <div className="app-layout">
      <Sidebar />
      <Overview />
    </div>
  )
}
