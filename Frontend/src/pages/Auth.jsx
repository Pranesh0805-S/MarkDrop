import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Github, Mail, Lock, ArrowRight, Loader2, Check, X } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { validateEmail, passwordFailures } from '../utils/validation.js'
import FieldHint from '../components/FieldHint.jsx'

export default function Auth() {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const emailError = emailTouched ? validateEmail(email) : ''
  const pwFailures = passwordFailures(password)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setEmailTouched(true)

    const emailErr = validateEmail(email)
    if (emailErr) return setError(emailErr)
    if (mode === 'signup' && pwFailures.length > 0) {
      return setError('Password does not meet the requirements below')
    }

    setLoading(true)
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        navigate('/app') // existing user -> straight into the app
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        // New signup -> verify via emailed OTP before granting access.
        navigate(`/verify-otp?email=${encodeURIComponent(email)}`)
      }
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleOAuth(provider) {
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider, // 'google' | 'github' | 'azure' | 'apple'
      options: { redirectTo: `${window.location.origin}/app` },
    })
    if (error) setError(error.message)
  }

  return (
    <div style={s.page}>

      <div style={s.card} className="fade-up">
        <div style={s.toggleRow}>
          <button
            className="toggle-btn"
            style={{ ...s.toggleBtn, ...(mode === 'signin' ? s.toggleActive : {}) }}
            onClick={() => { setMode('signin'); setError('') }}
          >Sign in</button>
          <button
            className="toggle-btn"
            style={{ ...s.toggleBtn, ...(mode === 'signup' ? s.toggleActive : {}) }}
            onClick={() => { setMode('signup'); setError('') }}
          >Sign up</button>
        </div>

        <h1 style={s.h1}>{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h1>
        <p style={s.sub}>
          {mode === 'signin' ? 'Sign in to keep converting your documents.' : 'Start converting documents to Markdown in seconds.'}
        </p>

        <div style={s.oauthGrid}>
          <button style={s.oauthBtn} className="oauth-btn" onClick={() => handleOAuth('google')}>
            <GoogleIcon />
            Continue with Google
          </button>
          <button style={s.oauthBtn} className="oauth-btn" onClick={() => handleOAuth('github')}>
            <Github size={18} />
            Continue with GitHub
          </button>
          </div>

        <div style={s.dividerRow}>
          <div style={s.dividerLine} />
          <span style={s.dividerText}>or use email</span>
          <div style={s.dividerLine} />
        </div>

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={s.form} noValidate>
          <div>
            <label style={{ ...s.label, ...(emailError ? s.labelError : {}) }} className="input-field">
              <Mail size={15} style={s.labelIcon} />
              <input
                type="email" placeholder="you@example.com" style={s.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setEmailTouched(true)}
              />
            </label>
            <FieldHint show={!!emailError} tone="error">{emailError}</FieldHint>
          </div>

          <div>
            <label style={s.label} className="input-field">
              <Lock size={15} style={s.labelIcon} />
              <input
                type="password" placeholder="********" style={s.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
            </label>
            <FieldHint show={mode === 'signup' && (passwordFocused || password.length > 0)}>
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

          {mode === 'signin' && (
            <Link to="/forgot-password" style={s.forgot} className="link-hover">Forgot password?</Link>
          )}

          <button type="submit" style={s.submit} className="cta-primary" disabled={loading}>
            {loading ? <Loader2 size={16} className="spin-anim" /> : (
              <>
                {mode === 'signin' ? 'Sign in' : 'Create account'}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <p style={s.switchText}>
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            style={s.switchLink}
            className="link-hover"
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError('') }}
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.95v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.05l3.02-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.59-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .95 4.95l3.02 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  )
}


const s = {
  page: { minHeight: '100vh', background: 'var(--ink)', color: 'var(--paper)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px' },
  logo: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 20, fontWeight: 700, textDecoration: 'none', marginBottom: 40 },
  dot: { width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 12px var(--accent)' },

  card: { width: '100%', maxWidth: 420, background: 'var(--ink-2)', border: '1px solid var(--line)', borderRadius: 20, padding: 36 },
  toggleRow: { display: 'flex', background: 'var(--ink-3)', borderRadius: 100, padding: 4, marginBottom: 28 },
  toggleBtn: { flex: 1, padding: '9px 0', borderRadius: 100, border: 'none', background: 'transparent', color: 'var(--muted)', fontWeight: 600, fontSize: 14 },
  toggleActive: { background: 'var(--paper)', color: 'var(--ink)' },

  h1: { fontSize: 24, fontWeight: 700, marginBottom: 6 },
  sub: { fontSize: 14, color: 'var(--muted)', marginBottom: 24, lineHeight: 1.5 },

  oauthGrid: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 },
  oauthBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', padding: '12px 0', borderRadius: 12, border: '1px solid var(--line)', background: 'var(--ink-3)', color: 'var(--paper)', fontSize: 14, fontWeight: 600 },

  dividerRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 },
  dividerLine: { flex: 1, height: 1, background: 'var(--line)' },
  dividerText: { fontSize: 12, color: 'var(--muted)' },
  error: { background: 'rgba(226,83,74,0.12)', color: 'var(--danger)', border: '1px solid rgba(226,83,74,0.3)', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 16 },

  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  label: { display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--line)', borderRadius: 12, padding: '12px 14px', background: 'var(--ink-3)' },
  labelError: { borderColor: 'rgba(226,83,74,0.5)' },
  labelIcon: { color: 'var(--muted)', flexShrink: 0 },
  input: { flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--paper)', fontSize: 14 },
  forgot: { alignSelf: 'flex-end', fontSize: 12.5, color: 'var(--accent)', textDecoration: 'none', marginTop: -8 },

  submit: { marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--accent)', color: 'var(--accent-ink)', border: 'none', borderRadius: 12, padding: '13px 0', fontSize: 15, fontWeight: 700 },

  switchText: { textAlign: 'center', fontSize: 13.5, color: 'var(--muted)', marginTop: 24 },
  switchLink: { background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 600, fontSize: 13.5, padding: 0 },
}
