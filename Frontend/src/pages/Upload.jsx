import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { UploadCloud, FileText, X, Download, Copy, Check, Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext.jsx'
import { supabase } from '../lib/supabaseClient.js'
import UserMenu from '../components/UserMenu.jsx'

const ACCEPTED = ['.docx', '.pdf', '.pptx', '.xlsx', '.html', '.csv']
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

export default function Upload() {
  const { theme, toggleTheme } = useTheme()
  const [user, setUser] = useState(null)
  const [files, setFiles] = useState([]) // { id, name, size, status, progress, markdown }
  const [activeId, setActiveId] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [copied, setCopied] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user || null))
    return () => sub.subscription.unsubscribe()
  }, [])

  const addFiles = useCallback((list) => {
    const incoming = Array.from(list).map((f) => ({
      id: crypto.randomUUID(),
      name: f.name,
      size: f.size,
      status: 'uploading',
      progress: 0,
      markdown: '',
      _raw: f,
    }))
    setFiles((prev) => [...incoming, ...prev])
    if (incoming[0]) setActiveId(incoming[0].id)
    incoming.forEach((item) => convertFile(item, setFiles))
  }, [])

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    addFiles(e.dataTransfer.files)
  }

  function removeFile(id) {
    setFiles((prev) => prev.filter((f) => f.id !== id))
    if (activeId === id) setActiveId(null)
  }

  const active = files.find((f) => f.id === activeId)

  function copyMarkdown() {
    if (!active) return
    navigator.clipboard.writeText(active.markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <Link to="/" style={s.logo}><span style={s.dot} className="dot-pulse" />Markdrop</Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button style={s.themeBtn} className="icon-btn-anim" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <UserMenu user={user} />
        </div>
      </nav>

      <div style={s.layout}>
        {/* ---------- LEFT: upload + file list ---------- */}
        <div style={s.leftCol}>
          <div
            className="dropzone-anim"
            style={{ ...s.dropzone, ...(dragOver ? s.dropzoneActive : {}) }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <UploadCloud size={28} color="var(--accent)" style={dragOver ? { transform: 'translateY(-3px)', transition: 'transform .2s ease' } : { transition: 'transform .2s ease' }} />
            <div style={s.dropTitle}>Drag and drop files to convert</div>
            <div style={s.dropSub}>{ACCEPTED.join('  ·  ')}</div>
            <button style={s.selectBtn} className="btn-lift" onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}>
              Select files
            </button>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept={ACCEPTED.join(',')}
              style={{ display: 'none' }}
              onChange={(e) => addFiles(e.target.files)}
            />
          </div>

          <div style={s.listHead}>
            <span>Files</span>
            <span style={s.listCount}>{files.length}</span>
          </div>

          <div style={s.list}>
            {files.length === 0 && (
              <div style={s.empty}>Nothing uploaded yet. Files you convert will show up here.</div>
            )}
            {files.map((f) => (
              <div
                key={f.id}
                className="row-hover fade-up"
                style={{ ...s.row, ...(activeId === f.id ? s.rowActive : {}) }}
                onClick={() => setActiveId(f.id)}
              >
                <FileText size={18} color="var(--muted)" />
                <div style={s.rowMain}>
                  <div style={s.rowName}>{f.name}</div>
                  {f.status === 'uploading' ? (
                    <div style={s.progressTrack}>
                      <div style={{ ...s.progressFill, width: `${f.progress}%` }} />
                    </div>
                  ) : (
                    <div style={s.rowMeta}>{formatSize(f.size)} · Converted</div>
                  )}
                </div>
                {f.status === 'uploading' ? (
                  <span style={s.rowPct}>{f.progress}%</span>
                ) : (
                  <span style={{ ...s.rowDone, animation: 'fadeIn .3s ease' }}><Check size={14} /></span>
                )}
                <button style={s.rowRemove} className="icon-btn-anim" onClick={(e) => { e.stopPropagation(); removeFile(f.id) }}>
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ---------- RIGHT: preview ---------- */}
        <div style={s.rightCol}>
          {!active && (
            <div style={s.previewEmpty} className="fade-in">
              <FileText size={32} color="var(--muted)" />
              <p>Select a file to preview its Markdown output.</p>
            </div>
          )}

          {active && (
            <>
              <div style={s.previewHead} className="fade-in">
                <div style={s.previewTitle}>{active.name}</div>
                <div style={s.previewActions}>
                  <button style={s.iconBtn} className="icon-btn-anim" onClick={copyMarkdown}>
                    {copied ? <Check size={15} /> : <Copy size={15} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    style={s.downloadBtn}
                    className="cta-primary"
                    disabled={active.status !== 'done'}
                    onClick={() => downloadMarkdown(active)}
                  >
                    <Download size={15} />
                    Download .md
                  </button>
                </div>
              </div>

              <div style={s.previewBody}>
                {active.status === 'uploading' ? (
                  <div style={s.converting}>
                    <span className="spin-anim" style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid var(--line)', borderTopColor: 'var(--accent)', borderRadius: '50%', marginRight: 8, verticalAlign: '-2px' }} />
                    Converting…
                  </div>
                ) : (
                  <pre style={s.markdown} className="fade-in">{active.markdown}</pre>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// --- real conversion: sends the file to /server/index.js, which runs MarkItDown ---
async function convertFile(item, setFiles) {
  setFiles((prev) => prev.map((f) => f.id === item.id ? { ...f, progress: 20 } : f))

  try {
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token
    if (!token) throw new Error('Not signed in')

    const formData = new FormData()
    formData.append('file', item._raw)

    setFiles((prev) => prev.map((f) => f.id === item.id ? { ...f, progress: 60 } : f))

    const res = await fetch(`${API_URL}/api/convert`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Conversion failed')

    setFiles((prev) => prev.map((f) => f.id === item.id
      ? { ...f, progress: 100, status: 'done', markdown: data.markdown }
      : f))
  } catch (err) {
    setFiles((prev) => prev.map((f) => f.id === item.id
      ? { ...f, progress: 100, status: 'error', markdown: `Conversion failed: ${err.message}` }
      : f))
  }
}

function formatSize(bytes) {
  if (!bytes) return '—'
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(0)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

function downloadMarkdown(file) {
  const blob = new Blob([file.markdown], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = file.name.replace(/\.[^/.]+$/, '') + '.md'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

const s = {
  page: { minHeight: '100vh', background: 'var(--ink)', color: 'var(--paper)' },
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px', borderBottom: '1px solid var(--line)' },
  logo: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 700, textDecoration: 'none' },
  dot: { width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)' },
  themeBtn: { width: 34, height: 34, borderRadius: 10, border: '1px solid var(--line)', background: 'var(--ink-2)', color: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  layout: { display: 'grid', gridTemplateColumns: '380px 1fr', minHeight: 'calc(100vh - 73px)' },
  leftCol: { borderRight: '1px solid var(--line)', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 },

  dropzone: { border: '1.5px dashed var(--line)', borderRadius: 16, padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center', cursor: 'pointer', transition: 'border-color .15s' },
  dropzoneActive: { borderColor: 'var(--accent)', background: 'rgba(124,255,178,0.05)' },
  dropTitle: { fontSize: 14.5, fontWeight: 600 },
  dropSub: { fontSize: 11.5, fontFamily: 'var(--font-mono)', color: 'var(--muted)' },
  selectBtn: { marginTop: 6, background: 'var(--ink-3)', border: '1px solid var(--line)', color: 'var(--paper)', padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600 },

  listHead: { display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  listCount: { fontFamily: 'var(--font-mono)' },
  list: { display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto' },
  empty: { fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, padding: '12px 4px' },

  row: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, border: '1px solid transparent', cursor: 'pointer' },
  rowActive: { background: 'var(--ink-2)', border: '1px solid var(--line)' },
  rowMain: { flex: 1, minWidth: 0 },
  rowName: { fontSize: 13.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  rowMeta: { fontSize: 11.5, color: 'var(--muted)', marginTop: 2 },
  progressTrack: { height: 4, background: 'var(--ink-3)', borderRadius: 4, marginTop: 6, overflow: 'hidden' },
  progressFill: { height: '100%', background: 'var(--accent)', transition: 'width .25s' },
  rowPct: { fontSize: 11.5, fontFamily: 'var(--font-mono)', color: 'var(--accent)' },
  rowDone: { color: 'var(--accent)', display: 'flex' },
  rowRemove: { background: 'none', border: 'none', color: 'var(--muted)', padding: 4, display: 'flex' },

  rightCol: { display: 'flex', flexDirection: 'column' },
  previewEmpty: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--muted)', fontSize: 14 },
  previewHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 28px', borderBottom: '1px solid var(--line)' },
  previewTitle: { fontSize: 14.5, fontWeight: 600, fontFamily: 'var(--font-mono)' },
  previewActions: { display: 'flex', gap: 10 },
  iconBtn: { display: 'flex', alignItems: 'center', gap: 6, background: 'var(--ink-2)', border: '1px solid var(--line)', color: 'var(--paper)', padding: '8px 14px', borderRadius: 10, fontSize: 13 },
  downloadBtn: { display: 'flex', alignItems: 'center', gap: 6, background: 'var(--accent)', border: 'none', color: 'var(--accent-ink)', padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700 },
  previewBody: { flex: 1, padding: 28, overflow: 'auto' },
  converting: { color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 13.5 },
  markdown: { fontFamily: 'var(--font-mono)', fontSize: 13.5, lineHeight: 1.8, color: '#D7DED9', whiteSpace: 'pre-wrap' },
}
