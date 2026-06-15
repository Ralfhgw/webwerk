import { useEffect, useState, type CSSProperties, type FormEvent } from 'react'
import './App.css'

type PageId = 'leistungen' | 'projekte' | 'ablauf' | 'kontakt'

type PageConfig = {
  id: PageId
  label: string
  eyebrow: string
  title: string
  summary: string
  highlight: string
  command: string
  code: string[]
  output: string[]
}

const pages: PageConfig[] = [
  {
    id: 'leistungen',
    label: 'Leistungen',
    eyebrow: 'Angebot',
    title: 'Webentwicklung, Automatisierung und individuelle Tools.',
    summary:
      'WebWerk entwickelt digitale Loesungen fuer Unternehmen, die online klar auftreten und technische Prozesse sinnvoll vereinfachen wollen.',
    highlight: 'Drei klare Leistungsfelder statt unnoetiger Komplexitaet.',
    command: 'webwerk build services --target local-business',
    code: [
      'const services = ["website", "automation", "tooling"]',
      'const goal = "mehr Anfragen und klarere Prozesse"',
      'deploy({ design: "blue", tone: "serioes", focus: goal })',
    ],
    output: [
      'Website-Struktur erstellt',
      'Leistungsbereiche priorisiert',
      'CTA fuer qualifizierte Anfragen vorbereitet',
    ],
  },
  {
    id: 'projekte',
    label: 'Projekte',
    eyebrow: 'Referenzen',
    title: 'Praxisnahe Projekte mit echter technischer Tiefe.',
    summary:
      'Von KI-gestuetzter Dokumentenlogik bis zur Hardware-Ansteuerung entstehen Loesungen, die auf konkrete Anforderungen reagieren.',
    highlight: 'Auswahl aus Web, KI, Automation und Sonderentwicklung.',
    command: 'webwerk inspect projects --show selected-work',
    code: [
      'project("n8n-agent").loadKnowledgeBase("/docs")',
      'project("shooting-light").connectHardware("node-controller")',
      'project("sentra").enable(["weather", "events", "chat"])',
    ],
    output: [
      '3 Referenzprojekte geladen',
      'Web, KI und Hardware kombiniert',
      'Praxisbezug fuer reale Kundenanfragen sichtbar',
    ],
  },
  {
    id: 'ablauf',
    label: 'Ablauf',
    eyebrow: 'Zusammenarbeit',
    title: 'Ein klarer Prozess von der Anfrage bis zur Betreuung.',
    summary:
      'Die Zusammenarbeit bleibt uebersichtlich: Ziele klaeren, Loesung planen, sauber umsetzen und danach erreichbar bleiben.',
    highlight: 'Strukturiert, nachvollziehbar und auf Alltagstauglichkeit ausgelegt.',
    command: 'webwerk run process --from briefing --to launch',
    code: [
      'briefing.collect({ businessGoals: true, bottlenecks: true })',
      'solution.plan({ scope: "klar", complexity: "nur wenn noetig" })',
      'support.enable({ launch: true, followUp: true })',
    ],
    output: [
      'Projektphasen definiert',
      'Umsetzung in klare Schritte zerlegt',
      'Weiterentwicklung nach Launch vorgesehen',
    ],
  },
  {
    id: 'kontakt',
    label: 'Kontakt',
    eyebrow: 'Anfrage',
    title: 'Das Kontaktformular ist der beste Einstieg fuer neue Projekte.',
    summary:
      'Eine kurze Beschreibung reicht aus. Telefon und E-Mail bleiben sichtbar, das Formular ist aber der bevorzugte erste Weg.',
    highlight: 'Direkter Einstieg ohne lange Huerden.',
    command: 'webwerk open contact --channel form',
    code: [
      'inquiry.capture({ name, company, email, message })',
      'priority.assign("ersteinschaetzung")',
      'reply.schedule("persoenliche Rueckmeldung")',
    ],
    output: [
      'Formular als primaerer Kontaktweg aktiv',
      'Telefon und E-Mail bleiben sichtbar',
      'Rueckmeldung kann gezielt vorbereitet werden',
    ],
  },
]

const services = [
  {
    title: 'Unternehmenswebsites',
    text: 'Moderne Websites mit klarem Aufbau, professioneller Wirkung und Fokus auf qualifizierte Anfragen.',
  },
  {
    title: 'n8n und KI-Automatisierung',
    text: 'Ablaufe, Formulare und Wissensprozesse werden so verbunden, dass weniger manuelle Arbeit im Tagesgeschaeft bleibt.',
  },
  {
    title: 'Individuelle Web-Tools',
    text: 'Wenn Standardsoftware nicht reicht, entstehen passgenaue Anwendungen fuer interne Anforderungen oder Spezialfaelle.',
  },
]

const projects = [
  {
    name: 'Dokumenten-Knowledge-Base mit KI-Agent',
    stack: 'n8n, KI-Agent, Vite-Formular',
    text: 'Dokumente aus einem Ordner werden als Knowledge Base genutzt und ueber ein Formular fuer strukturierte Rueckfragen erschlossen.',
  },
  {
    name: 'Schiessampel mit Hardware-Ansteuerung',
    stack: 'Node.js, externe Hardware',
    text: 'Spezialloesung zur Steuerung externer Hardware fuer eine Schiessampel. Das Projekt wurde bereits verkauft.',
  },
  {
    name: 'Sentra',
    stack: 'Wetter, Eventplanung, Chat',
    text: 'Groessere Webanwendung mit mehreren Alltagsfunktionen und standortbezogenen Informationen fuer Nutzer.',
  },
]

const processSteps = [
  'Ausgangslage, Zielgruppe und Prioritaeten gemeinsam schaerfen.',
  'Die passende Loesung als Website, Automatisierung oder Tool festlegen.',
  'Technisch sauber umsetzen und mit Blick auf den Alltag pruefen.',
  'Nach dem Launch als Ansprechpartner fuer Weiterentwicklung erreichbar bleiben.',
]

const validPages = new Set<PageId>(['leistungen', 'projekte', 'ablauf', 'kontakt'])

function getPageFromHash(hash: string): PageId {
  const id = hash.replace('#', '') as PageId
  return validPages.has(id) ? id : 'leistungen'
}

function App() {
  const [activePage, setActivePage] = useState<PageId>(() => {
    if (typeof window === 'undefined') {
      return 'leistungen'
    }

    return getPageFromHash(window.location.hash)
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    if (!window.location.hash) {
      window.history.replaceState(null, '', '#leistungen')
    }

    const syncPage = () => setActivePage(getPageFromHash(window.location.hash))
    window.addEventListener('hashchange', syncPage)

    return () => window.removeEventListener('hashchange', syncPage)
  }, [])

  function changePage(page: PageId) {
    setActivePage(page)
    window.location.hash = page
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    event.currentTarget.reset()
    setIsSubmitted(true)
  }

  const activeConfig = pages.find((page) => page.id === activePage) ?? pages[0]

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#leistungen" onClick={() => changePage('leistungen')}>
          WebWerk
        </a>
        <nav className="topnav" aria-label="Seitennavigation">
          {pages.map((page) => (
            <a
              key={page.id}
              className={page.id === activePage ? 'nav-link is-active' : 'nav-link'}
              href={`#${page.id}`}
              onClick={() => changePage(page.id)}
            >
              {page.label}
            </a>
          ))}
        </nav>
      </header>

      <div className="workspace">
        <aside className="profile-panel">
          <p className="eyebrow">Portfolio</p>
          <h1>WebWerk entwickelt serioese digitale Loesungen fuer lokale Unternehmen.</h1>
          <p className="lead">
            Fokus auf klare Websites, Automatisierung mit n8n und technische
            Umsetzung, die im Alltag stabil funktioniert.
          </p>

          <div className="overview-art">
            <img
              src="/illustrations/overview.svg"
              alt="Abstrakte blaue Grafik fuer die Portfolio-Uebersicht"
            />
          </div>

          <div className="signal-grid">
            <div className="signal-card">
              <strong>Zielgruppen</strong>
              <span>Handwerk, Immobilien und Praxen</span>
            </div>
            <div className="signal-card">
              <strong>Schwerpunkt</strong>
              <span>saubere Technik statt leerer Buzzwords</span>
            </div>
            <div className="signal-card">
              <strong>Kontaktweg</strong>
              <span>Formular zuerst, Telefon und E-Mail sichtbar</span>
            </div>
          </div>
        </aside>

        <main className="content-panel">
          <section className="page-hero">
            <div>
              <p className="eyebrow">{activeConfig.eyebrow}</p>
              <h2>{activeConfig.title}</h2>
            </div>
            <p className="page-summary">{activeConfig.summary}</p>
            <div className="page-highlight">{activeConfig.highlight}</div>
          </section>

          <section className="page-grid">
            <article className="visual-card">
              <TerminalPreview
                title={activeConfig.label}
                command={activeConfig.command}
                code={activeConfig.code}
                output={activeConfig.output}
              />
            </article>

            <div className="page-stack">{renderPage(activePage, handleSubmit, isSubmitted)}</div>
          </section>
        </main>
      </div>
    </div>
  )
}

type TerminalPreviewProps = {
  title: string
  command: string
  code: string[]
  output: string[]
}

function TerminalPreview({ title, command, code, output }: TerminalPreviewProps) {
  return (
    <div className="terminal-window" aria-label={`Terminalansicht fuer ${title}`}>
      <div className="terminal-topbar">
        <div className="terminal-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <span className="terminal-title">webwerk-cli</span>
      </div>

      <div className="terminal-body">
        <p className="terminal-command">$ {command}</p>

        <div className="terminal-code">
          {code.map((line, index) => (
            <div
              key={line}
              className="terminal-line"
              style={{ '--line-delay': `${index * 160}ms` } as CSSProperties}
            >
              <span className="terminal-line-number">{String(index + 1).padStart(2, '0')}</span>
              <code>{line}</code>
            </div>
          ))}
        </div>

        <div className="terminal-output">
          {output.map((line) => (
            <p key={line}>&gt; {line}</p>
          ))}
        </div>
      </div>
    </div>
  )
}

function renderPage(
  page: PageId,
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void,
  isSubmitted: boolean,
) {
  if (page === 'leistungen') {
    return (
      <>
        <section className="panel-card">
          <h3>Leistungsfelder</h3>
          <div className="info-grid">
            {services.map((service) => (
              <article key={service.title} className="mini-card">
                <h4>{service.title}</h4>
                <p>{service.text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="panel-card">
          <h3>Was Kunden davon haben</h3>
          <ul className="bullet-list">
            <li>Ein professioneller Auftritt, der Vertrauen schafft.</li>
            <li>Weniger Reibung in wiederkehrenden Arbeitsablaeufen.</li>
            <li>Eine technische Loesung, die wirklich zum Bedarf passt.</li>
          </ul>
        </section>
      </>
    )
  }

  if (page === 'projekte') {
    return (
      <section className="panel-card">
        <h3>Ausgewaehlte Arbeiten</h3>
        <div className="info-grid">
          {projects.map((project) => (
            <article key={project.name} className="mini-card">
              <p className="mini-meta">{project.stack}</p>
              <h4>{project.name}</h4>
              <p>{project.text}</p>
            </article>
          ))}
        </div>
      </section>
    )
  }

  if (page === 'ablauf') {
    return (
      <>
        <section className="panel-card">
          <h3>Projektablauf</h3>
          <ol className="step-list">
            {processSteps.map((step, index) => (
              <li key={step} className="step-item">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </section>
        <section className="panel-card">
          <h3>Worauf der Ablauf ausgelegt ist</h3>
          <ul className="bullet-list">
            <li>Weniger Unklarheit in der Abstimmung.</li>
            <li>Planbare technische Umsetzung.</li>
            <li>Ein fester Ansprechpartner auch nach dem Go-live.</li>
          </ul>
        </section>
      </>
    )
  }

  return (
    <>
      <section className="panel-card">
        <h3>Kontaktinformationen</h3>
        <div className="contact-info-grid">
          <div className="mini-card">
            <h4>Telefon</h4>
            <a href="tel:+49-000-0000000">[deine Telefonnummer]</a>
          </div>
          <div className="mini-card">
            <h4>E-Mail</h4>
            <a href="mailto:[deine-email@domain.de]">[deine-email@domain.de]</a>
          </div>
        </div>
      </section>

      <form className="panel-card contact-form" onSubmit={handleSubmit}>
        <h3>Projektanfrage</h3>
        <label>
          Name
          <input type="text" name="name" placeholder="Ihr Name" required />
        </label>
        <label>
          Unternehmen
          <input type="text" name="company" placeholder="Unternehmen oder Projekt" />
        </label>
        <label>
          E-Mail
          <input type="email" name="email" placeholder="ihre@email.de" required />
        </label>
        <label>
          Anliegen
          <textarea
            name="message"
            rows={5}
            placeholder="Beschreiben Sie kurz, welche Website, Automatisierung oder Loesung Sie planen."
            required
          />
        </label>
        <button className="primary-button" type="submit">
          Anfrage senden
        </button>
        <p className="form-note">
          {isSubmitted
            ? 'Danke. Das Formular ist vorbereitet und kann jetzt an den gewuenschten Versandweg angebunden werden.'
            : 'Kurze Angaben reichen voellig aus. Ich kann das Anliegen daraufhin gezielt einordnen.'}
        </p>
      </form>
    </>
  )
}

export default App
