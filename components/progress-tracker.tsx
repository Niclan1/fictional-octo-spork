"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Clock, Target, Upload, Download } from "lucide-react"
import type { GameState, AppSettings } from "@/types/sudoku"
import { loadFromLocalStorage, saveToLocalStorage, exportToGoogleCloud, importFromGoogleCloud } from "@/lib/storage"

interface ProgressTrackerProps {
  settings: AppSettings
}

export function ProgressTracker({ settings }: ProgressTrackerProps) {
  const [gameHistory, setGameHistory] = useState<GameState[]>([])
  const [stats, setStats] = useState({
    totalGames: 0,
    completedGames: 0,
    totalTime: 0,
    averageTime: 0,
    hintsUsed: 0,
    bestTime: 0,
  })
  const [isCloudSyncing, setIsCloudSyncing] = useState(false)

  useEffect(() => {
    loadGameHistory()
  }, [])

  const loadGameHistory = () => {
    const history = loadFromLocalStorage("gameHistory") || []
    setGameHistory(history)
    calculateStats(history)
  }

  const calculateStats = (history: GameState[]) => {
    const completed = history.filter((game) => game.isCompleted)
    const totalTime = completed.reduce((sum, game) => {
      return sum + (game.endTime ? game.endTime - game.startTime : 0)
    }, 0)

    setStats({
      totalGames: history.length,
      completedGames: completed.length,
      totalTime,
      averageTime: completed.length > 0 ? totalTime / completed.length : 0,
      hintsUsed: history.reduce((sum, game) => sum + game.hintsUsed, 0),
      bestTime:
        completed.length > 0
          ? Math.min(
              ...completed.map((game) => (game.endTime ? game.endTime - game.startTime : Number.POSITIVE_INFINITY)),
            )
          : 0,
    })
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    }
    return `${minutes}m ${seconds % 60}s`
  }

  const handleCloudExport = async () => {
    setIsCloudSyncing(true)
    try {
      await exportToGoogleCloud(gameHistory)
      // Show success message
    } catch (error) {
      console.error("Cloud export failed:", error)
      // Show error message
    } finally {
      setIsCloudSyncing(false)
    }
  }

  const handleCloudImport = async () => {
    setIsCloudSyncing(true)
    try {
      const cloudHistory = await importFromGoogleCloud()
      if (cloudHistory) {
        setGameHistory(cloudHistory)
        saveToLocalStorage("gameHistory", cloudHistory)
        calculateStats(cloudHistory)
      }
    } catch (error) {
      console.error("Cloud import failed:", error)
    } finally {
      setIsCloudSyncing(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
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
        <h2 className="text-2xl font-semibold mb-2">Progress Tracker</h2>
        <p className="text-slate-600 dark:text-slate-400">Track your Sudoku solving journey and achievements</p>
      </div>

      {/* Cloud Sync */}
      <Card className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium">Cloud Storage</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Sync your progress with Google Cloud Storage</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCloudExport} disabled={isCloudSyncing}>
              <Upload className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={handleCloudImport} disabled={isCloudSyncing}>
              <Download className="w-4 h-4 mr-2" />
              Import
            </Button>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="history">Game History</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">{stats.completedGames}</div>
              <div className="text-sm text-slate-600">Completed</div>
            </Card>

            <Card className="p-4 text-center">
              <Target className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{stats.totalGames}</div>
              <div className="text-sm text-slate-600">Total Games</div>
            </Card>

            <Card className="p-4 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{stats.bestTime > 0 ? formatTime(stats.bestTime) : "--"}</div>
              <div className="text-sm text-slate-600">Best Time</div>
            </Card>

            <Card className="p-4 text-center">
              <div className="w-8 h-8 mx-auto mb-2 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold">H</span>
              </div>
              <div className="text-2xl font-bold">{stats.hintsUsed}</div>
              <div className="text-sm text-slate-600">Hints Used</div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="font-medium mb-4">Performance Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Completion Rate:</span>
                <span className="font-medium">
                  {stats.totalGames > 0 ? Math.round((stats.completedGames / stats.totalGames) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Average Time:</span>
                <span className="font-medium">{stats.averageTime > 0 ? formatTime(stats.averageTime) : "--"}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Play Time:</span>
                <span className="font-medium">{formatTime(stats.totalTime)}</span>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {gameHistory.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-slate-600 dark:text-slate-400">
                No games played yet. Start solving puzzles to see your history!
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {gameHistory
                .slice()
                .reverse()
                .map((game, index) => (
                  <Card key={game.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge className={getDifficultyColor(game.puzzle.difficulty)}>{game.puzzle.difficulty}</Badge>
                          <Badge variant="outline">{game.puzzle.clues} clues</Badge>
                          <Badge variant="outline">{game.source}</Badge>
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          Started: {new Date(game.startTime).toLocaleString()}
                        </div>
                        {game.endTime && (
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            Duration: {formatTime(game.endTime - game.startTime)}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        {game.isCompleted ? (
                          <Badge className="bg-green-100 text-green-800">
                            <Trophy className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                        ) : (
                          <Badge variant="outline">In Progress</Badge>
                        )}
                        {game.hintsUsed > 0 && (
                          <div className="text-xs text-slate-500 mt-1">{game.hintsUsed} hints used</div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
