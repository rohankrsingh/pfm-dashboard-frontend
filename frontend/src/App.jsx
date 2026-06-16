import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Home      from './pages/Home'
import Login     from './pages/auth/Login'
import SignUp    from './pages/auth/SignUp'
import Dashboard from './pages/Dashboard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/signup"    element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
