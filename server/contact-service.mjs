// /opt/webwerk-contact-service/contact-service.mjs
import dotenv from 'dotenv'
import express from 'express'
import { Resend } from 'resend'

dotenv.config({ path: process.env.CONTACT_ENV_FILE ?? '.env.contact-service.local' })

const requiredEnv = ['RESEND_API_KEY', 'CONTACT_FROM_EMAIL', 'CONTACT_TO_EMAIL']

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
}

const app = express()
const resend = new Resend(process.env.RESEND_API_KEY)
const port = Number(process.env.CONTACT_SERVICE_PORT ?? 8787)

app.use(express.json({ limit: '25kb' }))

function getString(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.post('/api/contact', async (req, res) => {
  const email = getString(req.body?.email, 160)
  const title = getString(req.body?.title, 140)
  const message = getString(req.body?.message, 5000)

  if (!email || !title || !message) {
    return res.status(400).json({ error: 'Bitte alle Felder ausfüllen.' })
  }

 if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Bitte eine gültige E-Mail-Adresse angeben.' })
  }

  try {
    const { error } = await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL,
      to: [process.env.CONTACT_TO_EMAIL],
      replyTo: email,
      subject: `[WebWerk] ${title}`,
      text: [
        'Neue Anfrage über das Kontaktformular',
        '',
        `Von: ${email}`,
        `Betreff: ${title}`,
        '',
        message,
      ].join('\n'),
      html: `
        <h2>Neue Anfrage über das Kontaktformular</h2>
        <p><strong>Von:</strong> ${escapeHtml(email)}</p>
        <p><strong>Betreff:</strong> ${escapeHtml(title)}</p>
        <hr />
        <pre style="font: inherit; white-space: pre-wrap;">${escapeHtml(message)}</pre>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return res.status(502).json({ error: 'E-Mail-Versand fehlgeschlagen.' })
    }

    return res.status(200).json({ message: 'Nachricht erfolgreich versendet.' })
  } catch (error) {
    console.error('Contact service error:', error)
    return res.status(500).json({ error: 'Serverfehler beim Versand.' })
  }
})

app.listen(port, '127.0.0.1', () => {
  console.log(`Contact service listening on http://127.0.0.1:${port}`)
})