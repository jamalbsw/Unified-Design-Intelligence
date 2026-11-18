export type TemplateOptions = {
  layout: 'home' | 'tasks'
  communication: boolean
}

type TemplateMatch =
  | { ok: true; options: TemplateOptions }
  | { ok: false; message: string }

export function matchTemplate(request: string): TemplateMatch {
  const text = request.trim().toLowerCase()

  if (!text) {
    return { ok: false, message: 'Enter a synthetic request or choose an example.' }
  }

  const home = /\bhome(?:\s*page)?\b/.test(text)
  const tasks = /\btasks?\b/.test(text)
  const communication = /\b(?:communications?|messages?)\b/.test(text)

  if (!home && !tasks && !communication) {
    return {
      ok: false,
      message: 'No matching template. Try "Create a home page", "Create a task-focused home page", or "Create a home page with a communication summary".',
    }
  }

  return { ok: true, options: { layout: tasks ? 'tasks' : 'home', communication } }
}
