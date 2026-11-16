import { AppointmentPrep } from './screens/AppointmentPrep'
import { parseState } from './states'
import './App.css'

export function App() {
  const state = parseState(window.location.search)
  return (
    <>
      <header className="banner">
        Reference-mode preview. Temporary approximation, not official Nightingale components. Synthetic data only.
      </header>
      <main className="page">
        <h1>Prepare for your appointment</h1>
        <AppointmentPrep state={state} />
      </main>
    </>
  )
}
