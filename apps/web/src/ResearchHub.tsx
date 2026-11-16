import './ResearchHub.css'

// UI shell only. The hub is not connected to a research platform or storage, so no research data is shown.
const filters = ['Prototype', 'Theme', 'Study', 'Method', 'Date']

const insightFields = [
  ['Finding', 'A plain-language statement of what users did or said.'],
  ['Evidence', 'De-identified quotes and highlights that support it.'],
  ['Source', 'A link back to the session in the research platform.'],
  ['Prototype', 'The prototype and version that was tested.'],
  ['Themes', 'Tags that group related findings together.'],
  ['Details', 'Study, method and date, so you can judge how current it is.'],
]

const flow = [
  ['Users test', 'People try a prototype link on the research platform.'],
  ['Ingest and de-identify', 'Findings come in with names and contact details removed.'],
  ['Insights store', 'One central place, with each insight linked to a prototype.'],
  ['Search and pull', 'Designers and agents find what is relevant, with citations.'],
]

const uses = [
  ['In a brief', 'Attach the findings that matter, so an idea starts from evidence.'],
  ['In a spec', 'The agent cites the evidence behind each design decision.'],
  ['In handoff', 'The evidence travels with the prototype to engineering.'],
]

function ResearchHub() {
  return (
    <main id="research" tabIndex={-1}>
      <section className="intro">
        <div>
          <p className="eyebrow">RESEARCH HUB</p>
          <h1>Everything users tell us, in one place.</h1>
          <p className="intro-copy">
            Search what people said and did when they tested prototypes, then
            pull the relevant findings into a brief, a spec or a handoff.
          </p>
        </div>
        <div className="intro-aside">
          <span className="cell" aria-hidden="true" />
          <span className="mode-badge">
            <span className="status-dot" aria-hidden="true" />
            Not connected
          </span>
        </div>
      </section>

      <div className="notice" role="note">
        <span className="notice-icon" aria-hidden="true">i</span>
        <p>
          The research hub is not connected to a research platform or storage
          yet, so nothing here is real research. Don’t enter participant
          details or confidential information.
        </p>
      </div>

      <section className="research-grid" aria-label="Search and insight details">
        <section className="research-card" aria-labelledby="search-title">
          <p className="step-label">FIND</p>
          <h2 id="search-title">Search insights</h2>
          <form role="search" aria-label="Search research insights" onSubmit={(event) => event.preventDefault()}>
            <label htmlFor="insight-search">What do you want to learn?</label>
            <div className="search-row">
              <input
                aria-describedby="research-disabled-reason"
                disabled
                id="insight-search"
                placeholder="For example: where do patients get stuck?"
                type="search"
              />
              <button className="research-button" disabled type="submit">Search</button>
            </div>
            <fieldset className="filter-group" disabled>
              <legend>Filter by</legend>
              {filters.map((filter) => (
                <button className="filter-chip" key={filter} type="button">{filter}</button>
              ))}
            </fieldset>
          </form>
          <p className="research-disabled-reason" id="research-disabled-reason">
            Search and filters turn on when the hub is connected to a research
            platform and storage.
          </p>
        </section>

        <section className="research-card" aria-labelledby="fields-title">
          <p className="step-label">WHAT YOU WILL SEE</p>
          <h2 id="fields-title">What each insight includes</h2>
          <dl className="insight-fields">
            {insightFields.map(([term, description]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{description}</dd>
              </div>
            ))}
          </dl>
        </section>
      </section>

      <section className="research-card results-empty" aria-labelledby="results-title">
        <span className="cell cell-small" aria-hidden="true" />
        <div>
          <h2 id="results-title">No insights yet</h2>
          <p>
            Once the hub is connected, matching insights appear here with their
            source, themes and linked prototype.
          </p>
        </div>
      </section>

      <section className="research-card" aria-labelledby="flow-title">
        <p className="step-label">HOW IT WORKS</p>
        <h2 id="flow-title">How research flows in</h2>
        <ol className="flow-list">
          {flow.map(([title, text], index) => (
            <li key={title}>
              <span className="flow-number" aria-hidden="true">{index + 1}</span>
              <strong>{title}</strong>
              <span>{text}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="research-card" aria-labelledby="uses-title">
        <p className="step-label">WHERE YOU WILL USE IT</p>
        <h2 id="uses-title">Evidence wherever work happens</h2>
        <ul className="use-list">
          {uses.map(([title, text]) => (
            <li key={title}>
              <strong>{title}</strong>
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="research-privacy" role="note">
        Planned default: raw recordings, transcripts and participant details stay
        in the research platform. The hub keeps de-identified insights, each with
        a link back to its source.
      </p>
    </main>
  )
}

export default ResearchHub
