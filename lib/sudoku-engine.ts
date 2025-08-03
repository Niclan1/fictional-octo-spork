import type { Puzzle, GenerationOptions } from "@/types/sudoku"

// This is a simplified implementation - you'll want to integrate with dlx.js
export async function generateSudoku(options: GenerationOptions): Promise<Puzzle> {
  // Generate a complete solved Sudoku board
  const solution = generateCompleteSudoku()

  // Remove numbers to create puzzle with specified clues
  const board = createPuzzleFromSolution(solution, options.clues)

  // Validate uniqueness and solvability
  if (options.ensureUnique && !hasUniqueSolution(board)) {
    return generateSudoku(options) // Retry
  }

  return {
    id: Date.now().toString(),
    board,
    solution, // Always include the solution
    difficulty: options.difficulty,
    clues: options.clues,
  }
}

export function solveSudoku(board: number[][]): number[][] | null {
  // Create a copy of the board to solve
  const solution = board.map((row) => [...row])

  // Use backtracking to solve
  if (solveBacktrack(solution)) {
    return solution
  }

  return null
}

export function validateSudoku(board: number[][]): boolean {
  // Check if the board is completely filled and valid
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) return false
      if (!isValidMove(board, row, col, board[row][col])) return false
    }
  }
  return true
}

export function getHint(solution: number[][], row: number, col: number): number | null {
  if (solution[row] && solution[row][col]) {
    return solution[row][col]
  }
  return null
}

// Helper functions
function generateCompleteSudoku(): number[][] {
  const board = Array(9)
    .fill(null)
    .map(() => Array(9).fill(0))

  // Fill diagonal 3x3 boxes first (they don't interfere with each other)
  fillDiagonalBoxes(board)

  // Fill remaining cells
  fillBoard(board)
  return board
}

function fillDiagonalBoxes(board: number[][]) {
  for (let box = 0; box < 3; box++) {
    fillBox(board, box * 3, box * 3)
  }
}

function fillBox(board: number[][], row: number, col: number) {
  const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9])
  let index = 0

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      board[row + i][col + j] = numbers[index++]
    }
  }
}

function createPuzzleFromSolution(solution: number[][], targetClues: number): number[][] {
  const board = solution.map((row) => [...row])
  const positions = []

  // Get all positions
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      positions.push([row, col])
    }
  }

  // Shuffle positions multiple times for better randomness
  for (let i = 0; i < 3; i++) {
    shuffleArray(positions)
  }

  // Remove numbers strategically, ensuring puzzle remains solvable
  const toRemove = 81 - targetClues
  let removed = 0

  for (let i = 0; i < positions.length && removed < toRemove; i++) {
    const [row, col] = positions[i]
    const originalValue = board[row][col]

    // Temporarily remove the number
    board[row][col] = 0

    // Check if puzzle still has unique solution
    if (hasUniqueSolution(board)) {
      removed++
    } else {
      // Put the number back if removing it makes puzzle unsolvable
      board[row][col] = originalValue
    }
  }

  return board
}

function hasUniqueSolution(board: number[][]): boolean {
  const solutions = []
  const boardCopy = board.map((row) => [...row])

  // Count solutions (stop at 2 to save time)
  countSolutionsLimited(boardCopy, solutions, 2)

  return solutions.length === 1
}

function countSolutionsLimited(board: number[][], solutions: number[][][], limit: number): void {
  if (solutions.length >= limit) return

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValidMove(board, row, col, num)) {
            board[row][col] = num
            countSolutionsLimited(board, solutions, limit)
            board[row][col] = 0

            if (solutions.length >= limit) return
          }
        }
        return
      }
    }
  }

  // Found a complete solution
  solutions.push(board.map((row) => [...row]))
}

function fillBoard(board: number[][]): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9])
        for (const num of numbers) {
          if (isValidMove(board, row, col, num)) {
            board[row][col] = num
            if (fillBoard(board)) return true
            board[row][col] = 0
          }
        }
        return false
      }
    }
  }
  return true
}

function isValidMove(board: number[][], row: number, col: number, num: number): boolean {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (x !== col && board[row][x] === num) return false
  }

  // Check column
  for (let x = 0; x < 9; x++) {
    if (x !== row && board[x][col] === num) return false
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3
  const boxCol = Math.floor(col / 3) * 3

  for (let i = boxRow; i < boxRow + 3; i++) {
    for (let j = boxCol; j < boxCol + 3; j++) {
      if ((i !== row || j !== col) && board[i][j] === num) return false
    }
  }

  return true
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function solveBacktrack(board: number[][]): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValidMove(board, row, col, num)) {
            board[row][col] = num
            if (solveBacktrack(board)) return true
            board[row][col] = 0
          }
        }
        return false
      }
    }
  }
  return true
}
