import { useEffect, useRef, useState } from 'react'
import { LogOut } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'

export default function UserMenu({ user }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  if (!user) return null

  const meta = user.user_metadata || {}
  const photo = meta.avatar_url || meta.picture || null
  const name = meta.full_name || meta.name || user.email
  const initials = getInitials(name)

  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="icon-btn-anim"
        style={styles.avatarBtn}
        aria-label="Account menu"
      >
        {photo ? (
          <img src={photo} alt={name} style={styles.avatarImg} referrerPolicy="no-referrer" />
        ) : (
          <span style={styles.initials}>{initials}</span>
        )}
      </button>

      {open && (
        <div style={styles.dropdown} className="fade-in">
          <div style={styles.dropdownName}>{name}</div>
          <div style={styles.dropdownEmail}>{user.email}</div>
          <div style={styles.divider} />
          <button style={styles.signOutBtn} className="row-hover" onClick={signOut}>
            <LogOut size={14} /> Sign out
          </button>
        </div>
      )}
    </div>
  )
}

function getInitials(name) {
  if (!name) return '?'
  const parts = name.split(/[\s@.]+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

const styles = {
  avatarBtn: {
    width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--line)',
    background: 'var(--ink-3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', padding: 0,
  },
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  initials: { fontSize: 12.5, fontWeight: 700, color: 'var(--accent)' },
  dropdown: {
    position: 'absolute', top: 46, right: 0, minWidth: 200,
    background: 'var(--ink-2)', border: '1px solid var(--line)', borderRadius: 12,
    padding: 12, zIndex: 20,
  },
  dropdownName: { fontSize: 13.5, fontWeight: 700 },
  dropdownEmail: { fontSize: 12, color: 'var(--muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  divider: { height: 1, background: 'var(--line)', margin: '10px 0' },
  signOutBtn: { display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: 'none', border: 'none', color: 'var(--danger)', fontSize: 13, padding: '8px 6px', borderRadius: 8 },
}
