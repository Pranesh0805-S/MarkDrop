import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Auth from './pages/Auth.jsx'
import VerifyOtp from './pages/VerifyOtp.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import Upload from './pages/Upload.jsx'
import RequireAuth from './components/RequireAuth.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/app" element={<RequireAuth><Upload /></RequireAuth>} />
    </Routes>
  )
}
