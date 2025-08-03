import type { GameState, AppSettings } from "@/types/sudoku"

// Local Storage functions
export function saveToLocalStorage(key: string, data: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error("Failed to save to localStorage:", error)
  }
}

export function loadFromLocalStorage(key: string): any {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch (error) {
    console.error("Failed to load from localStorage:", error)
    return null
  }
}

export function removeFromLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error("Failed to remove from localStorage:", error)
  }
}

// Google Cloud Storage functions (mock implementation)
export async function exportToGoogleCloud(gameHistory: GameState[]): Promise<void> {
  // This would integrate with Google Cloud Storage API
  console.log("Exporting to Google Cloud...", gameHistory.length, "games")

  // Mock API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // In a real implementation, you would:
  // 1. Authenticate with Google Cloud Storage
  // 2. Upload the game history as JSON
  // 3. Handle errors and provide feedback

  console.log("Export completed successfully")
}

export async function importFromGoogleCloud(): Promise<GameState[] | null> {
  // This would integrate with Google Cloud Storage API
  console.log("Importing from Google Cloud...")

  // Mock API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // In a real implementation, you would:
  // 1. Authenticate with Google Cloud Storage
  // 2. Download the game history JSON
  // 3. Parse and validate the data
  // 4. Handle errors and provide feedback

  // Return mock data for now
  return []
}

// Game history management
export function addGameToHistory(game: GameState): void {
  const history = loadFromLocalStorage("gameHistory") || []

  // Check if game already exists in history
  const existingIndex = history.findIndex((g: GameState) => g.id === game.id)

  if (existingIndex !== -1) {
    // Update existing game
    history[existingIndex] = game
  } else {
    // Add new game
    history.push(game)
  }

  // Keep only last 100 games to prevent storage bloat
  if (history.length > 100) {
    history.splice(0, history.length - 100)
  }

  saveToLocalStorage("gameHistory", history)
}

export function updateGameInHistory(gameId: string, updatedGame: GameState): void {
  const history = loadFromLocalStorage("gameHistory") || []
  const index = history.findIndex((game: GameState) => game.id === gameId)

  if (index !== -1) {
    history[index] = updatedGame
    saveToLocalStorage("gameHistory", history)
  }
}

export function getGameHistory(): GameState[] {
  return loadFromLocalStorage("gameHistory") || []
}

// Settings management
export function saveSettings(settings: AppSettings): void {
  saveToLocalStorage("settings", settings)
}

export function loadSettings(): AppSettings | null {
  return loadFromLocalStorage("settings")
}
