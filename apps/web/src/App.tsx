import { useEffect, useRef, useState, type FormEvent } from 'react'
import './App.css'
import ResearchLab from './ResearchLab'
import TemplatePreview from './prototype/TemplatePreview'
import { matchTemplate, type TemplateOptions } from './prototype/templates'

const pilotPassword = import.meta.env.VITE_PILOT_PASSWORD

type View = 'studio' | 'research'
const viewFromHash = (): View => (window.location.hash === '#research' ? 'research' : 'studio')

const storybookUrl =
  'https://storybook.bswsites.com/?path=/docs/get-started-about-nightingale--page'

const examples = [
  {
    label: 'Simple homepage',
    prompt: 'Create a home page.',
    clickablePrototype: true,
  },
  {
    label: 'Task-focused homepage',
    prompt: 'Create a task-focused home page.',
  },
  {
    label: 'Communication summary',
    prompt: 'Create a home page with a communication summary.',
  },
]

function App() {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [password, setPassword] = useState('')
  const [accessError, setAccessError] = useState('')
  const [request, setRequest] = useState('')
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop')
  const [view, setView] = useState<View>(viewFromHash)
  const [preview, setPreview] = useState<{ options: TemplateOptions; request: string; revision: number } | null>(null)
  const [requestError, setRequestError] = useState('')
  // Choosing "Simple homepage" activates Step 2 with the clickable portal prototype.
  const [prototypeActive, setPrototypeActive] = useState(false)
  const isFirstView = useRef(true)

  useEffect(() => {
    const onHashChange = () => setView(viewFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
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

  if (!isUnlocked) {
    return (
      <main className="access-gate">
        <form className="access-card" onSubmit={handleUnlock}>
          <span className="cell" aria-hidden="true" />
          <p className="eyebrow">UNIFIED DESIGN INTELLIGENCE · PILOT</p>
          <h1>Welcome to the pilot.</h1>
          <p className="access-description">Enter the demo password to continue.</p>
          <label className="access-label" htmlFor="pilot-password">
            Pilot password
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
          <p className="access-warning" role="note">
            Demo-only access: this browser-based password prompt can be bypassed.
            Do not enter patient or confidential information.
          </p>
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
          <a aria-current={view === 'research' ? 'page' : undefined} href="#research">Research Lab</a>
        </nav>
      </header>

      {view === 'research' ? (
        <ResearchLab />
      ) : (
      <main id="home" tabIndex={-1}>
        <section className="intro">
          <div>
            <p className="eyebrow">IDEA TO INTERACTIVE PREVIEW</p>
            <h1>Make the next idea tangible.</h1>
            <p className="intro-copy">
              Describe the experience you want to explore. Your team can shape it
              into a prototype, review it, and build on it together.
            </p>
          </div>
          <div className="intro-aside">
            <span className="cell" aria-hidden="true" />
            <a className="mode-badge" href={storybookUrl} target="_blank" rel="noreferrer">
              <span className="status-dot" aria-hidden="true" />
              Nightingale Storybook
              <span aria-hidden="true">↗</span>
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          </div>
        </section>

        <div className="notice" role="note">
          <span className="notice-icon" aria-hidden="true">i</span>
          <p>
            Template-based demo, not AI generation. Requests select predefined
            layouts locally; no AI or Figma calls are made. Use fictional examples
            only. Nothing is saved or shared.
          </p>
        </div>

        <section className="workspace-grid" aria-label="Prototype workspace">
          <section className="request-card" aria-labelledby="request-title">
            <div className="card-heading">
              <div>
                <p className="step-label">STEP 1</p>
                <h2 id="request-title">Describe your request</h2>
              </div>
              <span className="heading-icon" aria-hidden="true">✦</span>
            </div>
            <p className="card-description">
              Try a homepage, a task-focused homepage, or a homepage with a
              communication summary. This demo matches keywords, not intent.
            </p>

            <label htmlFor="prototype-request">What would you like to prototype?</label>
            <textarea
              id="prototype-request"
              value={request}
              onChange={(event) => {
                setRequest(event.target.value)
                setRequestError('')
              }}
              aria-describedby={`request-help${requestError ? ' request-error' : ''}`}
              aria-invalid={!!requestError}
              placeholder="Create a home page."
              rows={6}
              maxLength={1200}
            />
            <div className="textarea-meta">
              <span id="request-help">Recognizes home, task, and communication/message keywords. Other details are not interpreted. Do not enter personal or confidential data.</span>
              <span>{request.length}/1200</span>
            </div>

            <div className="example-group">
              <p className="example-label">TRY AN EXAMPLE</p>
              <div className="example-buttons">
                {examples.map((example) => (
                  <button
                    className="example-button"
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
              </div>
            </div>

            <div className="attach-research">
              <button className="attach-button" disabled type="button">Attach insights</button>
              <span>
                Add relevant research findings to this brief. Available when the
                Research Lab is connected.
              </span>
            </div>

            <div className="form-footer">
              <fieldset className="viewport-control">
                <legend>Preview size</legend>
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
                  onClick={() => setViewport('mobile')}
                  type="button"
                >
                  Mobile
                </button>
              </fieldset>
              <button
                className="generate-button"
                disabled={!request.trim()}
                onClick={buildPreview}
                type="button"
              >
                Build template preview
                <span aria-hidden="true">→</span>
              </button>
            </div>
            {requestError && <p className="access-error" id="request-error" role="alert">{requestError}</p>}
            <p className="demo-description">
              Predefined layouts only. No AI, live Figma reading, or saved versions.
            </p>
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
              <span className="preview-status">{prototypeActive && !preview ? 'Clickable prototype' : 'Template demo'}</span>
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
                  Choose an example and build a template to explore a homepage
                  and a sample detail screen. Choose Simple homepage to see a
                  clickable prototype here. This is not AI generation.
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
            <p className="preview-caption" role="status">
              {preview
                ? `Preview ${preview.revision}: ${preview.options.layout === 'tasks' ? 'task-focused homepage' : 'homepage'}${preview.options.communication ? ' with communication summary' : ''}.${preview.request !== request ? ' Request edited. Build again to update the preview.' : ' Only these matched features are included.'}`
                : prototypeActive
                  ? 'Showing the clickable portal prototype. Fictional data only; payments, messages, and appointments are demo-only. Build a template preview to see the starter layout instead.'
                  : 'No template built yet.'}
            </p>
            <p className="preview-caption">
              Nightingale-inspired approximations, not official components.
              System fonts are substituted; visual fidelity is not verified.
            </p>
            <div className="pipeline" aria-label="Prototype workflow status">
              <div className="pipeline-item complete">
                <span className="pipeline-marker" aria-hidden="true">1</span>
                <span>Describe</span>
              </div>
              <span className="pipeline-line" aria-hidden="true" />
              <div className={`pipeline-item${preview || prototypeActive ? ' complete' : ''}`}>
                <span className="pipeline-marker" aria-hidden="true">2</span>
                <span>{prototypeActive && !preview ? 'Prototype ready' : 'Build template'}</span>
              </div>
              <span className="pipeline-line" aria-hidden="true" />
              <div className="pipeline-item human">
                <span className="pipeline-marker" aria-hidden="true">3</span>
                <span>Review locally</span>
              </div>
            </div>
          </section>
        </section>

        <section className="reference-section" aria-labelledby="reference-title">
          <div>
            <p className="eyebrow">DESIGN GUIDANCE</p>
            <h2 id="reference-title">Grounded in Nightingale</h2>
            <p>
              Storybook is the current design reference. Previews made before
              package access is confirmed are temporary approximations.
            </p>
          </div>
          <div className="reference-links">
            <a
              href="https://storybook.bswsites.com/?path=/story/foundation-colors--page"
              rel="noreferrer"
              target="_blank"
            >
              <span className="reference-icon color-icon" aria-hidden="true">Aa</span>
              <span><strong>Foundations</strong><small>Colors and design tokens</small></span>
              <span className="reference-arrow" aria-hidden="true">↗</span>
            </a>
            <a
              href="https://storybook.bswsites.com/?path=/story/core-button--page"
              rel="noreferrer"
              target="_blank"
            >
              <span className="reference-icon button-icon" aria-hidden="true">●</span>
              <span><strong>Components</strong><small>Browse component examples</small></span>
              <span className="reference-arrow" aria-hidden="true">↗</span>
            </a>
            <a
              href="https://storybook.bswsites.com/?path=/docs/patterns-accessibility--page"
              rel="noreferrer"
              target="_blank"
            >
              <span className="reference-icon access-icon" aria-hidden="true">✓</span>
              <span><strong>Accessibility</strong><small>Inclusive interaction guidance</small></span>
              <span className="reference-arrow" aria-hidden="true">↗</span>
            </a>
          </div>
        </section>
      </main>
      )}
    </div>
  )
}

export default App
