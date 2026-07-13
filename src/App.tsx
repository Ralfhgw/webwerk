import { useEffect, useState, type SubmitEventHandler } from 'react'
import type { PageConfig, ProjectCard, PageLayout, PageId, PagePreviewVariant } from './types'

type ContactSubmitState = {
  status: 'idle' | 'sending' | 'success' | 'error'
  message: string
}

const idleContactSubmitState: ContactSubmitState = {
  status: 'idle',
  message: '',
}

const contactRevealClass =
  'inline-flex items-center justify-center rounded-[10px] border border-[rgba(132,153,207,0.24)] bg-[rgba(25,35,55,0.75)] px-3.5 py-2.5 text-[#dbe5f6] no-underline transition hover:border-[rgba(132,153,207,0.34)] hover:text-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[rgba(125,161,255,0.2)]'

const obfuscatedPhone = [61, 34, 47, 59, 39, 35, 39, 35, 59, 36, 37, 35, 36, 33, 33, 38]
const obfuscatedEmail = [68, 119, 122, 112, 56, 88, 115, 99, 123, 119, 120, 120, 86, 97, 115, 116, 97, 115, 100, 125, 56, 102, 100, 121]

function decodeObfuscatedContact(values: number[]) {
  return values.map((value) => String.fromCharCode(value ^ 22)).join('')
}


const pages: PageConfig[] = [
  // Seitenkonfiguration HOME
  {
    id: 'home',
    label: 'Home',
    eyebrow: 'Angebot',
    title: 'Webentwicklung, Automatisierung und individuelle Tools.',
    summary: 'WebWerk entwickelt und betreut als Einzelunternehmen digitale Lösungen für Anwender und arbeitet sowohl eigenständig als auch in Teams an Projekten.',
    highlight: 'Drei klare Leistungsfelder statt unnötiger Komplexität.',
    command: 'webwerk build services --target local-business',
    code: [
      'const services = ["website", "automation", "tooling"]',
      'const goal = "Realisierung technischer Ideen nach Vorstellung der Kunden"',
      'deploy({ design: "blue", tone: "seriös", focus: goal })',
    ],
    output: [
      'Website-Struktur erstellt',
      'Leistungsbereiche priorisiert',
      'CTA für qualifizierte Anfragen vorbereitet',
    ],
  },
  // Seitenkonfiguration Projekte
  {
    id: 'projekte',
    label: 'Projekte',
    eyebrow: 'Referenzen',
    title: 'Praxisnahe Projekte mit echter technischer Tiefe.',
    summary:
      'Von KI-gestützter Dokumentenlogik bis zur Hardware-Ansteuerung entstehen Lösungen, die auf konkrete Anforderungen reagieren.',
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
      'Praxisbezug für reale Kundenanfragen sichtbar',
    ],
    image: {
      src: '/images/webwerk-projects.jpg',
      alt: 'Dunkles technisches Setup mit mehreren Displays für Projektentwicklung und Dashboards',
      position: 'center center',
    },
  },
  // Seitenkonfiguration Kontakt
  {
    id: 'kontakt',
    label: 'Kontakt',
    eyebrow: 'Anfrage',
    title: 'Das Kontaktformular ist der beste Einstieg für neue Projekte.',
    summary:
      'Sende eine kurze Anfrage im Formular.',
    highlight: 'Direkter Einstieg ohne lange Hürden.',
    command: 'webwerk open contact --channel form',
    code: [
      'inquiry.capture({ name, company, email, message })',
      'priority.assign("ersteinschätzung")',
      'reply.schedule("persönliche Rückmeldung")',
    ],
    output: [
      'Formular als primärer Kontaktweg aktiv',
      'Telefon und E-Mail bleiben sichtbar',
      'Rückmeldung kann gezielt vorbereitet werden',
    ],
    image: {
      src: '/images/contact.png',
      alt: 'Laptop mit eingeblendeter Kontaktseite und Formular für Projektanfragen',
      position: 'center center',
    },
  },
]

// Startseite - Auflistung der Leistungsfelder
const services = [
  {
    title: 'Unternehmenswebsites',
    text: 'Moderne Websites mit klarem Aufbau, basierend auf modernen Technologien wie React, Next.js, Tailwind und Fokus auf ein ansprechendes Design.',
  },
  {
    title: 'n8n und KI-Automatisierung',
    text: 'Abläufe, Formulare und Wissensprozesse werden so verbunden, dass weniger manuelle Arbeit im Tagesgeschäft bleibt.',
  },
  {
    title: 'Individuelle Web-Tools',
    text: 'Wenn Standardsoftware nicht reicht, entstehen passgenaue Anwendungen für interne Anforderungen oder Spezialfälle.',
  },
]

// Startseite - Auflistung der Benefits
const homeBenefits = [
  'Ein professioneller Auftritt, der Vertrauen schafft.',
  'Weniger Reibung in wiederkehrenden Arbeitsabläufen.',
  'Eine technische Lösung, die wirklich zum Bedarf passt.',
]

// Projektseite - Auflistung der Projekte
const projects: ProjectCard[] = [
  {
    name: 'KI-Agent mit RAM-basiertem Vektorspeicher',
    stack: 'Automatisierung von Informations- und Dokumentenprozessen',
    text: (
      <>
        <strong>Funktion:</strong> Dieser Workflow verwandelt n8n in ein schlankes, selbstgehostetes RAG-System
        (Retrieval-Augmented Generation). Über einen einfachen Upload lassen sich beliebige Dateien
        einspeisen: Der Text wird automatisch in sinnvolle Abschnitte zerlegt (Recursive Text
        Splitter), in Vektoren umgewandelt (Embeddings) und im Arbeitsspeicher abgelegt. Ein
        Chat-Agent kann anschließend gezielt auf dieses Wissen zugreifen und Fragen dazu beantworten
        – inklusive Gesprächsgedächtnis (Window Buffer Memory), damit der Kontext über mehrere
        Nachrichten hinweg erhalten bleibt. Ein separater Flow erlaubt es, den Speicher jederzeit
        manuell zurückzusetzen. <br></br>
        <strong>Verwendung &amp; Technologie:</strong> Ideal für Prototypen,
        Demos oder kleinere Wissensdatenbanken, bei denen keine dauerhafte Speicherung nötig ist –
        etwa um schnell mit einem neuen Dokument zu experimentieren, ohne eine externe Datenbank
        aufzusetzen. Als Sprachmodell und Embedding-Engine kommt Ollama zum Einsatz, läuft also
        vollständig lokal und ohne Cloud-Abhängigkeit. Der Verzicht auf eine persistente
        Vektordatenbank macht das Setup bewusst leichtgewichtig: schnell eingerichtet, schnell
        zurückgesetzt, perfekt für iteratives Testen.
      </>
    ),
    image: {
      src: '/images/n8n-ki-agent-ram-workflow.png',
      alt: 'Workflow für einen n8n KI-Agenten mit Webhook, AI Agent und Dokumentenverarbeitung',
    },
  },
    {
    name: 'KI-Agent mit Qdrant-Vektordatenbank & Webhook-API',
    stack: 'Automatisierung von Informations- und Dokumentenprozessen',
    text: (
      <>
      <strong>Funktion:</strong>
      Dieser Workflow baut auf dem gleichen Grundprinzip auf, geht aber einen entscheidenden Schritt weiter: Statt flüchtigem Arbeitsspeicher nutzt er Qdrant als persistente Vektordatenbank. Dokumente (inklusive PDFs) werden direkt von der Festplatte eingelesen, per Ollama-Embeddings indexiert und dauerhaft gespeichert. Der gesamte Agent ist als API konzipiert: Ein Webhook nimmt Chat-Anfragen per POST entgegen, der KI-Agent verarbeitet sie mithilfe von Chat-Verlauf (Simple Memory) und Wissensdatenbank, und die Antwort wird strukturiert als JSON zurückgegeben. Ein zweiter Webhook ermöglicht das gezielte Löschen einzelner Collections in der Datenbank, ein Schedule-Trigger sorgt für automatisierte Abläufe im Hintergrund.<br></br>
      <strong>Verwendung & Technologie:</strong>
      Dieses Setup eignet sich für produktivere Anwendungsfälle, bei denen Wissen dauerhaft erhalten bleiben und von außen – etwa von einer Website oder App – angesprochen werden soll. Durch die Webhook-Schnittstelle lässt sich der Agent nahtlos in bestehende Systeme integrieren, ganz ohne n8n-Oberfläche im laufenden Betrieb. Auch hier läuft die KI vollständig über Ollama, während Qdrant als schnelle, skalierbare Open-Source-Vektordatenbank die Grundlage für zuverlässiges, langfristiges Wissensmanagement bildet.
      </>
    ),
    image: {
      src: '/images/n8n-ki-agent-vector-workflow.png',
      alt: 'Workflow für einen n8n KI-Agenten mit Webhook, AI Agent, Qdrant Vector Store und Dokumentenverarbeitung',
    },
  },
   {
    name: 'LLM + Logic Prover – ReAct Agent mit RISCTP',
    stack: 'Automatisierung von Informations- und Dokumentenprozessen',
    text: (
      <>
        <strong>Funktion:</strong> Dieses Projekt schlägt eine Brücke zwischen natürlicher Sprache und formaler Logik. Ein ReAct-Agent nimmt Anfragen wie „Alle Quadrate sind Rechtecke, diese Figur ist ein Quadrat, folgere: diese Figur ist ein Rechteck" entgegen und übersetzt sie automatisch in eine formale Logiksprache (FOL-PRE). Anschließend prüft ein eigener Parser und Checker die Eingabe auf Syntax- und Semantikfehler, bevor sie in die Syntax des externen Beweiswerkzeugs RISCTP übersetzt wird. Ein Solver versucht daraufhin, den Beweis tatsächlich zu führen – das Ergebnis (gültig oder nicht) wird zusammen mit der Solver-Ausgabe an den Nutzer zurückgegeben. Der Clou: Das LLM entscheidet selbst, wann welches Werkzeug gebraucht wird, und nutzt dafür zwei Tools – download zum Nachladen von Hilfsdateien und prove zur eigentlichen Beweisführung. <br></br>
        <strong>Verwendung &amp; Technologie:</strong> Der Agent ist modular aus klar getrennten Komponenten aufgebaut: Scanner und Parser zerlegen den Eingabetext und bauen eine Baumstruktur, der Checker prüft Symbole, Typen und Prädikate, ein eigener Übersetzer erzeugt daraus valide RISCTP-Syntax, und ein Executor kümmert sich um das Starten und Überwachen des externen Prover-Prozesses. Als Sprachmodell lässt sich wahlweise OpenAI, Google Gemini, Anthropic oder ein lokales Ollama-Modell einbinden, angebunden über LangChain/LangGraph. Eine schlanke Flask-Weboberfläche mit Chat-Funktion und Konversationsspeicher rundet das Ganze ab – so bleibt auch bei mehrschrittigen Sitzungen der Kontext erhalten. Ziel ist bewusst kein allmächtiger KI-Assistent, sondern ein nachvollziehbarer, transparenter Ablauf: Verstehen → Prüfen → Übersetzen → Beweisen → Antworten – ideal für alle, die sich für die Schnittstelle von KI und formaler Verifikation interessieren.
      </>
    ),
    image: {
      src: '/images/RISCTP_scenario.png',
      alt: 'Workflow für einen n8n KI-Agenten mit Webhook, AI Agent und Dokumentenverarbeitung',
    },
  },
   {
    name: 'SENTRA - Umfangreiches Webprojekt mit externen Auth-Server',
    stack: 'Webprojekt',
    text: (
      <>
        <strong>Funktion:</strong> Sentra ist eine personalisierte Informationsplattform, die alltagsrelevante Inhalte in einer einzigen Webanwendung bündelt. Nach dem Login erhalten Nutzerinnen und Nutzer einen zentralen Überblick über Wetterdaten, regionale Veranstaltungen, Livebilder und Streams sowie Sensordaten aus dem eigenen Umfeld. Die Anwendung soll dabei helfen, Informationen schneller zu erfassen, ohne zwischen mehreren externen Diensten wechseln zu müssen. Perspektivisch erweitert das Projekt diesen Ansatz zusätzlich um Echtzeit-Kommunikation über das Modul LiveTalk. <br></br>
        <strong>Verwendung &amp; Technologie:</strong> Sentra ist für den Einsatz als individuelles Dashboard gedacht: Inhalte wie Standort, Sprache, aktivierte Module, Quellen und persönliche Einstellungen können pro Benutzer angepasst werden. Dadurch eignet sich das System besonders für Freizeit-, Alltags- und Reiseplanung sowie für die Kombination aus lokalen Informationen und technischen Live-Daten. Technisch basiert das Projekt im Frontend auf Next.js, React, TypeScript und Tailwind CSS. Ergänzt wird die Hauptanwendung durch einen separaten Express-basierten Authentifizierungsserver sowie weitere Microservices für Streaming, Messaging und Echtzeitfunktionen. Eingebunden sind unter anderem Open-Meteo für Wetterdaten, SERPAPI für Eventinformationen, Cloudinary für Medienverwaltung, MQTT mit Mosquitto für Sensordaten, MediaMTX für Live-Streams und MediaSoup für WebRTC-Kommunikation.
      </>
    ),
    image: {
      src: '/images/sentra.png',
      alt: 'Grössere Webanwendung mit mehreren Alltagsfunktionen und standortbezogenen Informationen für Nutzer.',
    },
  },
   {
    name: 'Archery-Timer',
    stack: 'Webprojekt',
    text: (
      <>
        <strong>Funktion:</strong> Der Archery Timer ist ein spezialisiertes Gerät für den Einsatz bei Bogenschießen-Turnieren. Er übernimmt die komplette Zeitsteuerung während des Wettkampfs: Ein Countdown mit klarer Ziffernanzeige führt die Schützen durch die vorgeschriebenen Zeitintervalle nach den Vorgaben der Verbände DBSV und DSB, unterstützt durch akustische Signaltöne über eingebaute Lautsprecher. Zusätzlich zeigt das Gerät die aktuelle Uhrzeit an und kann zwischendurch Musik abspielen. Die Steuerung erfolgt komfortabel per Fernzugriff – entweder über einen Internetbrowser via WLAN oder direkt per SSH – sodass Kampfrichter das Gerät bequem aus der Distanz bedienen können. Über eine zusätzliche Schnittstelle lässt sich außerdem eine externe Signallampe anschließen, um optische Signale für die Schützen sichtbar zu machen. <br></br>
        <strong>Verwendung &amp; Technologie:</strong> Das Herzstück bildet ein Raspberry Pi in Kombination mit dem Adafruit RGB Matrix HAT (inklusive RTC-Modul), der als Schnittstelle zu 32x64- oder 64x64-RGB-LED-Matrizen mit HUB75-Anschluss dient. Für die drahtlose Steuerung wurde ein eigener WLAN-Hotspot per RASPAP eingerichtet, wodurch sich das Gerät direkt über den Browser ansteuern lässt, ganz ohne bestehendes Heimnetzwerk. Die Anzeige auf der LED-Matrix wird über die bewährte Open-Source-Bibliothek rpi-rgb-led-matrix von Adafruit angesteuert, ergänzt durch Python-Bibliotheken für Bildverarbeitung (PIL) und Netzwerkkommunikation (requests). Das Ergebnis ist eine robuste, portable Lösung, die speziell auf die Anforderungen im Turnierbetrieb zugeschnitten ist – zuverlässig, gut ablesbar und flexibel fernsteuerbar.
      </>
    ),
    image: {
      src: '/images/archery_timer.png',
      alt: 'Grössere Webanwendung mit mehreren Alltagsfunktionen und standortbezogenen Informationen für Nutzer.',
    },
  },
]

const validPages = new Set<PageId>(['home', 'projekte', 'kontakt'])

const eyebrowClass = 'text-[0.78rem] font-semibold uppercase tracking-[0.22em] text-[#8ea9ff]'
const panelCardClass = 'rounded-[24px] border border-[rgba(148,163,184,0.16)] bg-[linear-gradient(180deg,rgba(14,21,35,0.92),rgba(11,17,29,0.88))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_24px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl'
const miniCardClass = 'rounded-[20px] border border-[rgba(148,163,184,0.14)] bg-[linear-gradient(180deg,rgba(21,31,50,0.94),rgba(16,24,40,0.9))] p-[18px] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
const overlayInputClass = 'h-full w-full rounded-[10px] border border-[rgba(200,209,225,0.78)] bg-[rgba(255,255,255,0.18)] px-[clamp(0.32rem,0.9vw,0.9rem)] text-[clamp(0.44rem,0.9vw,0.9rem)] text-[#162237] outline-none backdrop-blur-[0.6px] transition placeholder:text-transparent focus:border-[rgba(125,161,255,0.55)] focus:bg-[rgba(255,255,255,0.56)] focus:ring-2 focus:ring-[rgba(125,161,255,0.16)]'
const overlayButtonClass = 'flex h-full w-full items-center justify-center rounded-[8px] bg-[linear-gradient(135deg,rgba(20,31,54,0.98),rgba(40,57,95,0.96))] text-[clamp(0.46rem,0.92vw,0.92rem)] font-semibold text-white shadow-[0_10px_24px_rgba(12,23,41,0.32)] transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[rgba(125,161,255,0.24)]'
const projectImageClass = 'mt-4 w-full rounded-[18px] border border-[rgba(148,163,184,0.14)] bg-[rgba(9,14,25,0.92)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_16px_34px_rgba(0,0,0,0.24)]'
const activeNavLinkClass = 'rounded-full border border-[rgba(132,153,207,0.34)] bg-[linear-gradient(135deg,rgba(34,46,72,0.98),rgba(64,83,124,0.94))] px-3.5 py-2.5 text-[#f8fafc] no-underline shadow-[0_10px_24px_rgba(0,0,0,0.24)] transition'
const inactiveNavLinkClass = 'rounded-full border border-transparent px-3.5 py-2.5 text-[#8b9ab8] no-underline transition hover:-translate-y-0.5 hover:border-[rgba(132,153,207,0.18)] hover:bg-[rgba(25,35,55,0.75)] hover:text-[#f8fafc]'
const standardSectionClass = 'grid min-h-0 flex-1 gap-4.5 xl:grid-cols-[minmax(260px,0.78fr)_minmax(0,1.22fr)]'
const photoSectionClass = 'grid gap-4.5'
const standardPreviewCardClass = 'flex items-stretch justify-center rounded-3xl border border-[rgba(148,163,184,0.14)] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_35%),linear-gradient(180deg,rgba(17,25,42,0.98),rgba(10,17,29,0.92))] p-4'
const photoPreviewCardClass = 'flex min-h-[clamp(340px,42vw,600px)] justify-center rounded-3xl border border-[rgba(148,163,184,0.14)] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_35%),linear-gradient(180deg,rgba(17,25,42,0.98),rgba(10,17,29,0.92))] p-4.5'


const pageLayoutById: Record<PageId, PageLayout> = {
  home: {
    preview: 'terminal',
    sectionClass: standardSectionClass,
    previewCardClass: standardPreviewCardClass,
  },
  projekte: {
    preview: 'photo',
    sectionClass: photoSectionClass,
    previewCardClass: photoPreviewCardClass,
  },
  kontakt: {
    preview: 'contact',
    sectionClass: photoSectionClass,
    previewCardClass: photoPreviewCardClass,
  },
}

function getPageFromHash(hash: string): PageId {
  const id = hash.replace('#', '') as PageId
  return validPages.has(id) ? id : 'home'
}

function getActivePageConfig(activePage: PageId) {
  return pages.find((page) => page.id === activePage) ?? pages[0]
}

function getNavLinkClass(isActive: boolean) {
  return isActive ? activeNavLinkClass : inactiveNavLinkClass
}

function App() {
  const [activePage, setActivePage] = useState<PageId>(() => {
    if (typeof window === 'undefined') {
      return 'home'
    }

    return getPageFromHash(window.location.hash)
  })
  const [contactSubmitState, setContactSubmitState] = useState<ContactSubmitState>(idleContactSubmitState)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    if (!window.location.hash) {
      window.history.replaceState(null, '', '#home')
    }

    const syncPage = () => setActivePage(getPageFromHash(window.location.hash))
    window.addEventListener('hashchange', syncPage)

    return () => window.removeEventListener('hashchange', syncPage)
  }, [])

  function changePage(page: PageId) {
    setActivePage(page)
    window.location.hash = page
  }

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    const payload = {
      email: String(formData.get('email') ?? '').trim(),
      title: String(formData.get('title') ?? '').trim(),
      message: String(formData.get('message') ?? '').trim(),
    }

    if (!payload.email || !payload.title || !payload.message) {
      setContactSubmitState({
        status: 'error',
        message: 'Bitte alle Felder vollständig ausfüllen.',
      })
      return
    }

    setContactSubmitState({
      status: 'sending',
      message: 'Nachricht wird gesendet...',
    })

    try {
      const response = await fetch('/api/contact', {
       method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json().catch(() => null)

     if (!response.ok) {
        throw new Error(result?.error ?? 'Versand fehlgeschlagen.')
      }

      form.reset()
      setContactSubmitState({
        status: 'success',
        message: result?.message ?? 'Nachricht erfolgreich versendet.',
      })
    } catch (error) {
      setContactSubmitState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unbekannter Fehler beim Versand.',
      })
    }
  }

  const activeConfig = getActivePageConfig(activePage)
  const activeLayout = pageLayoutById[activePage]
  const portfolioAsideClass =
    'bg-gray-800/50 rounded-3xl border border-[rgba(148,163,184,0.14)] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-xl xl:flex xl:flex-col xl:gap-4.5' +
    (activePage === 'home' ? '' : ' hidden')
  return (
    <div className="app-shell">
      <div className="mx-auto min-h-[calc(100svh-16px)] w-full max-w-350 overflow-hidden rounded-[28px] border border-[rgba(148,163,184,0.16)] bg-[linear-gradient(180deg,rgba(10,16,28,0.94),rgba(11,18,31,0.92))] shadow-[0_40px_120px_rgba(0,0,0,0.45)] backdrop-blur-[22px]">
        <header className="flex flex-col gap-4.5 border-b border-[rgba(148,163,184,0.14)] bg-[linear-gradient(180deg,rgba(15,22,36,0.96),rgba(10,16,27,0.88))] px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <a
            className="inline-flex items-center gap-3 text-[1.2rem] font-bold uppercase tracking-[0.14em] text-[#f8fafc] no-underline"
            href="#home"
            onClick={() => changePage('home')}
          >
            <img
              className="bg-gray-800/50 h-11 w-auto rounded-[10px] border border-[rgba(148,163,184,0.18)] p-1.5 shadow-[0_10px_24px_rgba(0,0,0,0.22)]"
              src="/images/logo-webwerk.png"
              alt="WebWerk Logo"
            />
            <span>.pro</span>
          </a>

          <nav className="flex w-full gap-2 overflow-x-auto pb-0.5 lg:w-auto lg:flex-wrap" aria-label="Seitennavigation">
            {pages.map((page) => (
              <a
                key={page.id}
                className={getNavLinkClass(page.id === activePage)}
                href={`#${page.id}`}
                onClick={() => changePage(page.id)}
              >
                {page.label}
              </a>
            ))}
          </nav>
        </header>

        <div className="grid gap-4.5 p-3.5 xl:min-h-[calc(100svh-110px)] xl:grid-cols-[minmax(300px,360px)_minmax(0,1fr)] xl:p-4.5">
          <aside className={portfolioAsideClass}>
            <p className={eyebrowClass}>Portfolio</p>
            <h1 className="mb-2 font-semibold tracking-tighter text-[#f5f7fb] leading-[1.02] text-[clamp(1.8rem,3.6vw,1.9rem)]">
              WebWerk unterstützt bei der Entwicklung digitaler Lösungen für lokale Anwender.
            </h1>
            <p className="mt-0 text-[1.02rem] text-[#93a3c0]">
              Fokus auf klare Websites, Automatisierung mit KI und Umsetzung technischer Themen.
            </p>

            <div className="rounded-3xl border border-[rgba(148,163,184,0.12)] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.05),transparent_34%),linear-gradient(145deg,rgba(18,28,46,0.98),rgba(10,17,29,0.92))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_18px_40px_rgba(0,0,0,0.24)]">
              <img
                className="aspect-4/3 w-full rounded-[18px] bg-[#0a1629] object-cover object-center"
                src="/images/webwerk-overview.jpg"
                alt="Webentwickler bei der Arbeit an Wireframes und Interface-Konzepten"
              />
            </div>

            <div className="grid gap-3">
              <div className={miniCardClass}>
                <strong className="block font-bold text-[#eef2ff]">Zielgruppen</strong>
                <span className="mt-1.5 block text-[#93a3c0]">Handwerk, Kleinunternehmen und Startups </span>
              </div>
              <div className={miniCardClass}>
                <strong className="block font-bold text-[#eef2ff]">Schwerpunkt</strong>
                <span className="mt-1.5 block text-[#93a3c0]">saubere Technik statt Frustration</span>
              </div>
              <div className={miniCardClass}>
                <strong className="block font-bold text-[#eef2ff]">Kontaktweg</strong>
                <span className="mt-1.5 block text-[#93a3c0]">Kontaktformular, Telefon oder E-Mail</span>
              </div>
            </div>
          </aside>

          <main className="bg-gray-800/50 flex min-h-0 flex-col gap-4.5 rounded-3xl border border-[rgba(148,163,184,0.14)] p-5 backdrop-blur-xl md:p-6">
            <section className="grid gap-4.5 rounded-3xl border border-[rgba(148,163,184,0.14)] bg-[radial-gradient(circle_at_top_left,rgba(115,136,214,0.1),transparent_32%),linear-gradient(160deg,rgba(17,26,43,0.98),rgba(11,18,31,0.92))] p-6 xl:grid-cols-[minmax(0,1fr)_minmax(240px,320px)] xl:items-end">
              <div>
                <p className={eyebrowClass}>{activeConfig.eyebrow}</p>
                <h2 className="font-semibold tracking-tighter text-[#f8fafc] leading-none text-[clamp(1.8rem,3.6vw,3rem)] xl:max-w-[14ch]">
                  {activeConfig.title}
                </h2>
              </div>
              <div>
                {activePage === 'kontakt' ? (
                  <ContactQuoteRotator />
                ) : (
                  <p className='mt-3 max-w-[58ch] text-[#97a7c5]'>{activeConfig.summary}</p>
                )}
                <div className="mt-3 flex items-end justify-center rounded-[20px] border border-[rgba(236,201,142,0.12)] bg-[linear-gradient(135deg,rgba(37,49,78,0.98),rgba(83,58,35,0.82))] px-4.5 py-4 text-center font-semibold text-[#f6f0df] shadow-[0_18px_40px_rgba(0,0,0,0.22)]">
                  {activeConfig.highlight}
                </div>
              </div>
            </section>

            <section className={activeLayout.sectionClass}>
              <article className={activeLayout.previewCardClass}>
                <PagePreview
                  config={activeConfig}
                  preview={activeLayout.preview}
                  handleSubmit={handleSubmit}
                  submitState={contactSubmitState}
                />
              </article>

              {activePage === 'kontakt' && contactSubmitState.status !== 'idle' ? (
                <p
                  aria-live="polite"
                  className={`rounded-[14px] border px-4 py-3 text-sm ${
                    contactSubmitState.status === 'success'
                      ? 'border-[rgba(86,176,120,0.28)] bg-[rgba(24,58,35,0.7)] text-[#dff7e7]'
                      : contactSubmitState.status === 'error'
                        ? 'border-[rgba(208,95,95,0.28)] bg-[rgba(62,28,28,0.72)] text-[#ffe3e3]'
                        : 'border-[rgba(132,153,207,0.22)] bg-[rgba(21,31,50,0.74)] text-[#dbe5f6]'
                  }`}
                >
                  {contactSubmitState.message}
                </p>
              ) : null}

              <div className="grid content-start gap-4.5">
                <PageSections page={activePage} />
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}

function ContactQuoteRotator() {
  return (
    <div className='contact-quote-rotator max-h-35 mt-3 max-w-[58ch] rounded-[22px] border border-[rgba(217,192,132,0.22)] bg-[linear-gradient(145deg,rgba(24,34,54,0.96),rgba(18,26,43,0.9))] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_20px_46px_rgba(0,0,0,0.2)]'>
      <span className='block text-[0.78rem] font-semibold uppercase tracking-[0.22em] text-[#d8c18b]'>
        Impuls zum Start
      </span>

      <div className='relative mt-5 min-h-28'>
        <figure className='contact-quote-slide contact-quote-slide-first absolute inset-0 flex flex-col justify-start'>
          <blockquote className='mb-4 max-w-[32ch] text-[1.05rem] leading-[1.45] text-[#f5f7fb]'>
            &bdquo;Der erste Schritt ist der wichtigste.&ldquo;
          </blockquote>
          <figcaption className='text-[0.96rem] font-semibold text-[#93a3c0]'>
            Autor: <span className='text-[#dbe5f6]'>Laozi</span>
          </figcaption>
        </figure>

        <figure className='contact-quote-slide contact-quote-slide-second absolute inset-0 flex flex-col justify-start'>
          <blockquote className='mb-4 max-w-[32ch] text-[1.05rem] leading-[1.45] text-[#f5f7fb]'>
            &bdquo;Gut begonnen ist halb gewonnen.&ldquo;
          </blockquote>
          <figcaption className='text-[0.96rem] font-semibold text-[#93a3c0]'>
            Autor: <span className='text-[#dbe5f6]'>Aristoteles</span>
          </figcaption>
        </figure>
      </div>
    </div>
  )
}

type PagePreviewProps = {
  config: PageConfig
  preview: PagePreviewVariant
  handleSubmit: SubmitEventHandler<HTMLFormElement>
  submitState: ContactSubmitState
}

function PagePreview({ config, preview, handleSubmit, submitState }: PagePreviewProps) {
  if (preview === 'contact') {
    return (
      <ContactPhotoForm
        src={config.image?.src ?? '/images/contact.png'}
        alt={config.image?.alt ?? 'Kontaktformular auf einem Laptop'}
        handleSubmit={handleSubmit}
        submitState={submitState}
      />
    )
  }

  if (preview === 'photo' && config.image) {
    return <PagePhoto src={config.image.src} alt={config.image.alt} position={config.image.position} />
  }

  return (
    <TerminalPreview
      title={config.label}
      command={config.command}
      code={config.code}
      output={config.output}
    />
  )
}

type PagePhotoProps = {
  src: string
  alt: string
  position?: string
}

function PagePhoto({ src, alt, position = 'center center' }: PagePhotoProps) {
  return (
    <img
      className="aspect-4/3 h-full min-h-full w-full rounded-[22px] bg-[#0a1629] object-contain shadow-[0_20px_46px_rgba(10,31,69,0.18)]"
      src={src}
      alt={alt}
      style={{ objectPosition: position }}
    />
  )
}

type ContactPhotoFormProps = {
  src: string
  alt: string
  handleSubmit: SubmitEventHandler<HTMLFormElement>
  submitState: ContactSubmitState
}

function ContactPhotoForm({ src, alt, handleSubmit, submitState }: ContactPhotoFormProps) {
  return (
    <form className="mx-auto grid w-full max-w-280 gap-4" onSubmit={handleSubmit}>
      <div className="relative">
        <img
          className="h-full w-full rounded-[22px] bg-[#0a1629] object-contain shadow-[0_20px_46px_rgba(10,31,69,0.18)]"
          src={src}
          alt={alt}
        />

        <div className="pointer-events-none absolute inset-0">
          <div className="pointer-events-auto absolute left-[47.2%] top-[29.0%] h-[3.8%] w-[34.1%]">
            <label className="sr-only" htmlFor="contact-email">
              E-Mail
            </label>
            <input
              id="contact-email"
              className={overlayInputClass}
              type="email"
              name="email"
              autoComplete="email"
              placeholder="ihre@email.de"
              required
            />
          </div>

          <div className="pointer-events-auto absolute left-[47.2%] top-[37.6%] h-[3.8%] w-[34.1%]">
            <label className="sr-only" htmlFor="contact-title">
              Titel
            </label>
            <input
              id="contact-title"
              className={overlayInputClass}
              type="text"
              name="title"
              placeholder="Worum geht es?"
              required
            />
          </div>

          <div className="pointer-events-auto absolute left-[47.2%] top-[46.0%] h-[10.5%] w-[34.1%]">
            <label className="sr-only" htmlFor="contact-message">
              Nachricht
            </label>
            <textarea
              id="contact-message"
              className={`${overlayInputClass} contact-overlay-textarea resize-none py-[clamp(0.28rem,0.8vw,0.8rem)] leading-[1.35]`}
              name="message"
              rows={1}
              placeholder="Beschreiben Sie Ihr Projekt oder Ihre Anfrage."
              required
            />
          </div>

          <div className="pointer-events-auto absolute left-[47%] top-[58.9%] h-[4.3%] w-[16.9%]">
            <button
              className={`${overlayButtonClass} disabled:cursor-wait disabled:opacity-75`}
              type="submit"
              disabled={submitState.status === 'sending'}
            >
              {submitState.status === 'sending' ? 'Senden...' : 'Absenden'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}

function Cursor({ active }: { active: boolean }) {
  if (!active) {
    return null
  }

  return <span aria-hidden className="ml-1 inline-block h-[1.05em] w-[0.7ch] animate-pulse bg-[#d8c18b]/85 align-[-0.18em]" />
}

type TerminalPreviewProps = {
  title: string
  command: string
  code: string[]
  output: string[]
}

function TerminalPreview({ title, command, code, output }: TerminalPreviewProps) {
  const [typedCommand, setTypedCommand] = useState('')
  const [typedCode, setTypedCode] = useState<string[]>(() => code.map(() => ''))
  const [typedOutput, setTypedOutput] = useState<string[]>(() => output.map(() => ''))
  const [activeCursor, setActiveCursor] = useState<string | null>('command')
  const initialDelay = 320
  const typingDelay = 52
  const linePause = 540
  const loopPause = 4200

  useEffect(() => {
    let cancelled = false
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    const pause = (ms: number, next: () => void) => {
      timeoutId = setTimeout(() => {
        if (!cancelled) {
          next()
        }
      }, ms)
    }

    const typeText = (
      text: string,
      onUpdate: (value: string) => void,
      cursorKey: string,
      onDone: () => void,
    ) => {
      let index = 0
      setActiveCursor(cursorKey)
      onUpdate('')

      const tick = () => {
        if (cancelled) {
          return
        }

        onUpdate(text.slice(0, index + 1))
        index += 1

        if (index < text.length) {
          timeoutId = setTimeout(tick, typingDelay)
          return
        }

        pause(linePause, onDone)
      }

      timeoutId = setTimeout(tick, initialDelay)
    }

    const runSequence = () => {
      setTypedCommand('')
      setTypedCode(code.map(() => ''))
      setTypedOutput(output.map(() => ''))

      typeText(`$ ${command}`, setTypedCommand, 'command', () => {
        const typeCodeLine = (lineIndex: number) => {
          if (lineIndex >= code.length) {
            typeOutputLine(0)
            return
          }

          typeText(
            code[lineIndex],
            (value) => {
              setTypedCode((current) => {
                const next = [...current]
                next[lineIndex] = value
                return next
              })
            },
            `code-${lineIndex}`,
            () => typeCodeLine(lineIndex + 1),
          )
        }

        const typeOutputLine = (lineIndex: number) => {
          if (lineIndex >= output.length) {
            setActiveCursor(null)
            pause(loopPause, runSequence)
            return
          }

          typeText(
            `> ${output[lineIndex]}`,
            (value) => {
              setTypedOutput((current) => {
                const next = [...current]
                next[lineIndex] = value
                return next
              })
            },
            `output-${lineIndex}`,
            () => typeOutputLine(lineIndex + 1),
          )
        }

        typeCodeLine(0)
      })
    }

    runSequence()

    return () => {
      cancelled = true
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [code, command, initialDelay, linePause, loopPause, typingDelay, output])

  return (
    <div
      className="w-full overflow-hidden rounded-[22px] border border-[rgba(148,163,184,0.14)] bg-[radial-gradient(circle_at_top_right,rgba(122,147,230,0.14),transparent_28%),linear-gradient(180deg,#050b14_0%,#0a1220_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_24px_56px_rgba(0,0,0,0.32)]"
      aria-label={`Terminalansicht für ${title}`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-[rgba(148,163,184,0.1)] bg-[rgba(8,14,24,0.92)] px-4.5 py-py-3.5">
        <div className="flex gap-2" aria-hidden="true">
          <span className="h-2.75 w-2.75 rounded-full bg-[linear-gradient(135deg,#e8d6a7,#9f7a3b)] opacity-90" />
          <span className="h-2.75 w-2.75 rounded-full bg-[linear-gradient(135deg,#9ab0ff,#4e6ac6)] opacity-90" />
          <span className="h-2.75 w-2.75 rounded-full bg-[linear-gradient(135deg,#9aa8be,#5a6477)] opacity-90" />
        </div>
        <span className="text-[0.84rem] uppercase tracking-[0.12em] text-[rgba(211,220,236,0.64)]">
          webwerk-cli
        </span>
      </div>

      <div className="grid gap-4.5 p-5 md:px-5 md:py-6">
        <p className="font-mono text-[0.96rem] text-[#dfc48f]">
          {typedCommand}
          <Cursor active={activeCursor === 'command'} />
        </p>

        <div className="grid gap-3">
          {code.map((line, index) => (
            <div key={line} className="grid grid-cols-[36px_minmax(0,1fr)] gap-3 font-mono text-[#dde6f7]">
              <span className="select-none text-[rgba(143,164,214,0.64)]">
                {String(index + 1).padStart(2, '0')}
              </span>
              <code className="block wrap-break-word whitespace-pre-wrap text-[#f3f6fb]">
                {typedCode[index] ?? ''}
                <Cursor active={activeCursor === `code-${index}`} />
              </code>
            </div>
          ))}
        </div>

        <div className="grid gap-2 border-t border-[rgba(148,163,184,0.12)] pt-2">
          {output.map((line, index) => (
            <p key={line} className="font-mono text-[0.93rem] text-[#8aa3ff]">
              {typedOutput[index] ?? ''}
              <Cursor active={activeCursor === `output-${index}`} />
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}

function PageSections({ page }: { page: PageId }) {
  if (page === 'home') {
    return <HomePageSections />
  }

  if (page === 'projekte') {
    return <ProjectsPageSections />
  }

  return <ContactPageSections />
}

function HomePageSections() {
  return (
    <>
      <section className={panelCardClass}>
        <h3 className="mb-4 text-xl font-semibold text-[#f6f8fc]">Leistungsfelder</h3>
        <div className="grid gap-4">
          {services.map((service) => (
            <article key={service.title} className={miniCardClass}>
              <h4 className="mb-2 text-lg font-semibold text-[#edf2ff]">{service.title}</h4>
              <p className="text-[#94a3c0]">{service.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className={panelCardClass}>
        <h3 className="mb-4 text-xl font-semibold text-[#f6f8fc]">Was Kunden davon haben</h3>
        <ul className="grid list-disc gap-2 pl-4 text-[#94a3c0] marker:text-[#d9c084]">
          {homeBenefits.map((benefit) => (
            <li key={benefit}>{benefit}</li>
          ))}
        </ul>
      </section>
    </>
  )
}

function ProjectsPageSections() {
  return (
    <section className={panelCardClass}>
      <h3 className="mb-4 text-center text-xl font-semibold text-[#f6f8fc]">Ausgewählte Beispielprojekte</h3>
      <div className="grid gap-4">
        {projects.map((project) => (
          <details key={project.name} className={miniCardClass + ' group overflow-hidden'}>
            <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
              <h4 className="text-lg font-semibold text-[#edf2ff]">{project.name}</h4>
              <p className="mb-3 text-sm font-bold tracking-[0.08em] text-[#d8c18b]">{project.stack}</p>
              <p className="mt-2 overflow-hidden text-[#94a3c0] group-open:hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
                {project.text} ...
              </p>
              <span className="mt-3 inline-flex rounded-full border border-[rgba(132,153,207,0.24)] bg-[rgba(20,29,46,0.72)] px-2.5 py-1 text-xs font-semibold tracking-[0.08em] text-[#d8c18b] group-open:hidden">
                Mehr anzeigen
              </span>
              <span className="mt-3 hidden rounded-full border border-[rgba(132,153,207,0.24)] bg-[rgba(20,29,46,0.72)] px-2.5 py-1 text-xs font-semibold tracking-[0.08em] text-[#d8c18b] group-open:inline-flex">
                Weniger anzeigen
              </span>
            </summary>

            <div className="mt-4 border-t border-[rgba(148,163,184,0.12)] pt-4">
              <p className="text-[#94a3c0]">{project.text}</p>
              {project.image ? (
                <figure className={projectImageClass}>
                  <img
                    className="w-full rounded-xl object-cover shadow-[0_14px_30px_rgba(0,0,0,0.28)]"
                    src={project.image.src}
                    alt={project.image.alt}
                    loading="lazy"
                  />
                </figure>
              ) : null}
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}


type ProtectedContactLinkProps = {
  label: string
  prefix: 'mailto:' | 'tel:'
  value: number[]
  displayFormatter?: (value: string) => string
}

function ProtectedContactLink({ label, prefix, value, displayFormatter }: ProtectedContactLinkProps) {
  const [revealed, setRevealed] = useState(false)

  const decodedValue = decodeObfuscatedContact(value)
  const displayValue = displayFormatter ? displayFormatter(decodedValue) : decodedValue

  if (!revealed) {
    return (
      <button className={contactRevealClass} type="button" onClick={() => setRevealed(true)}>
        {label}
      </button>
    )
  }

  return (
    <a className="wrap-break-word text-[#dbe5f6] no-underline" href={`${prefix}${decodedValue}`}>
      {displayValue}
    </a>
  )
}

function ContactPageSections() {
  return (
    <>
      <section className={panelCardClass}>
        <h3 className="mb-4 text-xl font-semibold text-[#f6f8fc]">Kontaktinformationen</h3>
        <div className="min-h-30 grid gap-4 md:grid-cols-2">
          <div className={miniCardClass}>
            <h4 className="mb-2 text-lg font-semibold text-[#edf2ff]">Telefon</h4>
            <ProtectedContactLink
              label="Telefon anzeigen"
              prefix="tel:"
              value={obfuscatedPhone}
              displayFormatter={(phone) => phone.replace(/-/g, ' ')}
            />
          </div>
          <div className={miniCardClass}>
            <h4 className="mb-2 text-lg font-semibold text-[#edf2ff]">E-Mail</h4>
            <ProtectedContactLink label="E-Mail anzeigen" prefix="mailto:" value={obfuscatedEmail} />
          </div>
        </div>
      </section>

      <section className={panelCardClass}>
        <h3 className="mb-3 text-xl font-semibold text-[#f6f8fc]">Projektanfrage</h3>
        <p className="text-[#94a3c0]">
          Das Formular ist direkt in die Bildschirmansicht integriert. Schreiben Sie ihre Anfrage unmittelbar in die Felder für E-Mail, Titel und Nachricht auf dem eingebetteten Bild.
        </p>
      </section>
    </>
  )
}

export default App
