import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext.jsx'
import { supabase } from '../lib/supabaseClient.js'
import UserMenu from './UserMenu.jsx'

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user || null))
    return () => sub.subscription.unsubscribe()
  }, [])

  return (
    <nav style={styles.nav}>
      <div className="container" style={styles.inner}>
        <Link to="/" style={styles.logo}>
          <span style={styles.dot} className="dot-pulse" />
          Markdrop
        </Link>
        <div style={styles.links}>
          <a href="#what" style={styles.link} className="link-hover">What it is</a>
          <a href="#how" style={styles.link} className="link-hover">How it works</a>
          <a href="#formats" style={styles.link} className="link-hover">Formats</a>
        </div>
        <div style={styles.right}>
          <button
            style={styles.themeBtn}
            className="icon-btn-anim"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {user ? (
            <UserMenu user={user} />
          ) : (
            <Link to="/auth" style={styles.cta} className="btn-lift">Sign in</Link>
          )}
        </div>
      </div>
    </nav>
  )
}

const styles = {
  nav: { position: 'relative', zIndex: 10, padding: '24px 0' },
  inner: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', textDecoration: 'none' },
  dot: { width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 12px var(--accent)' },
  links: { display: 'flex', gap: 32 },
  link: { color: 'var(--muted)', textDecoration: 'none', fontSize: 14, fontWeight: 500 },
  right: { display: 'flex', alignItems: 'center', gap: 14 },
  themeBtn: { width: 36, height: 36, borderRadius: 10, border: '1px solid var(--line)', background: 'var(--ink-2)', color: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cta: { background: 'var(--paper)', color: 'var(--ink)', padding: '9px 20px', borderRadius: 100, fontSize: 14, fontWeight: 700, textDecoration: 'none' },
}
