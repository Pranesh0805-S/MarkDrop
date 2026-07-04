export default function FieldHint({ show, children, tone = 'muted' }) {
  if (!show) return null
  return (
    <div className="fade-in" style={{ ...styles.bubble, ...(tone === 'error' ? styles.error : tone === 'success' ? styles.success : {}) }}>
      <div style={styles.arrow} />
      {children}
    </div>
  )
}

const styles = {
  bubble: {
    position: 'relative',
    marginTop: 6,
    background: 'var(--ink-3)',
    border: '1px solid var(--line)',
    borderRadius: 10,
    padding: '10px 12px',
    fontSize: 12.5,
    lineHeight: 1.6,
    color: '#C9CFC8',
  },
  error: { borderColor: 'rgba(226,83,74,0.4)', color: '#F0A29C' },
  success: { borderColor: 'var(--accent-dim)', color: 'var(--accent)' },
  arrow: {
    position: 'absolute', top: -5, left: 20,
    width: 9, height: 9, background: 'inherit',
    borderLeft: '1px solid var(--line)', borderTop: '1px solid var(--line)',
    transform: 'rotate(45deg)',
  },
}
