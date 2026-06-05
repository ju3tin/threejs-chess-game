"use client"

import { useChess } from "@/lib/chess-context"
import { Button } from "@/components/ui/button"
import type { PieceSymbol, Color } from "chess.js"

const PIECE_UNICODE: Record<PieceSymbol, { w: string; b: string }> = {
  k: { w: "♔", b: "♚" },
  q: { w: "♕", b: "♛" },
  r: { w: "♖", b: "♜" },
  b: { w: "♗", b: "♝" },
  n: { w: "♘", b: "♞" },
  p: { w: "♙", b: "♟" },
}

function CapturedPieces({ pieces, color }: { pieces: PieceSymbol[]; color: Color }) {
  return (
    <div className="flex flex-wrap gap-1">
      {pieces.map((piece, i) => (
        <span key={i} className={`text-xl ${color === "w" ? "text-white" : "text-stone-900"}`}>
          {PIECE_UNICODE[piece][color === "w" ? "b" : "w"]}
        </span>
      ))}
      {pieces.length === 0 && <span className="text-muted-foreground text-sm">None</span>}
    </div>
  )
}

export function GameInfo() {
  const { gameState, resetGame } = useChess()

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-4 w-full max-w-xs">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">Game Status</h2>
        
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${gameState.turn === "w" ? "bg-white border border-border" : "bg-stone-900"}`} />
          <span className="text-foreground">
            {gameState.turn === "w" ? "White" : "Black"}&apos;s turn
          </span>
        </div>

        {gameState.isCheck && !gameState.isCheckmate && (
          <div className="text-amber-500 font-medium">Check!</div>
        )}
        
        {gameState.isCheckmate && (
          <div className="text-red-500 font-bold">
            Checkmate! {gameState.turn === "w" ? "Black" : "White"} wins!
          </div>
        )}
        
        {gameState.isStalemate && (
          <div className="text-yellow-500 font-medium">Stalemate - Draw</div>
        )}
        
        {gameState.isDraw && !gameState.isStalemate && (
          <div className="text-yellow-500 font-medium">Draw</div>
        )}
      </div>

      <div className="space-y-2 pt-2 border-t border-border">
        <div className="text-sm font-medium text-foreground">Captured Pieces</div>
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">White captured:</div>
          <CapturedPieces pieces={gameState.capturedPieces.white} color="w" />
        </div>
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Black captured:</div>
          <CapturedPieces pieces={gameState.capturedPieces.black} color="b" />
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-border">
        <Button onClick={resetGame} variant="outline" className="w-full">
          New Game
        </Button>
      </div>

      <div className="space-y-1 pt-2 border-t border-border">
        <div className="text-sm font-medium text-foreground">Move History</div>
        <div className="max-h-32 overflow-y-auto text-xs font-mono text-muted-foreground space-y-0.5">
          {gameState.moveHistory.length === 0 && (
            <div>No moves yet</div>
          )}
          {gameState.moveHistory.map((move, i) => (
            <span key={i} className="inline-block mr-2">
              {i % 2 === 0 && <span className="text-foreground">{Math.floor(i / 2) + 1}.</span>}{" "}
              {move.san}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
