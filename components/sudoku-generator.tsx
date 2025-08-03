"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles } from "lucide-react"
import type { AppSettings, Puzzle } from "@/types/sudoku"
import { generateSudoku } from "@/lib/sudoku-engine"

interface SudokuGeneratorProps {
  settings: AppSettings
  onPuzzleGenerated: (puzzle: Puzzle) => void
}

export function SudokuGenerator({ settings, onPuzzleGenerated }: SudokuGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [clueCount, setClueCount] = useState([25])
  const [difficulty, setDifficulty] = useState(settings.difficulty)
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null)

  const handleGenerate = async () => {
    setIsGenerating(true)

    try {
      // Add a small delay to show loading state
      await new Promise((resolve) => setTimeout(resolve, 500))

      const puzzle = await generateSudoku({
        clues: clueCount[0],
        difficulty,
        ensureUnique: true,
        ensureSolvable: true,
      })

      onPuzzleGenerated(puzzle)
      setLastGenerated(new Date())
    } catch (error) {
      console.error("Failed to generate puzzle:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "easy":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Generate New Puzzle</h2>
        <p className="text-slate-600 dark:text-slate-400">Create a unique Sudoku puzzle with your preferred settings</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-3 block">Number of Clues: {clueCount[0]}</Label>
            <Slider
              value={clueCount}
              onValueChange={setClueCount}
              min={settings.minClues}
              max={settings.maxClues}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Min: {settings.minClues}</span>
              <span>Max: {settings.maxClues}</span>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block">Difficulty</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="p-4 bg-slate-50 dark:bg-slate-800/50">
          <h3 className="font-medium mb-3">Puzzle Preview</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Clues:</span>
              <Badge variant="outline">{clueCount[0]}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Difficulty:</span>
              <Badge className={getDifficultyColor(difficulty)}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Unique Solution:</span>
              <Badge className="bg-blue-100 text-blue-800">Guaranteed</Badge>
            </div>
            {lastGenerated && (
              <div className="text-xs text-slate-500 pt-2 border-t">
                Last generated: {lastGenerated.toLocaleTimeString()}
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="text-center">
        <Button onClick={handleGenerate} disabled={isGenerating} size="lg" className="px-8">
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Puzzle
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
