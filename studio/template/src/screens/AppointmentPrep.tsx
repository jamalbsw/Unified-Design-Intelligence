import { Button, Card, Notice } from '@studio/ui'
import { appointment, checklist } from '../data/fixtures'
import type { ScreenState } from '../states'

export function AppointmentPrep({ state }: { state: ScreenState }) {
  switch (state) {
    case 'loading':
      return (
        <div aria-busy="true">
          <Notice>Loading your visit details…</Notice>
        </div>
      )
    case 'empty':
      return (
        <Card aria-labelledby="empty-title">
          <h2 id="empty-title">No upcoming appointments</h2>
          <p>When a visit is scheduled, you can prepare for it here.</p>
          <Button variant="secondary">Ask for help</Button>
        </Card>
      )
    case 'error':
      return (
        <>
          <Notice variant="error">We couldn’t load your visit details. Check your connection and try again.</Notice>
          <p>
            <Button>Try again</Button>
          </p>
        </>
      )
    case 'success':
      return <Notice variant="success">Thanks. Your visit details are confirmed.</Notice>
    default:
      return (
        <>
          <Card aria-labelledby="visit-title">
            <h2 id="visit-title">Your visit</h2>
            <p>
              {appointment.provider} at {appointment.clinic}
              <br />
              {appointment.date}, {appointment.time}
            </p>
          </Card>
          <Card aria-labelledby="bring-title">
            <h2 id="bring-title">What to bring</h2>
            <ul>
              {checklist.map((item) => (
                <li key={item}>
                  <label>
                    <input type="checkbox" /> {item}
                  </label>
                </li>
              ))}
            </ul>
          </Card>
          <p>
            <Button>Confirm visit details</Button> <Button variant="secondary">Ask for help</Button>
          </p>
        </>
      )
  }
}
