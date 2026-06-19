import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Home            from './pages/Home'
import Login           from './pages/auth/Login'
import SignUp          from './pages/auth/SignUp'
import DashboardLayout from './components/layout/DashboardLayout'
import Dashboard       from './pages/Dashboard'
import Accounts        from './pages/Accounts'
import Transactions    from './pages/Transactions'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/signup"    element={<SignUp />} />
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard"    element={<Dashboard />} />
          <Route path="/accounts"     element={<Accounts />} />
          <Route path="/transactions" element={<Transactions />} />
        </Route>
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
