export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div className="container" style={styles.top}>
        <div style={styles.col}>
          <div style={styles.logo}><span style={styles.dot} />Markdrop</div>
          <p style={styles.blurb}>Document conversion, built on the open-source MarkItDown engine. Upload anything, get clean Markdown back.</p>
        </div>

        <div style={styles.col}>
          <div style={styles.heading}>Product</div>
          <a href="#what" style={styles.link} className="link-hover">What it is</a>
          <a href="#how" style={styles.link} className="link-hover">How it works</a>
          <a href="#formats" style={styles.link} className="link-hover">Supported formats</a>
        </div>

        <div style={styles.col}>
          <div style={styles.heading}>Developers</div>
          <a href="#" style={styles.link} className="link-hover">API reference</a>
          <a href="#" style={styles.link} className="link-hover">GitHub</a>
          <a href="#" style={styles.link} className="link-hover">Changelog</a>
        </div>

        <div style={styles.col}>
          <div style={styles.heading}>Company</div>
          <a href="#" style={styles.link} className="link-hover">About</a>
          <a href="#" style={styles.link} className="link-hover">Privacy</a>
          <a href="#" style={styles.link} className="link-hover">Terms</a>
        </div>
      </div>

      <div className="container" style={styles.bottom}>
        <span>© {new Date().getFullYear()} Markdrop. Built on open-source MarkItDown.</span>
        <span style={styles.mono}>v0.1.0</span>
      </div>
    </footer>
  )
}

const styles = {
  footer: { borderTop: '1px solid var(--line)', marginTop: 120, paddingTop: 56 },
  top: { display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 32, paddingBottom: 40 },
  col: { display: 'flex', flexDirection: 'column', gap: 12 },
  logo: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 17, fontWeight: 700 },
  dot: { width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)' },
  blurb: { color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.6, maxWidth: 260 },
  heading: { fontSize: 12.5, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 },
  link: { color: '#C9CFC8', textDecoration: 'none', fontSize: 14 },
  bottom: {
    borderTop: '1px solid var(--line)', padding: '20px 48px',
    display: 'flex', justifyContent: 'space-between',
    fontSize: 12.5, color: 'var(--muted)',
  },
  mono: { fontFamily: 'var(--font-mono)' },
}
