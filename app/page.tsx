"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Sparkles, Play } from "lucide-react"
import { SudokuGenerator } from "@/components/sudoku-generator"
import { SudokuSolver } from "@/components/sudoku-solver"
import { GameBoard } from "@/components/game-board"
import { ProgressTracker } from "@/components/progress-tracker"
import type { Puzzle, GameState, AppSettings } from "@/types/sudoku"
import { saveToLocalStorage, loadFromLocalStorage, addGameToHistory } from "@/lib/storage"

export default function SudokuApp() {
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [mode, setMode] = useState<"menu" | "generate" | "upload" | "play">("menu")
  const [settings] = useState<AppSettings>({
    minClues: 17,
    maxClues: 35,
    difficulty: "medium",
    enableHints: true,
    autoSave: true,
  })
  const [showProgress, setShowProgress] = useState(false)

  useEffect(() => {
    const savedState = loadFromLocalStorage("currentGame")
    if (savedState) {
      setGameState(savedState)
      setCurrentPuzzle(savedState.puzzle)
      setMode("play")
    }
  }, [])

  const handleNewGame = (puzzle: Puzzle) => {
    const newGameState: GameState = {
      id: Date.now().toString(),
      puzzle,
      userBoard: puzzle.board.map((row) => [...row]),
      startTime: Date.now(),
      isCompleted: false,
      hintsUsed: 0,
      source: "generated",
    }

    setCurrentPuzzle(puzzle)
    setGameState(newGameState)
    setMode("play")

    if (settings.autoSave) {
      saveToLocalStorage("currentGame", newGameState)
    }
  }

  const handleUploadedPuzzle = (puzzle: Puzzle) => {
    const newGameState: GameState = {
      id: Date.now().toString(),
      puzzle,
      userBoard: puzzle.board.map((row) => [...row]),
      startTime: Date.now(),
      isCompleted: false,
      hintsUsed: 0,
      source: "uploaded",
    }

    setCurrentPuzzle(puzzle)
    setGameState(newGameState)
    setMode("play")

    if (settings.autoSave) {
      saveToLocalStorage("currentGame", newGameState)
    }
  }

  const handleGameUpdate = (updatedState: GameState) => {
    setGameState(updatedState)

    if (settings.autoSave) {
      saveToLocalStorage("currentGame", updatedState)
    }

    // Also save to game history when completed
    if (updatedState.isCompleted && !gameState?.isCompleted) {
      addGameToHistory(updatedState)
    }
  }

  const handleBackToMenu = () => {
    setMode("menu")
  }

  if (mode === "menu") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-200 mb-2">Infinite Sudoku</h1>
            <p className="text-slate-600 dark:text-slate-400">Generate puzzles or solve from images</p>
          </div>

          <Card className="p-8">
            <div className="space-y-4">
              <Button onClick={() => setMode("generate")} className="w-full h-16 text-lg" size="lg">
                <Sparkles className="w-6 h-6 mr-3" />
                Generate New Puzzle
              </Button>

              <Button onClick={() => setMode("upload")} variant="outline" className="w-full h-16 text-lg" size="lg">
                <Upload className="w-6 h-6 mr-3" />
                Upload & Solve Image
              </Button>

              {gameState && (
                <Button onClick={() => setMode("play")} variant="secondary" className="w-full h-12">
                  <Play className="w-4 h-4 mr-2" />
                  Continue Current Game
                </Button>
              )}

              <Button onClick={() => setShowProgress(true)} variant="ghost" className="w-full h-12">
                📊 View Progress & Stats
              </Button>
            </div>
          </Card>

          {showProgress && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Progress & Statistics</h2>
                  <Button variant="ghost" onClick={() => setShowProgress(false)}>
                    ✕
                  </Button>
                </div>
                <ProgressTracker settings={settings} />
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (mode === "generate") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-6">
            <Button variant="outline" onClick={handleBackToMenu}>
              ← Back to Menu
            </Button>
          </div>
          <Card className="p-6">
            <SudokuGenerator settings={settings} onPuzzleGenerated={handleNewGame} />
          </Card>
        </div>
      </div>
    )
  }

  if (mode === "upload") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-6">
            <Button variant="outline" onClick={handleBackToMenu}>
              ← Back to Menu
            </Button>
          </div>
          <Card className="p-6">
            <SudokuSolver onPuzzleDetected={handleUploadedPuzzle} />
          </Card>
        </div>
      </div>
    )
  }

  if (mode === "play" && gameState && currentPuzzle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="mb-6">
            <Button variant="outline" onClick={handleBackToMenu}>
              ← Back to Menu
            </Button>
          </div>
          <GameBoard gameState={gameState} settings={settings} onGameUpdate={handleGameUpdate} />
        </div>
      </div>
    )
  }

  return null
}
