// ─── Challenge types ──────────────────────────────────────────────────────────

export type Challenge =
  | { type: 'checkbox'; question: string; options: { text: string; correct: boolean; specificFeedback?: string }[]; explanation?: string }
  | { type: 'dropdown'; parts: (string | { options: string[]; answer: string })[]; explanation?: string }
  | { type: 'dragdrop'; wordBank: string[]; parts: (string | { answer: string })[]; explanation?: string }
  | { type: 'map_pin'; targetId: string; targetName: string; explanation?: string }
  | { type: 'matching'; prompt: string; pairs: { left: string; right: string }[]; wrongHint?: string; explanation?: string }
  | { type: 'visual_scenario'; scene: { emoji: string; title: string; setting: string; stageBg: string; bgEmojis: string[]; dropZoneLabel: string; successEmoji: string; successText: string }; answer: string; distractors: string[]; wrongHint?: string; explanation?: string }

export interface Step {
  title: string
  summary: string
  detail: string
  imageUrl: string
}

export interface Badge {
  id: string
  name: string
  emoji: string
  xpRequired: number
  trivia: string
}

export interface Mod {
  id: number
  title: string
  emoji: string
  color: string
  bg: string
  border: string
  shadow: string
  heroImage: string
  theory: string
  steps: Step[]
  proTip?: string
  mistakes?: string
  showMap?: boolean
  gifs: { url: string; caption: string; emoji: string }[]
  challenges: Challenge[]
}

// ─── Exercise state types ─────────────────────────────────────────────────────

export type QuizState = Record<string, { optionText: string; correct: boolean }>
export type DropState = Record<string, string>

// ─── Navigation ───────────────────────────────────────────────────────────────

export type ActiveView = 'module' | 'progress' | 'timeline' | 'sociedad'
