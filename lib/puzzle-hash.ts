export function createPuzzleHash(board: number[][]): string {
  // Convert the 2D array into a string representation
  const boardString = board.map((row) => row.join("")).join("")

  // Basic hash function (can be improved for better uniqueness)
  let hash = 0
  for (let i = 0; i < boardString.length; i++) {
    const char = boardString.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }

  return hash.toString()
}
