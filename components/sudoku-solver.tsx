"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Camera, Loader2, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react"
import type { Puzzle } from "@/types/sudoku"
import { extractSudokuFromImage, validateExtractedPuzzle } from "@/lib/ocr-engine"

interface SudokuSolverProps {
  onPuzzleDetected: (puzzle: Puzzle) => void
}

export function SudokuSolver({ onPuzzleDetected }: SudokuSolverProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedBoard, setExtractedBoard] = useState<number[][] | null>(null)
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    hasMultipleSolutions: boolean
    message: string
    solution?: number[][]
    isDuplicate?: boolean
    duplicateMessage?: string
  } | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    setValidationResult(null)
    setExtractedBoard(null)

    try {
      // Create image preview
      const imageUrl = URL.createObjectURL(file)
      setUploadedImage(imageUrl)

      // Extract Sudoku from image
      const board = await extractSudokuFromImage(file)
      setExtractedBoard(board)

      // Validate the extracted puzzle
      const validation = await validateExtractedPuzzle(board)
      setValidationResult(validation)

      if (validation.isValid) {
        // Create puzzle object with the solved solution
        const puzzle: Puzzle = {
          id: Date.now().toString(),
          board,
          solution: validation.solution || [], // Make sure we include the solution
          difficulty: "unknown",
          clues: board.flat().filter((cell) => cell !== 0).length,
        }

        onPuzzleDetected(puzzle)
      }
    } catch (error) {
      console.error("OCR processing failed:", error)
      setValidationResult({
        isValid: false,
        hasMultipleSolutions: false,
        message: "Failed to process image. Please try a clearer image with better contrast.",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCameraCapture = () => {
    // For now, trigger file input - in a real app you'd implement camera capture
    fileInputRef.current?.click()
  }

  const renderExtractedBoard = () => {
    if (!extractedBoard) return null

    return (
      <div className="grid grid-cols-9 gap-0 w-fit mx-auto border-2 border-slate-600 mt-4">
        {extractedBoard.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            let className = "w-8 h-8 border border-slate-300 flex items-center justify-center text-sm font-medium"

            // Add thicker borders for 3x3 box separation
            if (rowIndex % 3 === 0) className += " border-t-2 border-t-slate-600"
            if (colIndex % 3 === 0) className += " border-l-2 border-l-slate-600"
            if (rowIndex === 8) className += " border-b-2 border-b-slate-600"
            if (colIndex === 8) className += " border-r-2 border-r-slate-600"

            if (cell !== 0) {
              className += " bg-slate-100 dark:bg-slate-700"
            } else {
              className += " bg-white dark:bg-slate-800"
            }

            return (
              <div key={`${rowIndex}-${colIndex}`} className={className}>
                {cell !== 0 ? cell : ""}
              </div>
            )
          }),
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">OCR Sudoku Solver</h2>
        <p className="text-slate-600 dark:text-slate-400">
          Upload an image or take a photo of a Sudoku puzzle to solve it
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-3 block">Upload Image</Label>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              <div className="space-y-2">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="w-full"
                  variant="outline"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Image
                </Button>
                <Button
                  onClick={handleCameraCapture}
                  disabled={isProcessing}
                  className="w-full bg-transparent"
                  variant="outline"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
              </div>
            </div>

            {isProcessing && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mr-2" />
                <span>Processing image...</span>
              </div>
            )}

            {validationResult && (
              <div className="space-y-2">
                <Alert className={validationResult.isValid ? "border-green-200" : "border-red-200"}>
                  {validationResult.isValid ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription>
                    {validationResult.message}
                    {validationResult.hasMultipleSolutions && (
                      <div className="mt-2 text-sm text-amber-600">
                        ⚠️ Warning: This puzzle may have multiple solutions
                      </div>
                    )}
                  </AlertDescription>
                </Alert>

                {/* Duplicate Warning */}
                {validationResult.isDuplicate && validationResult.duplicateMessage && (
                  <Alert className="border-amber-200">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-700">{validationResult.duplicateMessage}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Preview Section */}
        <Card className="p-6">
          <h3 className="font-medium mb-3">Preview</h3>
          {uploadedImage && (
            <div className="space-y-4">
              <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                <img
                  src={uploadedImage || "/placeholder.svg"}
                  alt="Uploaded Sudoku"
                  className="w-full h-full object-contain"
                />
              </div>
              {renderExtractedBoard()}
            </div>
          )}
          {!uploadedImage && (
            <div className="aspect-square bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400">
              No image uploaded
            </div>
          )}
        </Card>
      </div>

      <div className="text-center text-sm text-slate-600 dark:text-slate-400">
        <p>Tips for best results:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Ensure good lighting and contrast</li>
          <li>Keep the puzzle grid straight and fully visible</li>
          <li>Avoid shadows and reflections</li>
          <li>Use high resolution images when possible</li>
        </ul>
      </div>
    </div>
  )
}
