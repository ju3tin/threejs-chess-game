"use client"

import { useState } from "react"
import { ChessProvider } from "@/lib/chess-context"
import { GamePubNubProvider } from "@/lib/pubnub-provider"
import { ChessScene } from "@/components/chess-scene"
import { ChessBoard2D } from "@/components/chess-board-2d"
import { GameInfo } from "@/components/game-info"
import { Button } from "@/components/ui/button"

type ViewMode = "3d" | "2d"

function ChessGameContent() {
  const [viewMode, setViewMode] = useState<ViewMode>("3d")

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Chess Game</h1>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "3d" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("3d")}
            >
              3D View
            </Button>
            <Button
              variant={viewMode === "2d" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("2d")}
            >
              2D View
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row gap-4 p-4 max-w-7xl mx-auto w-full">
        <div className="flex-1 flex items-center justify-center min-h-[500px] lg:min-h-0">
          {viewMode === "3d" ? (
            <div className="w-full h-full min-h-[500px] rounded-xl overflow-hidden border border-border">
              <ChessScene />
            </div>
          ) : (
            <ChessBoard2D />
          )}
        </div>
        
        <aside className="lg:w-80 flex justify-center lg:justify-start">
          <GameInfo />
        </aside>
      </main>

      <footer className="border-t border-border px-4 py-3 text-center text-sm text-muted-foreground">
        <p>Click a piece to select, then click a highlighted square to move</p>
        <p className="text-xs mt-1">3D View: Drag to rotate, scroll to zoom</p>
      </footer>
    </div>
  )
}

export function ChessGame() {
  return (
    <ChessProvider>
      <GamePubNubProvider>
        <ChessGameContent />
      </GamePubNubProvider>
    </ChessProvider>
  )
}
