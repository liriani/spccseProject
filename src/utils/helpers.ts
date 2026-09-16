export function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export function bold(text: unknown): string {
  if (typeof text !== 'string') return ''
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
}
