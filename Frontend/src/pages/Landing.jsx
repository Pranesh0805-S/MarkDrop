import { Link } from 'react-router-dom'
import { Upload, FileText, Sparkles, Download } from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

export default function Landing() {
  return (
    <div>
      <Navbar />

      {/* ---------- HERO ---------- */}
      <section style={s.hero}>
        <div style={s.tileGrid}>
          {tiles.map((t, i) => <Tile key={i} {...t} />)}
        </div>

        <div style={s.heroInner}>
          <div style={{ ...s.eyebrow, animationDelay: '0s' }} className="fade-up">DOCX · PDF · PPTX · XLSX · HTML → MD</div>
          <h1 style={{ ...s.h1, animationDelay: '.08s' }} className="fade-up">Every doc,<br />one clean <span style={{ color: 'var(--accent)' }}>.md</span></h1>
          <p style={{ ...s.sub, animationDelay: '.16s' }} className="fade-up">
            Drop in anything — <code style={s.code}>resume.docx</code>, <code style={s.code}>report.pdf</code>, a whole folder —
            and get back Markdown that's ready for your notes, your repo, or your AI prompt.
          </p>
          <div style={{ ...s.ctaRow, animationDelay: '.24s' }} className="fade-up">
            <Link to="/app" style={s.ctaPrimary} className="cta-primary">Convert a file →</Link>
            <a href="#how" style={s.ctaSecondary} className="link-hover">See how it works</a>
          </div>
        </div>
      </section>

      {/* ---------- WHAT IT IS ---------- */}
      <section id="what" className="container" style={s.section}>
        <div style={s.sectionHead}>
          <span style={s.kicker}>What it is</span>
          <h2 style={s.h2}>A clean layer between your documents and Markdown</h2>
          <p style={s.p}>
            Markdrop is a web app built on top of <b>MarkItDown</b>, an open-source conversion engine.
            Instead of installing Python, running commands in a terminal, and remembering file paths,
            you upload a file and get formatted Markdown back in seconds — no setup required.
          </p>
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section id="how" className="container" style={s.section}>
        <span style={s.kicker}>How it works</span>
        <h2 style={{ ...s.h2, marginBottom: 40 }}>Three steps, no terminal</h2>
        <div style={s.stepsGrid}>
          {steps.map((step, i) => (
            <div style={s.stepCard} className="card-hover fade-up" key={i} data-anim-delay={i}>
              <div style={s.stepIcon}><step.icon size={20} color="var(--accent)" /></div>
              <div style={s.stepNum}>{String(i + 1).padStart(2, '0')}</div>
              <div style={s.stepTitle}>{step.title}</div>
              <div style={s.stepBody}>{step.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- FORMATS ---------- */}
      <section id="formats" className="container" style={s.section}>
        <span style={s.kicker}>Supported formats</span>
        <h2 style={{ ...s.h2, marginBottom: 32 }}>Bring whatever you've got</h2>
        <div style={s.formatGrid}>
          {formats.map((f, i) => (
            <div style={s.formatCard} className="format-pill" key={i}>
              <span style={s.formatExt}>{f}</span>
              <span style={s.formatArrow}>→</span>
              <span style={s.formatOut}>.md</span>
            </div>
          ))}
        </div>
      </section>

      <div className="container"><Footer /></div>
    </div>
  )
}

function Tile({ kind, title, lines }) {
  if (kind === 'blank') return <div className="tile-anim" style={{ ...s.tile, background: 'var(--ink-3)', opacity: 0.5 }} />
  if (kind === 'doc') {
    return (
      <div className="tile-anim" style={{ ...s.tile, ...s.tileDoc }}>
        <div style={s.tileDocTitle}>{title}</div>
        <div style={s.tileDocBody}>{lines.join(' ')}</div>
      </div>
    )
  }
  return (
    <div className="tile-anim" style={{ ...s.tile, ...s.tileMd }}>
      {lines.map((l, i) => <div key={i} style={i % 2 === 1 ? s.mdMuted : undefined}>{l}</div>)}
    </div>
  )
}

const tiles = [
  { kind: 'doc', title: 'RESUME.DOCX', lines: ['Senior Software Engineer with 5+ years building scalable backend systems...'] },
  { kind: 'blank' },
  { kind: 'md', lines: ['# Resume', '## Experience', '**Senior Engineer**', '2021 — Present'] },
  { kind: 'blank' },
  { kind: 'doc', title: 'Q3_REPORT.XLSX', lines: ['Revenue | Growth', '₹4.2L | +18%'] },
  { kind: 'blank' },
  { kind: 'blank' },
  { kind: 'md', lines: ['| Rev | Growth |', '|---|---|', '| 4.2L | 18% |'] },
  { kind: 'blank' },
  { kind: 'doc', title: 'NOTES.PDF', lines: ['Meeting summary — action items for the sprint review...'] },
  { kind: 'blank' },
  { kind: 'blank' },
  { kind: 'md', lines: ['> Meeting summary', '- Action item one', '- Action item two'] },
  { kind: 'blank' },
  { kind: 'blank' },
  { kind: 'doc', title: 'SLIDES.PPTX', lines: ['01 Introduction', '02 Market overview'] },
  { kind: 'blank' },
  { kind: 'md', lines: ['## Introduction', '## Market overview', '## Roadmap'] },
  { kind: 'blank' },
  { kind: 'doc', title: 'README.HTML', lines: ['<h1>Project</h1> <p>Setup instructions...</p>'] },
  { kind: 'blank' },
  { kind: 'blank' },
  { kind: 'md', lines: ['# Project', 'Setup instructions...'] },
  { kind: 'blank' },
]

const steps = [
  { icon: Upload, title: 'Upload', body: 'Drag in a file or a whole folder. DOCX, PDF, PPTX, XLSX, HTML, and more.' },
  { icon: Sparkles, title: 'Convert', body: 'MarkItDown parses structure, tables, and headings, and rebuilds them in Markdown.' },
  { icon: Download, title: 'Export', body: 'Preview the result side by side, then copy or download the .md file.' },
]

const formats = ['.docx', '.pdf', '.pptx', '.xlsx', '.html', '.csv', '.epub', '.zip']

const s = {
  hero: { position: 'relative', minHeight: '86vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 24px 90px', overflow: 'hidden' },
  tileGrid: { position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gridTemplateRows: 'repeat(4, 1fr)', gap: 6, padding: 6, zIndex: 0 },
  tile: { borderRadius: 10, overflow: 'hidden', fontFamily: 'var(--font-mono)', fontSize: 10, padding: 12, textAlign: 'left' },
  tileDoc: { background: 'linear-gradient(135deg, #EDE7D6, #DDD5BE)', color: '#2B2A24', fontFamily: 'var(--font-display)' },
  tileDocTitle: { fontSize: 11, fontWeight: 700, opacity: 0.55, marginBottom: 4 },
  tileDocBody: { fontSize: 9, lineHeight: 1.4, opacity: 0.7 },
  tileMd: { background: 'var(--ink-2)', color: 'var(--accent)', lineHeight: 1.6 },
  mdMuted: { color: '#5C6B62' },
  heroInner: { position: 'relative', zIndex: 2, maxWidth: 900 },
  eyebrow: { fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', letterSpacing: '0.08em', marginBottom: 20 },
  h1: { fontSize: 'clamp(48px, 8vw, 100px)', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 0.95, textShadow: '0 4px 40px rgba(0,0,0,0.5)' },
  sub: { marginTop: 28, fontSize: 18, color: '#C9CFC8', maxWidth: 560, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 },
  code: { fontFamily: 'var(--font-mono)', background: 'rgba(124,255,178,0.12)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 6, fontSize: 15 },
  ctaRow: { marginTop: 40, display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'center' },
  ctaPrimary: { background: 'var(--accent)', color: 'var(--accent-ink)', padding: '17px 34px', borderRadius: 100, fontSize: 16, fontWeight: 700, textDecoration: 'none' },
  ctaSecondary: { color: 'var(--paper)', textDecoration: 'none', fontSize: 15, fontWeight: 500, opacity: 0.8 },

  section: { padding: '64px 0', borderTop: '1px solid var(--line)' },
  sectionHead: { maxWidth: 640 },
  kicker: { fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase' },
  h2: { fontSize: 34, fontWeight: 700, letterSpacing: '-0.02em', margin: '14px 0 16px' },
  p: { fontSize: 16, color: '#C9CFC8', lineHeight: 1.7 },

  stepsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 },
  stepCard: { background: 'var(--ink-2)', border: '1px solid var(--line)', borderRadius: 16, padding: 24 },
  stepIcon: { width: 40, height: 40, borderRadius: 10, background: 'rgba(124,255,178,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  stepNum: { fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)', marginBottom: 8 },
  stepTitle: { fontSize: 18, fontWeight: 700, marginBottom: 8 },
  stepBody: { fontSize: 14, color: '#B8BEB8', lineHeight: 1.6 },

  formatGrid: { display: 'flex', flexWrap: 'wrap', gap: 12 },
  formatCard: { display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--line)', borderRadius: 10, padding: '12px 18px', fontFamily: 'var(--font-mono)', fontSize: 14, background: 'var(--ink-2)' },
  formatExt: { color: 'var(--paper)' },
  formatArrow: { color: 'var(--accent-dim)' },
  formatOut: { color: 'var(--accent)' },
}
