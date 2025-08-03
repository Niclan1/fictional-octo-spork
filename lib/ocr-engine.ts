import { solveSudoku } from "./sudoku-engine"
import { createPuzzleHash } from "./puzzle-hash"

// This would integrate with tesseract.js for OCR functionality
export async function extractSudokuFromImage(file: File): Promise<number[][]> {
  // Mock implementation - replace with actual tesseract.js integration
  console.log("Processing image with OCR...", file.name)

  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Return a mock extracted board
  return [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
  ]
}

export async function validateExtractedPuzzle(board: number[][]): Promise<{
  isValid: boolean
  hasMultipleSolutions: boolean
  message: string
  solution?: number[][]
  isDuplicate?: boolean
  duplicateMessage?: string
}> {
  // Basic validation
  if (!board || board.length !== 9 || !board.every((row) => row.length === 9)) {
    return {
      isValid: false,
      hasMultipleSolutions: false,
      message: "Invalid board structure detected",
    }
  }

  // Check for valid numbers
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cell = board[row][col]
      if (cell < 0 || cell > 9) {
        return {
          isValid: false,
          hasMultipleSolutions: false,
          message: "Invalid numbers detected in puzzle",
        }
      }
    }
  }

  // Check for conflicts
  if (hasConflicts(board)) {
    return {
      isValid: false,
      hasMultipleSolutions: false,
      message: "Puzzle contains conflicts - please check the image",
    }
  }

  // Check for duplicates
  const duplicateCheck = checkForDuplicate(board)

  // Solve the puzzle to get the solution
  const solution = solveSudoku(board)

  if (!solution) {
    return {
      isValid: false,
      hasMultipleSolutions: false,
      message: "Puzzle has no valid solution",
      ...duplicateCheck,
    }
  }

  // Check solvability (mock implementation for multiple solutions)
  const solutionCount = countSolutions(board)

  if (solutionCount > 1) {
    return {
      isValid: true,
      hasMultipleSolutions: true,
      message: "Puzzle extracted successfully, but may have multiple solutions",
      solution,
      ...duplicateCheck,
    }
  } else {
    return {
      isValid: true,
      hasMultipleSolutions: false,
      message: "Puzzle extracted successfully with unique solution",
      solution,
      ...duplicateCheck,
    }
  }
}

function checkForDuplicate(board: number[][]): {
  isDuplicate: boolean
  duplicateMessage?: string
} {
  try {
    // Create a hash of the puzzle for comparison
    const puzzleHash = createPuzzleHash(board)

    // Get existing puzzle hashes from localStorage
    const existingHashes = JSON.parse(localStorage.getItem("puzzleHashes") || "[]")

    // Check if this hash already exists
    const isDuplicate = existingHashes.includes(puzzleHash)

    if (isDuplicate) {
      return {
        isDuplicate: true,
        duplicateMessage: "⚠️ This puzzle appears to be a duplicate of one you've uploaded before",
      }
    } else {
      // Add this hash to the list
      existingHashes.push(puzzleHash)

      // Keep only the last 1000 hashes to prevent storage bloat
      if (existingHashes.length > 1000) {
        existingHashes.splice(0, existingHashes.length - 1000)
      }

      localStorage.setItem("puzzleHashes", JSON.stringify(existingHashes))

      return {
        isDuplicate: false,
      }
    }
  } catch (error) {
    console.error("Error checking for duplicates:", error)
    return {
      isDuplicate: false,
    }
  }
}

function hasConflicts(board: number[][]): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const num = board[row][col]
      if (num !== 0) {
        // Temporarily remove the number to check conflicts
        board[row][col] = 0
        const isValid = isValidMove(board, row, col, num)
        board[row][col] = num

        if (!isValid) return true
      }
    }
  }
  return false
}

function countSolutions(board: number[][]): number {
  // Mock implementation - should count actual solutions
  return 1
}

function isValidMove(board: number[][], row: number, col: number, num: number): boolean {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) return false
  }

  // Check column
  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num) return false
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3
  const boxCol = Math.floor(col / 3) * 3

  for (let i = boxRow; i < boxRow + 3; i++) {
    for (let j = boxCol; j < boxCol + 3; j++) {
      if (board[i][j] === num) return false
    }
  }

  return true
}
