"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { Chess, type Square, type Move, type PieceSymbol, type Color } from "chess.js"

export type GameState = {
  fen: string
  turn: Color
  isCheck: boolean
  isCheckmate: boolean
  isStalemate: boolean
  isDraw: boolean
  isGameOver: boolean
  moveHistory: Move[]
  capturedPieces: { white: PieceSymbol[]; black: PieceSymbol[] }
}

export type ChessContextType = {
  game: Chess
  gameState: GameState
  selectedSquare: Square | null
  validMoves: Square[]
  selectSquare: (square: Square | null) => void
  makeMove: (from: Square, to: Square, promotion?: PieceSymbol) => boolean
  resetGame: () => void
}

const ChessContext = createContext<ChessContextType | null>(null)

export function useChess() {
  const context = useContext(ChessContext)
  if (!context) {
    throw new Error("useChess must be used within a ChessProvider")
  }
  return context
}

function getGameState(game: Chess): GameState {
  const history = game.history({ verbose: true })
  const capturedPieces = { white: [] as PieceSymbol[], black: [] as PieceSymbol[] }
  
  history.forEach((move) => {
    if (move.captured) {
      if (move.color === "w") {
        capturedPieces.white.push(move.captured)
      } else {
        capturedPieces.black.push(move.captured)
      }
    }
  })

  return {
    fen: game.fen(),
    turn: game.turn(),
    isCheck: game.isCheck(),
    isCheckmate: game.isCheckmate(),
    isStalemate: game.isStalemate(),
    isDraw: game.isDraw(),
    isGameOver: game.isGameOver(),
    moveHistory: history,
    capturedPieces,
  }
}

export function ChessProvider({ children }: { children: ReactNode }) {
  const [game] = useState(() => new Chess())
  const [gameState, setGameState] = useState<GameState>(() => getGameState(game))
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null)
  const [validMoves, setValidMoves] = useState<Square[]>([])

  const selectSquare = useCallback(
    (square: Square | null) => {
      if (!square) {
        setSelectedSquare(null)
        setValidMoves([])
        return
      }

      const piece = game.get(square)
      
      if (selectedSquare && validMoves.includes(square)) {
        return
      }

      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square)
        const moves = game.moves({ square, verbose: true })
        setValidMoves(moves.map((m) => m.to))
      } else {
        setSelectedSquare(null)
        setValidMoves([])
      }
    },
    [game, selectedSquare, validMoves]
  )

  const makeMove = useCallback(
    (from: Square, to: Square, promotion?: PieceSymbol): boolean => {
      try {
        const move = game.move({ from, to, promotion: promotion || "q" })
        if (move) {
          setGameState(getGameState(game))
          setSelectedSquare(null)
          setValidMoves([])
          return true
        }
      } catch {
        // Invalid move
      }
      return false
    },
    [game]
  )

  const resetGame = useCallback(() => {
    game.reset()
    setGameState(getGameState(game))
    setSelectedSquare(null)
    setValidMoves([])
  }, [game])

  return (
    <ChessContext.Provider
      value={{
        game,
        gameState,
        selectedSquare,
        validMoves,
        selectSquare,
        makeMove,
        resetGame,
      }}
    >
      {children}
    </ChessContext.Provider>
  )
}
