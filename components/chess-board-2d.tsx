"use client"

import { useChess } from "@/lib/chess-context"
import { usePubNubGame } from "@/lib/pubnub-provider"
import type { Square, PieceSymbol, Color } from "chess.js"

const PIECE_UNICODE: Record<PieceSymbol, { w: string; b: string }> = {
  k: { w: "♔", b: "♚" },
  q: { w: "♕", b: "♛" },
  r: { w: "♖", b: "♜" },
  b: { w: "♗", b: "♝" },
  n: { w: "♘", b: "♞" },
  p: { w: "♙", b: "♟" },
}

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"]
const RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"]

function getSquare(col: number, row: number, flipped: boolean): Square {
  const actualCol = flipped ? 7 - col : col
  const actualRow = flipped ? 7 - row : row
  return `${FILES[actualCol]}${RANKS[actualRow]}` as Square
}

export function ChessBoard2D() {
  const { game, gameState, selectedSquare, validMoves, selectSquare, makeMove, playerColor, isMultiplayer } = useChess()
  const pubnub = usePubNubGame()

  const flipped = isMultiplayer && playerColor === "b"
  const lastMove = gameState.moveHistory.length > 0 
    ? gameState.moveHistory[gameState.moveHistory.length - 1] 
    : null

  const handleSquareClick = (square: Square) => {
    if (selectedSquare && validMoves.includes(square)) {
      const success = makeMove(selectedSquare, square)
      if (success && pubnub) {
        pubnub.publishMove(selectedSquare, square)
      }
    } else {
      selectSquare(square)
    }
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-8 border-2 border-border rounded-lg overflow-hidden shadow-xl">
        {RANKS.map((_, rowIndex) =>
          FILES.map((_, colIndex) => {
            const square = getSquare(colIndex, rowIndex, flipped)
            const piece = game.get(square)
            const isLight = (rowIndex + colIndex) % 2 === 0
            const isSelected = selectedSquare === square
            const isValidMove = validMoves.includes(square)
            const isLastMove = lastMove ? (lastMove.from === square || lastMove.to === square) : false

            return (
              <button
                key={square}
                onClick={() => handleSquareClick(square)}
                className={`
                  relative aspect-square w-10 sm:w-12 md:w-14 flex items-center justify-center
                  transition-colors duration-150
                  ${isLight ? "bg-amber-100" : "bg-amber-700"}
                  ${isSelected ? "!bg-green-500" : ""}
                  ${isValidMove ? "!bg-green-300" : ""}
                  ${isLastMove && !isSelected && !isValidMove ? "!bg-yellow-300" : ""}
                  hover:brightness-110
                `}
              >
                {piece && (
                  <span 
                    className={`
                      text-3xl sm:text-4xl md:text-5xl select-none
                      ${piece.color === "w" ? "text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" : "text-stone-900"}
                      ${isSelected ? "scale-110" : ""}
                      transition-transform
                    `}
                  >
                    {PIECE_UNICODE[piece.type][piece.color]}
                  </span>
                )}
                {isValidMove && !piece && (
                  <div className="absolute w-3 h-3 rounded-full bg-green-600/50" />
                )}
                {colIndex === 0 && (
                  <span className={`absolute left-1 top-0.5 text-xs font-medium ${isLight ? "text-amber-700" : "text-amber-100"}`}>
                    {flipped ? RANKS[7 - rowIndex] : RANKS[rowIndex]}
                  </span>
                )}
                {rowIndex === 7 && (
                  <span className={`absolute right-1 bottom-0.5 text-xs font-medium ${isLight ? "text-amber-700" : "text-amber-100"}`}>
                    {flipped ? FILES[7 - colIndex] : FILES[colIndex]}
                  </span>
                )}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
