import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { execFile } from 'node:child_process'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { createClient } from '@supabase/supabase-js'

const app = express()
app.use(cors())

// Service-role client — server-side only, never expose this key to the frontend.
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const upload = multer({ dest: os.tmpdir(), limits: { fileSize: 25 * 1024 * 1024 } }) // 25MB cap

// ---- auth middleware: verifies the Supabase JWT sent from the frontend ----
async function requireUser(req, res, next) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Missing auth token' })

  const { data, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !data.user) return res.status(401).json({ error: 'Invalid or expired session' })

  req.user = data.user
  next()
}

app.post('/api/convert', upload.single('file'), requireUser, async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

  const tmpPath = req.file.path
  const originalName = req.file.originalname

  try {
    // Run MarkItDown as a subprocess. Requires Python + `pip install "markitdown[all]"` on this host.
    const markdown = await runMarkItDown(tmpPath)

    // Store the result in Supabase Storage under the user's folder.
    const mdFilename = originalName.replace(/\.[^/.]+$/, '') + '.md'
    const storagePath = `${req.user.id}/${Date.now()}-${mdFilename}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from('documents')
      .upload(storagePath, markdown, { contentType: 'text/markdown' })
    if (uploadError) throw uploadError

    // Record it in the files table.
    const { data: fileRow, error: dbError } = await supabaseAdmin
      .from('files')
      .insert({
        user_id: req.user.id,
        original_name: originalName,
        markdown_path: storagePath,
        size_bytes: req.file.size,
        status: 'done',
      })
      .select()
      .single()
    if (dbError) throw dbError

    res.json({ markdown, file: fileRow })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message || 'Conversion failed' })
  } finally {
    await fs.unlink(tmpPath).catch(() => {})
  }
})

function runMarkItDown(filePath) {
  return new Promise((resolve, reject) => {
    execFile('py', ['-m', 'markitdown', filePath], { maxBuffer: 1024 * 1024 * 20 }, (err, stdout, stderr) => {
      // On Linux/macOS hosts (e.g. Render, Railway) use 'markitdown' directly instead of 'py -m markitdown'.
      if (err) return reject(new Error(stderr || err.message))
      resolve(stdout)
    })
  })
}

const PORT = process.env.PORT || 8787
app.listen(PORT, () => console.log(`markdrop-server listening on :${PORT}`))
