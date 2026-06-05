"use client"

import { useState } from "react"
import { useChess } from "@/lib/chess-context"
import { usePubNubGame } from "@/lib/pubnub-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  const { gameState, playerColor, isMultiplayer, opponentConnected, resetGame, createGame, joinGame, gameId } = useChess()
  const pubnub = usePubNubGame()
  const [joinId, setJoinId] = useState("")
  const [showJoin, setShowJoin] = useState(false)

  const hasPubNub = pubnub !== null

  const handleReset = () => {
    resetGame()
    if (pubnub) {
      pubnub.publishReset()
    }
  }

  const handleCreateGame = () => {
    const id = createGame()
    navigator.clipboard?.writeText(id)
  }

  const handleJoinGame = () => {
    if (joinId.trim()) {
      joinGame(joinId.trim())
      setShowJoin(false)
      setJoinId("")
    }
  }

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

      {isMultiplayer && (
        <div className="space-y-2 pt-2 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Playing as: <span className="font-medium text-foreground">{playerColor === "w" ? "White" : "Black"}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Game ID: <code className="bg-muted px-1 py-0.5 rounded text-foreground">{gameId}</code>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${opponentConnected ? "bg-green-500" : "bg-red-500"}`} />
            <span className="text-muted-foreground">
              {opponentConnected ? "Opponent connected" : "Waiting for opponent..."}
            </span>
          </div>
        </div>
      )}

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
        <Button onClick={handleReset} variant="outline" className="w-full">
          New Game
        </Button>
        
        {hasPubNub && !isMultiplayer && (
          <>
            <Button onClick={handleCreateGame} className="w-full">
              Create Online Game
            </Button>
            
            {showJoin ? (
              <div className="flex gap-2">
                <Input
                  placeholder="Game ID"
                  value={joinId}
                  onChange={(e) => setJoinId(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleJoinGame} size="sm">
                  Join
                </Button>
              </div>
            ) : (
              <Button onClick={() => setShowJoin(true)} variant="secondary" className="w-full">
                Join Game
              </Button>
            )}
          </>
        )}

        {!hasPubNub && (
          <p className="text-xs text-muted-foreground text-center">
            Add PubNub keys to enable multiplayer
          </p>
        )}
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
