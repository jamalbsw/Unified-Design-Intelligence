import { useEffect, useRef, useState, type FormEvent } from 'react'
import './App.css'
import ResearchHub from './ResearchHub'

const pilotPassword = import.meta.env.VITE_PILOT_PASSWORD

type View = 'studio' | 'research'
const viewFromHash = (): View => (window.location.hash === '#research' ? 'research' : 'studio')

const storybookUrl =
  'https://storybook.bswsites.com/?path=/docs/get-started-about-nightingale--page'

const examples = [
  {
    label: 'Appointment preparation',
    prompt:
      'Create an appointment preparation flow that helps a patient review what to bring, confirm visit details, and ask for help.',
  },
  {
    label: 'Care team dashboard',
    prompt:
      'Create a care team dashboard for reviewing assigned follow-ups, filtering by status, and opening a task for more detail.',
  },
]

function App() {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [password, setPassword] = useState('')
  const [accessError, setAccessError] = useState('')
  const [request, setRequest] = useState('')
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop')
  const [view, setView] = useState<View>(viewFromHash)
  const isFirstView = useRef(true)

  useEffect(() => {
    const onHashChange = () => setView(viewFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  // Announce a page change by moving focus to the new page and updating the title.
  useEffect(() => {
    document.title = view === 'research' ? 'Research hub | Unified Design Intelligence' : 'Unified Design Intelligence'
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
          <span className="wordmark-icon" aria-hidden="true">U</span>
          <strong>Unified Design Intelligence</strong>
        </a>
        <nav className="main-nav" aria-label="Main">
          <a aria-current={view === 'studio' ? 'page' : undefined} href="#home">Prototype studio</a>
          <a aria-current={view === 'research' ? 'page' : undefined} href="#research">Research hub</a>
        </nav>
      </header>

      {view === 'research' ? (
        <ResearchHub />
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
            This starter workspace is not connected to an AI service or shared
            storage yet. Use fictional examples only; don’t enter patient or
            confidential information.
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
              Share the user, their goal, and what they should be able to do.
              You can start with one sentence.
            </p>

            <label htmlFor="prototype-request">What would you like to prototype?</label>
            <textarea
              id="prototype-request"
              value={request}
              onChange={(event) => setRequest(event.target.value)}
              placeholder="For example: Help a patient prepare for an upcoming appointment..."
              rows={6}
              maxLength={1200}
            />
            <div className="textarea-meta">
              <span>Be specific about the actions users should take.</span>
              <span>{request.length}/1200</span>
            </div>

            <div className="example-group">
              <p className="example-label">TRY AN EXAMPLE</p>
              <div className="example-buttons">
                {examples.map((example) => (
                  <button
                    className="example-button"
                    key={example.label}
                    onClick={() => setRequest(example.prompt)}
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
                research hub is connected.
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
                disabled
                title="Generation will be enabled after an approved AI service is connected."
                type="button"
              >
                Generate prototype
                <span aria-hidden="true">→</span>
              </button>
            </div>
            <p className="disabled-reason">
              Generation is paused until an approved AI service is connected.
            </p>
          </section>

          <section
            className={`preview-card ${viewport === 'mobile' ? 'mobile-preview' : ''}`}
            aria-labelledby="preview-title"
          >
            <div className="preview-heading">
              <div>
                <p className="step-label">STEP 2</p>
                <h2 id="preview-title">Your prototype preview</h2>
              </div>
              <span className="preview-status">Not connected</span>
            </div>
            <div className="preview-canvas">
              <div className="preview-empty">
                <div className="preview-symbol" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
                <h3>Your preview will appear here</h3>
                <p>
                  Once generation is connected, you’ll be able to click through
                  screens and share a version with your team.
                </p>
              </div>
            </div>
            <p className="preview-caption">
              Generated prototypes use Nightingale. This studio’s own look is separate.
            </p>
            <div className="pipeline" aria-label="Prototype workflow status">
              <div className="pipeline-item complete">
                <span className="pipeline-marker" aria-hidden="true">1</span>
                <span>Describe</span>
              </div>
              <span className="pipeline-line" aria-hidden="true" />
              <div className="pipeline-item">
                <span className="pipeline-marker" aria-hidden="true">2</span>
                <span>Generate</span>
              </div>
              <span className="pipeline-line" aria-hidden="true" />
              <div className="pipeline-item human">
                <span className="pipeline-marker" aria-hidden="true">3</span>
                <span>Review &amp; save</span>
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
      <footer className="footer">
        <span>Unified Design Intelligence</span>
        <span>Reference mode · Not an official Nightingale implementation</span>
      </footer>
    </div>
  )
}

export default App
