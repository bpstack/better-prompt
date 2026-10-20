/** What the band shows: the offer to rewrite, Haiku at work, its version, or why there is none. */
export type View =
  | { kind: 'idle' }
  | { kind: 'working' }
  | { kind: 'proposal'; text: string; tokensIn: number; tokensOut: number }
  | { kind: 'error'; reason: string }

declare module 'claude-code' {
  interface PluginState {
    // hasDraft: the prompt box holds more than whitespace.
    // view: what the band above the prompt shows.
    'better-prompt': { hasDraft: boolean; view: View }
  }
}
