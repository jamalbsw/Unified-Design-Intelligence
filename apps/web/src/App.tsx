import { useEffect, useRef, useState, type FormEvent } from 'react'
import './App.css'
import ResearchLab from './ResearchLab'
import TemplatePreview from './prototype/TemplatePreview'
import { matchTemplate, type TemplateOptions } from './prototype/templates'

interface VoiceRecognitionResultEvent extends Event {
  results: ArrayLike<ArrayLike<{ transcript: string }>>
}

interface VoiceRecognitionErrorEvent extends Event {
  error: string
}

interface VoiceRecognition {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  onresult: ((event: VoiceRecognitionResultEvent) => void) | null
  onerror: ((event: VoiceRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
  abort(): void
}

type VoiceRecognitionConstructor = new () => VoiceRecognition

function getVoiceRecognitionConstructor() {
  const speechWindow = window as Window & {
    SpeechRecognition?: VoiceRecognitionConstructor
    webkitSpeechRecognition?: VoiceRecognitionConstructor
  }
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition
}

function voiceRecognitionErrorMessage(error: string) {
  switch (error) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Microphone access was blocked. Allow access in your browser settings, then try again.'
    case 'audio-capture':
      return 'No microphone was found. Connect a microphone or type your request instead.'
    case 'no-speech':
      return 'No speech was detected. Try again or type your request instead.'
    case 'network':
      return 'Voice input could not connect to the speech service. Try again or type your request instead.'
    default:
      return 'Voice input failed. Try again or type your request instead.'
  }
}

const pilotPassword = import.meta.env.VITE_PILOT_PASSWORD

type View = 'studio' | 'research'
const viewFromHash = (): View => (window.location.hash === '#research' ? 'research' : 'studio')

const storybookUrl =
  'https://storybook.bswsites.com/?path=/docs/get-started-about-nightingale--page'

const examples = [
  {
    label: 'Baylee entry points',
    prompt: 'Baylee entry points',
    clickablePrototype: true,
  },
]

function App() {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [password, setPassword] = useState('')
  const [accessError, setAccessError] = useState('')
  const [request, setRequest] = useState('')
  const [voiceSupported] = useState(() => Boolean(getVoiceRecognitionConstructor()))
  const [isListening, setIsListening] = useState(false)
  const [voiceError, setVoiceError] = useState('')
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop')
  const [view, setView] = useState<View>(viewFromHash)
  const [preview, setPreview] = useState<{ options: TemplateOptions; request: string; revision: number } | null>(null)
  const [requestError, setRequestError] = useState('')
  const recognitionRef = useRef<VoiceRecognition | null>(null)
  const voiceBaseRef = useRef('')
  // Choosing "Baylee entry points" activates Step 2 with the clickable portal prototype.
  const [prototypeActive, setPrototypeActive] = useState(false)
  const isFirstView = useRef(true)

  useEffect(() => {
    const onHashChange = () => setView(viewFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => () => {
    const recognition = recognitionRef.current
    if (!recognition) return
    recognition.onresult = null
    recognition.onerror = null
    recognition.onend = null
    recognition.abort()
  }, [])

  // Announce a page change by moving focus to the new page and updating the title.
  useEffect(() => {
    document.title = view === 'research' ? 'Research Lab | Unified Design Intelligence' : 'Unified Design Intelligence'
    if (isFirstView.current) {
      isFirstView.current = false
      return
    }
    document.querySelector<HTMLElement>('main')?.focus()
  }, [view])

  function handleUnlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!pilotPassword) {
      setAccessError('Pilot access has not been configured yet. Contact the pilot owner.')
      return
    }

    if (password !== pilotPassword) {
      setAccessError('That password did not match. Try again.')
      return
    }

    setIsUnlocked(true)
  }

  function buildPreview() {
    const result = matchTemplate(request)
    if (!result.ok) {
      setRequestError(`${result.message}${preview ? ' The previous preview is unchanged.' : ''}`)
      return
    }
    setRequestError('')
    setPreview(previous => ({ options: result.options, request, revision: (previous?.revision ?? 0) + 1 }))
  }

  function handleVoiceInput() {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      return
    }

    const Recognition = getVoiceRecognitionConstructor()
    if (!Recognition) {
      setVoiceError('Voice input is not supported in this browser. Type your request instead.')
      return
    }

    const recognition = new Recognition()
    recognition.lang = navigator.language || 'en-US'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    voiceBaseRef.current = request.trimEnd()
    recognition.onresult = event => {
      const transcript = Array.from(event.results)
        .map(result => result[0]?.transcript ?? '')
        .join(' ')
        .trim()
      setRequest([voiceBaseRef.current, transcript].filter(Boolean).join(voiceBaseRef.current ? ' ' : '').slice(0, 1200))
      setRequestError('')
    }
    recognition.onerror = event => {
      if (recognitionRef.current !== recognition) return
      recognitionRef.current = null
      setVoiceError(voiceRecognitionErrorMessage(event.error))
      setIsListening(false)
    }
    recognition.onend = () => {
      if (recognitionRef.current !== recognition) return
      recognitionRef.current = null
      setIsListening(false)
    }

    recognitionRef.current = recognition
    setVoiceError('')
    setIsListening(true)
    try {
      recognition.start()
    } catch (error) {
      recognitionRef.current = null
      setIsListening(false)
      setVoiceError(error instanceof Error
        ? `Could not start voice input: ${error.message}`
        : 'Could not start voice input. Try again or type your request instead.')
    }
  }

  function handleRequestChange(value: string) {
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null
      recognitionRef.current.stop()
      recognitionRef.current = null
      setIsListening(false)
    }
    setRequest(value)
    setRequestError('')
  }

  function handleRestart() {
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsListening(false)
    setVoiceError('')
    setRequest('')
    setRequestError('')
    setPreview(null)
    setPrototypeActive(false)
    setViewport('desktop')
  }

  if (!isUnlocked) {
    return (
      <main className="access-gate">
        <form className="access-card" onSubmit={handleUnlock}>
          <span className="cell" aria-hidden="true" />
          <p className="eyebrow">UNIFIED DESIGN INTELLIGENCE · PILOT</p>
          <h1>Welcome to the pilot.</h1>
          <p className="access-description">Enter the demo password to continue.</p>
          <label className="access-label" htmlFor="pilot-password">
            Password
          </label>
          <input
            autoComplete="current-password"
            id="pilot-password"
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
          {accessError && <p className="access-error" role="alert">{accessError}</p>}
          {!pilotPassword && (
            <p className="access-configuration" role="status">
              Demo access is not configured. Ask the pilot owner to set it up.
            </p>
          )}
          <button className="access-button" disabled={!pilotPassword} type="submit">
            Continue to pilot
          </button>
        </form>
      </main>
    )
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="wordmark" href="#home" aria-label="Unified Design Intelligence home">
          <span className="cell logo-cell" aria-hidden="true" />
          <strong>Unified Design Intelligence</strong>
        </a>
        <nav className="main-nav" aria-label="Main">
          <a aria-current={view === 'studio' ? 'page' : undefined} href="#home">Applied AI Design</a>
          <span
            aria-disabled="true"
            className="nav-disabled"
            title="Research Lab is not enabled yet"
          >
            Research Lab
          </span>
        </nav>
      </header>

      {view === 'research' ? (
        <ResearchLab />
      ) : (
      <main id="home" tabIndex={-1}>
        <section className="intro-guidance-card" aria-label="Introduction and Nightingale resources">
          <div className="intro-guidance-main">
            <p className="eyebrow">IDEA TO INTERACTIVE PREVIEW</p>
            <h1>Make the next idea tangible.</h1>
          </div>
          <div className="design-guidance-content">
            <h2 id="reference-title">
              <a className="reference-title-link" href={storybookUrl} target="_blank" rel="noreferrer">
                Grounded in Nightingale
                <span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            </h2>
            <div className="reference-links">
              <a
                href="https://storybook.bswsites.com/?path=/story/foundation-colors--page"
                rel="noreferrer"
                target="_blank"
              >
                <span className="reference-icon color-icon" aria-hidden="true">Aa</span>
                <span><strong>Foundations</strong></span>
                <span className="reference-arrow" aria-hidden="true">↗</span>
              </a>
              <a
                href="https://storybook.bswsites.com/?path=/story/core-button--page"
                rel="noreferrer"
                target="_blank"
              >
                <span className="reference-icon button-icon" aria-hidden="true">●</span>
                <span><strong>Components</strong></span>
                <span className="reference-arrow" aria-hidden="true">↗</span>
              </a>
              <a
                href="https://storybook.bswsites.com/?path=/docs/patterns-accessibility--page"
                rel="noreferrer"
                target="_blank"
              >
                <span className="reference-icon access-icon" aria-hidden="true">✓</span>
                <span><strong>Accessibility</strong></span>
                <span className="reference-arrow" aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </section>

        <section className="workspace-grid" aria-label="Prototype workspace">
          <section className="request-card" aria-labelledby="request-title">
            <div className="card-heading">
              <div>
                <p className="step-label">STEP 1</p>
                <h2 id="request-title">Describe your request</h2>
              </div>
            </div>
            <p className="card-description">
              Describe the user, their goal, key steps, and target device. Keep it focused, and use fictional information.
            </p>

            <label htmlFor="prototype-request">What would you like to prototype?</label>
            <div className="request-input-shell">
              <textarea
                id="prototype-request"
                value={request}
                onChange={(event) => handleRequestChange(event.target.value)}
                aria-describedby={`voice-status${requestError ? ' request-error' : ''}`}
                aria-invalid={!!requestError}
                placeholder="Create a home page."
                rows={6}
                maxLength={1200}
              />
              <div className="request-input-toolbar">
                <div className="request-input-actions">
                  <button
                    aria-pressed={isListening}
                    className="request-action-chip"
                    disabled={!voiceSupported}
                    onClick={handleVoiceInput}
                    title={voiceSupported
                      ? 'Voice transcription may be processed by your browser speech service.'
                      : 'Voice input is not supported in this browser.'}
                    type="button"
                  >
                    <svg aria-hidden="true" viewBox="0 0 24 24">
                      {isListening ? (
                        <rect x="7" y="7" width="10" height="10" rx="1" />
                      ) : (
                        <>
                          <rect x="9" y="3" width="6" height="12" rx="3" />
                          <path d="M5 11a7 7 0 0 0 14 0M12 18v3m-4 0h8" />
                        </>
                      )}
                    </svg>
                    {isListening ? 'Stop listening' : 'Voice Command'}
                  </button>
                  <button className="request-action-chip" disabled type="button">
                    Attach insights
                  </button>
                </div>
                <div className="textarea-meta">
                  <span>{request.length}/1200</span>
                </div>
              </div>
            </div>
            <div className="example-group">
              <p className="example-label">TEMPLATES</p>
              <div className="example-buttons">
                {examples.map((example) => (
                  <button
                    aria-pressed={prototypeActive && !!example.clickablePrototype}
                    className="request-action-chip"
                    key={example.label}
                    onClick={() => {
                      setRequest(example.prompt)
                      setRequestError('')
                      setPrototypeActive(!!example.clickablePrototype)
                    }}
                    type="button"
                  >
                    {example.label}
                  </button>
                ))}
                {['Example A', 'Example B', 'Example C'].map((label) => (
                  <button className="request-action-chip" disabled key={label} type="button">
                    {label}
                  </button>
                ))}
                {prototypeActive && (
                  <button className="example-button restart-button" onClick={handleRestart} type="button">
                    Restart
                  </button>
                )}
              </div>
            </div>
            <p
              className={`voice-status${voiceError ? ' is-error' : ''}`}
              id="voice-status"
              role={voiceError ? 'alert' : isListening ? 'status' : undefined}
            >
              {voiceError || (isListening
                ? 'Listening. Speak your request; your browser may process audio through its speech service.'
                : voiceSupported
                  ? 'Voice is transcribed into this field. Do not speak personal or confidential information.'
                  : 'Voice input is not available in this browser; type your request instead.')}
            </p>
            {requestError && <p className="access-error" id="request-error" role="alert">{requestError}</p>}
            {preview && preview.request !== request && (
              <p className="preview-stale-status" role="status">
                Preview is out of date. Build again to update it.
              </p>
            )}
            <div className="request-actions-footer">
              <button
                className={`generate-button${prototypeActive ? ' is-entrypoint-selected' : ''}`}
                disabled={!request.trim() || prototypeActive}
                onClick={buildPreview}
                type="button"
              >
                Build
              </button>
            </div>
          </section>

          <section
            className={`preview-card ${viewport === 'mobile' ? 'mobile-preview' : ''}${preview || prototypeActive ? ' is-active' : ''}`}
            aria-labelledby="preview-title"
          >
            <div className="preview-heading">
              <div>
                <p className="step-label">STEP 2</p>
                <h2 id="preview-title">Your prototype preview</h2>
              </div>
              <fieldset className="viewport-control">
                <legend className="visually-hidden">Preview view</legend>
                <div className="viewport-options">
                  <button
                    aria-pressed={viewport === 'desktop'}
                    className={viewport === 'desktop' ? 'selected' : ''}
                    onClick={() => setViewport('desktop')}
                    type="button"
                  >
                    Desktop
                  </button>
                  <button
                    aria-pressed={viewport === 'mobile'}
                    className={viewport === 'mobile' ? 'selected' : ''}
                    disabled
                    type="button"
                    title="Mobile preview is temporarily unavailable."
                  >
                    Mobile
                  </button>
                </div>
              </fieldset>
            </div>
            <div className="preview-canvas">
              {preview ? (
                <TemplatePreview key={preview.revision} options={preview.options} />
              ) : prototypeActive ? (
                <a
                  className="prototype-thumb"
                  href={`${import.meta.env.BASE_URL}prototypes/portal-chat/`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    src={`${import.meta.env.BASE_URL}prototypes/portal-chat/thumbnail.jpg`}
                    alt="Preview of the Get Care page with a chat assistant open beside it"
                    width={1440}
                    height={1066}
                  />
                  <span className="prototype-thumb-cta">
                    Open the clickable prototype
                    <span aria-hidden="true"> ↗</span>
                    <span className="visually-hidden"> (opens in a new tab)</span>
                  </span>
                </a>
              ) : (
              <div className="preview-empty">
                <div className="preview-symbol" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
                <h3>Your preview will appear here</h3>
                <p>
                  Choose Baylee entry points to view a clickable portal
                  prototype. Build a local template preview from your request.
                </p>
                <a
                  className="preview-link"
                  href={`${import.meta.env.BASE_URL}template-preview/`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open the starter template preview
                  <span aria-hidden="true"> ↗</span>
                  <span className="visually-hidden"> (opens in a new tab)</span>
                </a>
              </div>
              )}
            </div>
            {prototypeActive && preview && (
              <div className="clickable-prototype">
                <div>
                  <p className="example-label">CLICKABLE PROTOTYPE</p>
                  <strong>Get Care page with a chat assistant</strong>
                  <span>
                    Click through Appointments, Billing, Test Results, and Visit Summaries with the
                    chat beside them. Fictional data only; payments, messages, and appointments are demo-only.
                  </span>
                </div>
                <a
                  className="clickable-prototype-link"
                  href={`${import.meta.env.BASE_URL}prototypes/portal-chat/`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open the clickable prototype
                  <span aria-hidden="true"> ↗</span>
                  <span className="visually-hidden"> (opens in a new tab)</span>
                </a>
              </div>
            )}
            <div className="preview-actions">
              <button className="generate-button is-entrypoint-selected" disabled type="button">
                Save prototype
              </button>
            </div>
          </section>
        </section>

      </main>
      )}
    </div>
  )
}

export default App
