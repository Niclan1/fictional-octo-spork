export interface Puzzle {
  id: string
  board: number[][]
  solution: number[][]
  difficulty: "easy" | "medium" | "hard" | "unknown"
  clues: number
}

export interface GameState {
  id: string
  puzzle: Puzzle
  userBoard: number[][]
  startTime: number
  endTime?: number
  isCompleted: boolean
  hintsUsed: number
  source: "generated" | "uploaded"
}

export interface AppSettings {
  minClues: number
  maxClues: number
  difficulty: "easy" | "medium" | "hard"
  enableHints: boolean
  autoSave: boolean
}

export interface GenerationOptions {
  clues: number
  difficulty: "easy" | "medium" | "hard"
  ensureUnique: boolean
  ensureSolvable: boolean
}
