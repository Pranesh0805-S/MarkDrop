import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Loader2, Check, X, RotateCw } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { validateEmail, passwordFailures } from '../utils/validation.js'
import FieldHint from '../components/FieldHint.jsx'

export default function ForgotPassword() {
  const [step, setStep] = useState('email') // 'email' | 'otp' | 'password' | 'done'
  const [email, setEmail] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const emailError = emailTouched ? validateEmail(email) : ''
  const pwFailures = passwordFailures(password)

  async function sendCode(e) {
    e?.preventDefault()
    setError('')
    setEmailTouched(true)
    const emailErr = validateEmail(email)
    if (emailErr) return setError(emailErr)

    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) throw error
      setStep('otp')
    } catch (err) {
      setError(err.message || 'Could not send reset code')
    } finally {
      setLoading(false)
    }
  }

  async function verifyCode(e) {
    e.preventDefault()
    setError('')
    if (code.trim().length < 6) return setError('Enter the code from your email')
    setLoading(true)
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token: code.trim(), type: 'recovery' })
      if (error) throw error
      setStep('password')
    } catch (err) {
      setError(err.message || 'Invalid or expired code')
    } finally {
      setLoading(false)
    }
  }

  async function setNewPassword(e) {
    e.preventDefault()
    setError('')
    if (pwFailures.length > 0) return setError('Password does not meet the requirements below')
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      // Require them to sign in fresh with the new password, per the requested flow.
      await supabase.auth.signOut()
      setStep('done')
      setTimeout(() => navigate('/auth'), 2000)
    } catch (err) {
      setError(err.message || 'Could not update password')
    } finally {
      setLoading(false)
    }
  }

  async function resendCode() {
    setResending(true)
    setError('')
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) throw error
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
        {step === 'email' && (
          <>
            <h1 style={s.h1}>Reset your password</h1>
            <p style={s.sub}>Enter the email on your account and we'll send you a code.</p>
            {error && <div style={s.error}>{error}</div>}
            <form onSubmit={sendCode} style={s.form}>
              <div>
                <label style={{ ...s.label, ...(emailError ? s.labelError : {}) }} className="input-field">
                  <Mail size={15} style={s.labelIcon} />
                  <input
                    type="email" placeholder="you@example.com" style={s.input}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    autoFocus
                  />
                </label>
                <FieldHint show={!!emailError} tone="error">{emailError}</FieldHint>
              </div>
              <button type="submit" style={s.submit} className="cta-primary" disabled={loading}>
                {loading ? <Loader2 size={16} className="spin-anim" /> : (<>Send code <ArrowRight size={16} /></>)}
              </button>
            </form>
          </>
        )}

        {step === 'otp' && (
          <>
            <h1 style={s.h1}>Enter the code</h1>
            <p style={s.sub}>We sent a code to <strong>{email}</strong>.</p>
            {error && <div style={s.error}>{error}</div>}
            <form onSubmit={verifyCode} style={s.form}>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                placeholder="Enter code"
                inputMode="numeric"
                style={s.otpInput}
                autoFocus
              />
              <button type="submit" style={s.submit} className="cta-primary" disabled={loading}>
                {loading ? <Loader2 size={16} className="spin-anim" /> : (<>Verify code <ArrowRight size={16} /></>)}
              </button>
            </form>
            <button onClick={resendCode} style={s.resendBtn} className="link-hover" disabled={resending}>
              <RotateCw size={13} className={resending ? 'spin-anim' : ''} />
              {resending ? 'Resending…' : 'Resend code'}
            </button>
          </>
        )}

        {step === 'password' && (
          <>
            <h1 style={s.h1}>Set a new password</h1>
            <p style={s.sub}>Choose a new password for <strong>{email}</strong>.</p>
            {error && <div style={s.error}>{error}</div>}
            <form onSubmit={setNewPassword} style={s.form}>
              <div>
                <label style={s.label} className="input-field">
                  <Lock size={15} style={s.labelIcon} />
                  <input
                    type="password" placeholder="New password" style={s.input}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    autoFocus
                  />
                </label>
                <FieldHint show={passwordFocused || password.length > 0}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {['length', 'upper', 'number', 'special'].map((key) => {
                      const rule = { length: 'At least 8 characters', upper: 'One uppercase letter', number: 'One number', special: 'One special character' }[key]
                      const failed = pwFailures.some((f) => f.key === key)
                      return (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, color: failed ? '#9AA19A' : 'var(--accent)' }}>
                          {failed ? <X size={12} /> : <Check size={12} />}
                          {rule}
                        </div>
                      )
                    })}
                  </div>
                </FieldHint>
              </div>
              <button type="submit" style={s.submit} className="cta-primary" disabled={loading}>
                {loading ? <Loader2 size={16} className="spin-anim" /> : 'Update password'}
              </button>
            </form>
          </>
        )}

        {step === 'done' && (
          <>
            <h1 style={s.h1}>Password updated</h1>
            <p style={s.sub}>Taking you back to sign in with your new password…</p>
          </>
        )}
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: 'var(--ink)', color: 'var(--paper)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px' },
  logo: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 20, fontWeight: 700, textDecoration: 'none', marginBottom: 40 },
  dot: { width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 12px var(--accent)' },
  card: { width: '100%', maxWidth: 420, background: 'var(--ink-2)', border: '1px solid var(--line)', borderRadius: 20, padding: 36 },
  h1: { fontSize: 24, fontWeight: 700, marginBottom: 6 },
  sub: { fontSize: 14, color: 'var(--muted)', marginBottom: 24, lineHeight: 1.6 },
  error: { background: 'rgba(226,83,74,0.12)', color: 'var(--danger)', border: '1px solid rgba(226,83,74,0.3)', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 16 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  label: { display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--line)', borderRadius: 12, padding: '12px 14px', background: 'var(--ink-3)' },
  labelError: { borderColor: 'rgba(226,83,74,0.5)' },
  labelIcon: { color: 'var(--muted)', flexShrink: 0 },
  input: { flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--paper)', fontSize: 14 },
  otpInput: { textAlign: 'center', letterSpacing: '0.3em', fontSize: 20, fontFamily: 'var(--font-mono)', padding: '14px 0', borderRadius: 12, border: '1px solid var(--line)', background: 'var(--ink-3)', color: 'var(--paper)', outline: 'none' },
  submit: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--accent)', color: 'var(--accent-ink)', border: 'none', borderRadius: 12, padding: '13px 0', fontSize: 15, fontWeight: 700 },
  resendBtn: { marginTop: 16, background: 'none', border: 'none', color: 'var(--muted)', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 },
}
