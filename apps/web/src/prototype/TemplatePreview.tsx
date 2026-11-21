import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { TemplateOptions } from './templates'
import styles from './preview.css?inline'

const previewDocument = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet"><title>Homepage template preview</title></head><body></body></html>'

const tasks = [
  { id: 'plan', title: 'Plan your week', summary: 'Choose one priority for the week ahead.', action: 'Open weekly plan' },
  { id: 'preferences', title: 'Review your preferences', summary: 'Explore how this sample workspace could work for you.', action: 'Open preferences' },
] as const

type Screen = 'home' | 'communication' | typeof tasks[number]['id']

function HomepageTemplate({ options }: { options: TemplateOptions }) {
  const [screen, setScreen] = useState<Screen>('home')
  const [completed, setCompleted] = useState<Screen[]>([])
  const heading = useRef<HTMLHeadingElement>(null)
  const lastTrigger = useRef<Screen | null>(null)
  const didNavigate = useRef(false)
  const task = tasks.find(item => item.id === screen)

  useEffect(() => {
    if (!didNavigate.current) return
    const trigger = screen === 'home' && lastTrigger.current
      ? heading.current?.ownerDocument.querySelector<HTMLButtonElement>(`[data-demo-action="${lastTrigger.current}"]`)
      : null
    const focusTarget = trigger ?? heading.current
    focusTarget?.focus()
  }, [screen])

  function navigate(next: Screen, restoreFocus = false) {
    if (restoreFocus) lastTrigger.current = next
    didNavigate.current = true
    setScreen(next)
  }

  return (
    <>
      <style>{styles}</style>
      <div className="demo-banner">
        Local interactive preview | Not AI-generated | Nightingale approximation | Synthetic content
      </div>
      <header className="demo-header">
        <strong>Sample workspace</strong>
        <nav aria-label="Prototype">
          <button aria-current={screen === 'home' ? 'page' : undefined} onClick={() => navigate('home')}>Home</button>
          {options.communication && (
            <button aria-current={screen === 'communication' ? 'page' : undefined} onClick={() => navigate('communication')}>Communication</button>
          )}
        </nav>
      </header>
      <main>
        {screen === 'home' ? (
          <>
            <h1 ref={heading} tabIndex={-1}>{options.layout === 'tasks' ? 'Your tasks, in one place' : 'Welcome home'}</h1>
            <p>{options.layout === 'tasks' ? 'Choose a task to get started. Your progress stays in this preview until you rebuild or reload.' : 'A simple starting point for your day. Explore the sample actions below.'}</p>
            <section aria-labelledby="tasks-title">
              <h2 id="tasks-title">{options.layout === 'tasks' ? 'Your task list' : 'Quick actions'}</h2>
              <div className={`demo-cards ${options.layout === 'tasks' ? 'demo-task-list' : ''}`}>
                {tasks.map(item => (
                  <article className="demo-card" key={item.id}>
                    <h3>{item.title}</h3>
                    <p>{item.summary}</p>
                    {completed.includes(item.id) && <p className="demo-complete">Completed in this demo</p>}
                    <button className="demo-action" data-demo-action={item.id} onClick={() => navigate(item.id, true)}>{item.action}</button>
                  </article>
                ))}
              </div>
            </section>
            {options.communication && (
              <section className="demo-card demo-communication" aria-labelledby="communication-title">
                <h2 id="communication-title">Communication summary</h2>
                <p>One sample update is ready to review.</p>
                <button className="demo-action" data-demo-action="communication" onClick={() => navigate('communication', true)}>Read sample update</button>
              </section>
            )}
          </>
        ) : (
          <>
            <button className="demo-back" onClick={() => navigate('home')}>Back to home</button>
            <h1 ref={heading} tabIndex={-1}>{task?.title ?? 'Sample communication'}</h1>
            <p>{task?.summary ?? 'This is a fictional workspace update. No messages are sent and no services are connected.'}</p>
            {task && (
              <>
                <p>This action only changes the local preview. It does not update a real account.</p>
                <button
                  className="demo-action"
                  disabled={completed.includes(task.id)}
                  onClick={() => setCompleted(previous => [...previous, task.id])}
                >
                  {completed.includes(task.id) ? 'Completed' : 'Mark sample task complete'}
                </button>
                <p role="status">{completed.includes(task.id) ? 'Sample task completed. Return home to see the updated status.' : ''}</p>
              </>
            )}
          </>
        )}
      </main>
      <footer>Reference-only preview. Requested fonts and wireframe colors are temporary approximations; visual fidelity is not verified.</footer>
    </>
  )
}

export default function TemplatePreview({ options }: { options: TemplateOptions }) {
  const [body, setBody] = useState<HTMLElement | null>(null)
  const [frameError, setFrameError] = useState(false)

  return (
    <>
      <iframe
        className="template-preview-frame"
        title="Interactive homepage template"
        sandbox="allow-same-origin"
        srcDoc={previewDocument}
        onLoad={event => {
          const target = event.currentTarget.contentDocument?.body
          setFrameError(!target)
          setBody(target ?? null)
        }}
      />
      {frameError && <p role="alert">The preview could not open. Reload the page and try again.</p>}
      {body && createPortal(<HomepageTemplate options={options} />, body)}
    </>
  )
}
