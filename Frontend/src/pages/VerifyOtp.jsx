import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Loader2, RotateCw } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'

export default function VerifyOtp() {
  const [params] = useSearchParams()
  const email = params.get('email') || ''
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [resent, setResent] = useState(false)
  const navigate = useNavigate()

  async function handleVerify(e) {
    e.preventDefault()
    setError('')
    if (code.trim().length < 6) return setError('Enter the code from your email')
    setLoading(true)
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token: code.trim(), type: 'signup' })
      if (error) throw error
      navigate('/app') // verified -> straight into the app
    } catch (err) {
      setError(err.message || 'Invalid or expired code')
    } finally {
      setLoading(false)
    }
  }

  async function resend() {
    setResending(true)
    setError('')
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email })
      if (error) throw error
      setResent(true)
      setTimeout(() => setResent(false), 4000)
    } catch (err) {
      setError(err.message || 'Could not resend code')
    } finally {
      setResending(false)
    }
  }

  return (
    <div style={s.page}>
      <Link to="/" style={s.logo}><span style={s.dot} />Markdrop</Link>

      <div style={s.card} className="fade-up">
        <h1 style={s.h1}>Check your email</h1>
        <p style={s.sub}>
          We sent a code to <strong>{email || 'your email'}</strong>. Enter it below to confirm your account.
        </p>

        {error && <div style={s.error}>{error}</div>}
        {resent && <div style={s.success}>New code sent — check your inbox.</div>}

        <form onSubmit={handleVerify} style={s.form}>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
            placeholder="Enter code"
            inputMode="numeric"
            style={s.otpInput}
            autoFocus
          />
          <button type="submit" style={s.submit} className="cta-primary" disabled={loading}>
            {loading ? <Loader2 size={16} className="spin-anim" /> : (<>Verify <ArrowRight size={16} /></>)}
          </button>
        </form>

        <button onClick={resend} style={s.resendBtn} className="link-hover" disabled={resending}>
          <RotateCw size={13} className={resending ? 'spin-anim' : ''} />
          {resending ? 'Resending…' : "Didn't get a code? Resend"}
        </button>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: 'var(--ink)', color: 'var(--paper)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px' },
  logo: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 20, fontWeight: 700, textDecoration: 'none', marginBottom: 40 },
  dot: { width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 12px var(--accent)' },
  card: { width: '100%', maxWidth: 420, background: 'var(--ink-2)', border: '1px solid var(--line)', borderRadius: 20, padding: 36, textAlign: 'center' },
  h1: { fontSize: 24, fontWeight: 700, marginBottom: 10 },
  sub: { fontSize: 14, color: 'var(--muted)', marginBottom: 24, lineHeight: 1.6 },
  error: { background: 'rgba(226,83,74,0.12)', color: 'var(--danger)', border: '1px solid rgba(226,83,74,0.3)', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 16, textAlign: 'left' },
  success: { background: 'rgba(124,255,178,0.1)', color: 'var(--accent)', border: '1px solid var(--accent-dim)', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 16 },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  otpInput: { textAlign: 'center', letterSpacing: '0.3em', fontSize: 20, fontFamily: 'var(--font-mono)', padding: '14px 0', borderRadius: 12, border: '1px solid var(--line)', background: 'var(--ink-3)', color: 'var(--paper)', outline: 'none' },
  submit: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--accent)', color: 'var(--accent-ink)', border: 'none', borderRadius: 12, padding: '13px 0', fontSize: 15, fontWeight: 700 },
  resendBtn: { marginTop: 20, background: 'none', border: 'none', color: 'var(--muted)', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 },
}
