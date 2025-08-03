"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { SettingsIcon } from "lucide-react"
import type { AppSettings } from "@/types/sudoku"
import { saveToLocalStorage } from "@/lib/storage"

interface SettingsProps {
  settings: AppSettings
  onSettingsChange: (settings: AppSettings) => void
}

export function Settings({ settings, onSettingsChange }: SettingsProps) {
  const [localSettings, setLocalSettings] = useState(settings)

  const handleSave = () => {
    onSettingsChange(localSettings)
    saveToLocalStorage("settings", localSettings)
  }

  const handleReset = () => {
    const defaultSettings: AppSettings = {
      minClues: 17,
      maxClues: 35,
      difficulty: "medium",
      enableHints: true,
      autoSave: true,
    }
    setLocalSettings(defaultSettings)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-4 right-4 rounded-full w-12 h-12 p-0 bg-transparent"
        >
          <SettingsIcon className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Puzzle Generation */}
          <Card className="p-4">
            <h3 className="font-medium mb-4">Puzzle Generation</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-3 block">Minimum Clues: {localSettings.minClues}</Label>
                <Slider
                  value={[localSettings.minClues]}
                  onValueChange={([value]) => setLocalSettings((prev) => ({ ...prev, minClues: value }))}
                  min={17}
                  max={30}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">Maximum Clues: {localSettings.maxClues}</Label>
                <Slider
                  value={[localSettings.maxClues]}
                  onValueChange={([value]) => setLocalSettings((prev) => ({ ...prev, maxClues: value }))}
                  min={25}
                  max={50}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">Default Difficulty</Label>
                <Select
                  value={localSettings.difficulty}
                  onValueChange={(value: "easy" | "medium" | "hard") =>
                    setLocalSettings((prev) => ({ ...prev, difficulty: value }))
                  }
                >
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
          </Card>

          {/* Game Features */}
          <Card className="p-4">
            <h3 className="font-medium mb-4">Game Features</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="hints" className="text-sm font-medium">
                  Enable Hints
                </Label>
                <Switch
                  id="hints"
                  checked={localSettings.enableHints}
                  onCheckedChange={(checked) => setLocalSettings((prev) => ({ ...prev, enableHints: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="autosave" className="text-sm font-medium">
                  Auto Save Progress
                </Label>
                <Switch
                  id="autosave"
                  checked={localSettings.autoSave}
                  onCheckedChange={(checked) => setLocalSettings((prev) => ({ ...prev, autoSave: checked }))}
                />
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleReset}>
              Reset to Defaults
            </Button>
            <Button onClick={handleSave}>Save Settings</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
