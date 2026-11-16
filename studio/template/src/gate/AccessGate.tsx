import { useState, type FormEvent, type ReactNode } from 'react'
import { Button, Notice } from '@studio/ui'
import './gate.css'

// Demo-only access prompt. The build embeds a SHA-256 hash (never the password), but a
// browser-side check can always be bypassed. Do not rely on it for sensitive content.
// When no hash is configured (local development, tests) the app is shown directly.
const expectedHash = import.meta.env.VITE_PILOT_PASSWORD_HASH as string | undefined
const storageKey = 'studio-preview-unlocked'

async function sha256Hex(text: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function AccessGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(
    () => !expectedHash || sessionStorage.getItem(storageKey) === expectedHash,
  )
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if ((await sha256Hex(password)) !== expectedHash) {
      setError('That password did not match. Try again.')
      return
    }
    sessionStorage.setItem(storageKey, expectedHash!)
    setUnlocked(true)
  }

  if (unlocked) return children

  return (
    <main className="gate">
      <form className="gate-card" onSubmit={handleSubmit}>
        <h1>Enter the pilot password</h1>
        <p>This preview is for the pilot team. Use fictional examples only.</p>
        <label htmlFor="preview-password">Password</label>
        <input
          id="preview-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {error && <Notice variant="error">{error}</Notice>}
        <Button type="submit">Continue</Button>
        <p className="gate-warning">
          Demo-only access: this browser-based password prompt can be bypassed. Do not enter patient or
          confidential information.
        </p>
      </form>
    </main>
  )
}
