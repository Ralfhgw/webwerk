// /opt/webwerk-contact-service/contact-service.mjs
import dotenv from 'dotenv'
import express from 'express'
import { Resend } from 'resend'

dotenv.config({ path: process.env.CONTACT_ENV_FILE ?? '.env.contact-service.local' })

const requiredEnv = ['RESEND_API_KEY', 'CONTACT_FROM_EMAIL', 'CONTACT_TO_EMAIL']

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error('Missing required environment variable: ' + key)
  }
}

const app = express()
const resend = new Resend(process.env.RESEND_API_KEY)
const port = Number(process.env.CONTACT_SERVICE_PORT ?? 8787)

const inboundAllowedRecipients = parseEmailList(process.env.INBOUND_ALLOWED_TO_EMAILS)
const inboundForwardRecipients = parseEmailList(process.env.INBOUND_FORWARD_TO_EMAILS)
const inboundForwardFrom = process.env.INBOUND_FORWARD_FROM_EMAIL ?? process.env.CONTACT_FROM_EMAIL
const inboundWebhookSecret = process.env.RESEND_WEBHOOK_SECRET ?? ''
const inboundForwardingConfigured =
  Boolean(inboundWebhookSecret) &&
  Boolean(inboundForwardFrom) &&
  inboundAllowedRecipients.length > 0 &&
  inboundForwardRecipients.length > 0

app.post('/api/resend/webhook', express.text({ type: '*/*', limit: '2mb' }), async (req, res) => {
  if (!inboundForwardingConfigured) {
    return res.status(503).json({ error: 'Inbound forwarding is not configured.' })
  }

  const payload = typeof req.body === 'string' ? req.body : ''
  const svixId = getHeaderValue(req.headers['svix-id'])
  const svixTimestamp = getHeaderValue(req.headers['svix-timestamp'])
  const svixSignature = getHeaderValue(req.headers['svix-signature'])

  if (!payload || !svixId || !svixTimestamp || !svixSignature) {
    return res.status(400).json({ error: 'Missing webhook payload or signature headers.' })
  }

  let event

  try {
    event = resend.webhooks.verify({
      payload,
      headers: {
        id: svixId,
        timestamp: svixTimestamp,
        signature: svixSignature,
      },
      webhookSecret: inboundWebhookSecret,
    })
  } catch (error) {
    console.error('Resend webhook verification failed:', error)
    return res.status(401).json({ error: 'Invalid webhook signature.' })
  }

  if (event.type !== 'email.received') {
    return res.status(200).json({ ok: true, ignored: true, type: event.type })
  }

  const receivedRecipients = [...event.data.received_for, ...event.data.to]
    .map(normalizeEmail)
    .filter(Boolean)
  const isAllowedRecipient = receivedRecipients.some((recipient) => inboundAllowedRecipients.includes(recipient))

  if (!isAllowedRecipient) {
    return res.status(200).json({ ok: true, ignored: true, reason: 'recipient_not_allowed' })
  }

  try {
    const { error } = await resend.emails.receiving.forward(
      {
        emailId: event.data.email_id,
        from: inboundForwardFrom,
        to: inboundForwardRecipients,
        passthrough: true,
      },
      {
        idempotencyKey: 'inbound-forward/' + event.data.email_id,
      },
    )

    if (error) {
      console.error('Resend inbound forward error:', error)
      return res.status(502).json({ error: 'Inbound forwarding failed.' })
    }

    return res.status(200).json({ ok: true, forwarded: true })
  } catch (error) {
    console.error('Inbound forwarding error:', error)
    return res.status(500).json({ error: 'Serverfehler bei der E-Mail-Weiterleitung.' })
  }
})

app.use(express.json({ limit: '25kb' }))

function getString(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function getHeaderValue(value) {
  return typeof value === 'string' ? value : Array.isArray(value) ? value[0] ?? '' : ''
}

function normalizeEmail(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function parseEmailList(value) {
  if (typeof value !== 'string') {
    return []
  }

  return value
    .split(',')
    .map((entry) => normalizeEmail(entry))
    .filter(Boolean)
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll(String.fromCharCode(34), '&quot;')
    .split(String.fromCharCode(39)).join('&#39;')
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
    const html = [
      '<p>Neue Anfrage vom webwerk.pro Portal</p>',
      '<p><strong>Von:</strong> ' + escapeHtml(email) + '</p>',
      '<p><strong>Betreff:</strong> ' + escapeHtml(title) + '</p>',
      '<hr />',
      '<pre style=' + String.fromCharCode(34) + 'font: inherit; white-space: pre-wrap;' + String.fromCharCode(34) + '>' + escapeHtml(message) + '</pre>',
    ].join('')

    const { error } = await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL,
      to: [process.env.CONTACT_TO_EMAIL],
      replyTo: email,
      subject: '[WebWerk] ' + title,
      text: [
        'Neue Anfrage vom webwerk.pro Portal',
        '',
        'Von: ' + email,
        'Betreff: ' + title,
        '',
        message,
      ].join('\n'),
      html,
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
  console.log('Contact service listening on http://127.0.0.1:' + port)
})
