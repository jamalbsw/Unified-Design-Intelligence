// Every screen state a prototype must cover. The a11y gate visits each one via ?state=<name>.
export const screenStates = ['default', 'loading', 'empty', 'error', 'success'] as const

export type ScreenState = (typeof screenStates)[number]

export function parseState(search: string): ScreenState {
  const value = new URLSearchParams(search).get('state')
  return screenStates.find((s) => s === value) ?? 'default'
}
