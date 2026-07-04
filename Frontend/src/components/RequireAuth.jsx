import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'

export default function RequireAuth({ children }) {
  const [status, setStatus] = useState('checking') // 'checking' | 'authed' | 'guest'

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setStatus(data.session ? 'authed' : 'guest')
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setStatus(session ? 'authed' : 'guest')
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  if (status === 'checking') return null // or a spinner
  if (status === 'guest') return <Navigate to="/auth" replace />
  return children
}
