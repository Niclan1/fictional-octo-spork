"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, RotateCcw, Save, Trophy, CheckCircle } from "lucide-react"
import type { GameState, AppSettings } from "@/types/sudoku"
import { validateSudoku, getHint, solveSudoku } from "@/lib/sudoku-engine"
import { saveToLocalStorage } from "@/lib/storage"

interface GameBoardProps {
  gameState: GameState
  settings: AppSettings
  onGameUpdate: (gameState: GameState) => void
}

export function GameBoard({ gameState, settings, onGameUpdate }: GameBoardProps) {
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null)
  const [showHint, setShowHint] = useState<[number, number] | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      if (!gameState.isCompleted) {
        setElapsedTime(Date.now() - gameState.startTime)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState.startTime, gameState.isCompleted])

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, "0")}`
  }

  const handleCellClick = (row: number, col: number) => {
    if (gameState.puzzle.board[row][col] !== 0) return // Can't modify given cells
    setSelectedCell([row, col])
    setShowHint(null)
  }

  const handleNumberInput = (num: number) => {
    if (!selectedCell) return

    const [row, col] = selectedCell
    const newBoard = gameState.userBoard.map((r) => [...r])
    newBoard[row][col] = num

    const updatedState = {
      ...gameState,
      userBoard: newBoard,
      isCompleted: validateSudoku(newBoard),
    }

    // If completed, add end time
    if (updatedState.isCompleted && !gameState.isCompleted) {
      updatedState.endTime = Date.now()
    }

    onGameUpdate(updatedState)
  }

  const handleHint = () => {
    if (!selectedCell || !settings.enableHints) return

    const [row, col] = selectedCell

    // Ensure we have a solution
    let solution = gameState.puzzle.solution
    if (!solution || solution.length === 0 || solution.every((row) => row.every((cell) => cell === 0))) {
      console.log("No solution found, solving puzzle...")
      solution = solveSudoku(gameState.puzzle.board)
      if (solution) {
        // Update the puzzle with the solution
        gameState.puzzle.solution = solution
      } else {
        console.error("Could not solve puzzle for hint")
        return
      }
    }

    const hint = getHint(solution, row, col)

    if (hint) {
      // Actually fill the cell with the hint
      const newBoard = gameState.userBoard.map((r) => [...r])
      newBoard[row][col] = hint

      const updatedState = {
        ...gameState,
        userBoard: newBoard,
        hintsUsed: gameState.hintsUsed + 1,
        isCompleted: validateSudoku(newBoard),
      }

      // If completed, add end time
      if (updatedState.isCompleted && !gameState.isCompleted) {
        updatedState.endTime = Date.now()
      }

      onGameUpdate(updatedState)
      setSelectedCell(null) // Clear selection after filling
    }
  }

  const handleReset = () => {
    const resetState = {
      ...gameState,
      userBoard: gameState.puzzle.board.map((row) => [...row]),
      hintsUsed: 0,
      isCompleted: false,
      endTime: undefined,
    }
    onGameUpdate(resetState)
  }

  const handleSolveBoard = () => {
    // Ensure we have a solution
    let solution = gameState.puzzle.solution
    if (!solution || solution.length === 0 || solution.every((row) => row.every((cell) => cell === 0))) {
      console.log("No solution found, solving puzzle...")
      solution = solveSudoku(gameState.puzzle.board)
      if (solution) {
        // Update the puzzle with the solution
        gameState.puzzle.solution = solution
      } else {
        console.error("Could not solve puzzle")
        return
      }
    }

    const solvedState = {
      ...gameState,
      userBoard: solution.map((row) => [...row]),
      isCompleted: true,
      endTime: Date.now(),
    }
    onGameUpdate(solvedState)
  }

  const getCellClassName = (row: number, col: number) => {
    const baseClass =
      "w-12 h-12 border border-slate-300 flex items-center justify-center text-lg font-medium cursor-pointer transition-colors"
    const isGiven = gameState.puzzle.board[row][col] !== 0
    const isSelected = selectedCell && selectedCell[0] === row && selectedCell[1] === col
    const isHinted = showHint && showHint[0] === row && showHint[1] === col

    let className = baseClass

    if (isGiven) {
      className += " bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold"
    } else {
      className +=
        " bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700"
    }

    if (isSelected) {
      className += " ring-2 ring-blue-500"
    }

    if (isHinted) {
      className += " bg-yellow-100 dark:bg-yellow-900/30"
    }

    // Add thicker borders for 3x3 box separation
    if (row % 3 === 0) className += " border-t-2 border-t-slate-600"
    if (col % 3 === 0) className += " border-l-2 border-l-slate-600"
    if (row === 8) className += " border-b-2 border-b-slate-600"
    if (col === 8) className += " border-r-2 border-r-slate-600"

    return className
  }

  return (
    <div className="space-y-6">
      {/* Game Stats */}
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <Badge variant="outline" className="px-3 py-1">
            Time: {formatTime(elapsedTime)}
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            Hints: {gameState.hintsUsed}
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            Source: {gameState.source === "generated" ? "Generated" : "Uploaded"}
          </Badge>
        </div>

        {gameState.isCompleted && (
          <Badge className="bg-green-100 text-green-800 px-3 py-1">
            <Trophy className="w-4 h-4 mr-1" />
            Completed!
          </Badge>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sudoku Grid */}
        <Card className="p-6 flex-1">
          <div className="grid grid-cols-9 gap-0 w-fit mx-auto border-2 border-slate-600">
            {gameState.userBoard.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={getCellClassName(rowIndex, colIndex)}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                >
                  {cell !== 0 ? cell : ""}
                </div>
              )),
            )}
          </div>
        </Card>

        {/* Controls */}
        <div className="space-y-4 lg:w-64">
          {/* Number Input */}
          <Card className="p-4">
            <h3 className="font-medium mb-3">Numbers</h3>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <Button
                  key={num}
                  variant="outline"
                  size="sm"
                  onClick={() => handleNumberInput(num)}
                  disabled={!selectedCell}
                >
                  {num}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNumberInput(0)}
                disabled={!selectedCell}
                className="col-span-3"
              >
                Clear
              </Button>
            </div>
          </Card>

          {/* Actions */}
          <Card className="p-4">
            <h3 className="font-medium mb-3">Actions</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleHint}
                disabled={!selectedCell || !settings.enableHints}
                className="w-full bg-transparent"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Fill Cell (Hint)
              </Button>
              <Button variant="outline" size="sm" onClick={handleReset} className="w-full bg-transparent">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button variant="outline" size="sm" onClick={handleSolveBoard} className="w-full bg-transparent">
                <CheckCircle className="w-4 h-4 mr-2" />
                Solve Entire Board
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => saveToLocalStorage("currentGame", gameState)}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
