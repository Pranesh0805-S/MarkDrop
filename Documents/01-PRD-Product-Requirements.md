# Markdrop — Product Requirements Document (PRD)

## 1. Summary

Markdrop is a web application that converts everyday documents (Word, PDF, PowerPoint, Excel, HTML, CSV) into clean Markdown, using the open-source [MarkItDown](https://github.com/microsoft/markitdown) library as its conversion engine. It replaces a terminal-based workflow (`py -m markitdown file.pdf > file.md`) with a drag-and-drop web interface, so non-technical users (students, writers, researchers, AI users) can convert files without installing Python or touching a command line.

## 2. Problem Statement

MarkItDown is a powerful open-source tool, but it only exists as a Python library/CLI. This creates a real barrier:
- Requires Python, pip, and command-line comfort
- No visual feedback, no preview, no history
- Not usable from a phone or shared with non-technical teammates

Markdrop solves this by wrapping MarkItDown in a full web product: upload → convert → preview → download, with accounts so users can come back to a familiar, secure space.

## 3. Target Users

- Students converting lecture PDFs/slides into Markdown notes (for Obsidian, Notion, etc.)
- Writers/researchers who want document content in a lightweight, versionable format
- Developers/AI users who need clean Markdown to feed into LLM prompts or documentation
- Teams who want a shared, no-install conversion tool

## 4. Goals

- Zero-install document-to-Markdown conversion via browser
- Secure, private accounts — no user can ever see another user's files
- Support the most common office/document formats
- Feel fast and modern, not like a bolted-on CLI wrapper

## 5. Non-Goals (for current version)

- Editing Markdown after conversion (view/copy/download only)
- OCR for scanned/image-based PDFs
- AI-powered summarization, translation, or Q&A on documents (explicitly considered as a "v3" idea, not built)
- Team/workspace sharing of converted files
- Mobile native apps (web is responsive but not a packaged app)

## 6. Core Features (Current Build)

| Feature | Status |
|---|---|
| Drag-and-drop file upload | ✅ Built |
| Convert docx/pdf/pptx/xlsx/html/csv to Markdown | ✅ Built |
| Live Markdown preview | ✅ Built |
| Copy to clipboard | ✅ Built |
| Download `.md` file | ✅ Built |
| Email/password signup with OTP email verification | ✅ Built |
| Sign in | ✅ Built |
| Forgot password via emailed OTP | ✅ Built |
| OAuth: Google, GitHub, Microsoft, Apple | ✅ Built (requires each provider configured by the deployer) |
| Per-user file privacy (Row Level Security) | ✅ Built |
| Dark/light theme toggle | ✅ Built |
| Avatar / account menu (shows OAuth profile photo or initials) | ✅ Built |
| Real-time input validation (email format, password strength) | ✅ Built |

## 7. Future Feature Ideas (Not Built — Candidates for Contributors)

- **Batch upload**: convert multiple files at once, download as a `.zip`
- **Folder upload**: drag in an entire folder
- **OCR support**: extract text from scanned/image PDFs (MarkItDown supports plugins for this)
- **AI formatting cleanup**: post-process MarkItDown's raw output with an LLM to fix messy tables/headings
- **File history**: list of previously converted files per user (the `files` database table already supports this — no UI built yet)
- **Export formats**: besides `.md`, offer `.txt`, `.html`, `.docx` round-trip
- **Team workspaces**: shared conversion history for an organization
- **Public API**: `POST /convert` for developers to integrate directly
- **AI Document Toolkit** (bigger vision): summarize, translate, generate flashcards/quizzes, "chat with document" — turns Markdrop from a utility into a productivity platform

## 8. Success Metrics (Suggested)

- Time from file upload to downloadable Markdown (target: under 5 seconds for files under 5MB, excluding cold-start delay on free hosting tiers)
- Signup → first successful conversion completion rate
- Returning user rate (does the account system add enough value that people come back vs. using the CLI directly)

## 9. Constraints

- Backend must run Python (for the `markitdown` CLI), so it cannot be hosted on purely serverless/edge platforms — needs a persistent Node process host (currently Render).
- Free-tier email sending (Resend's shared testing domain) can only send to the developer's own inbox until a real domain is purchased and verified — this limits real-world multi-user testing until that step is done.
- Free-tier hosting on Render sleeps after inactivity, adding a ~50 second cold-start delay to the first request after idle time.
