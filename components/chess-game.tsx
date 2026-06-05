"use client"

import { useState } from "react"
import { ChessProvider } from "@/lib/chess-context"
import { ChessScene } from "@/components/chess-scene"
import { ChessBoard2D } from "@/components/chess-board-2d"
import { GameInfo } from "@/components/game-info"
import { Button } from "@/components/ui/button"

type ViewMode = "3d" | "2d"

function ChessGameContent() {
  const [viewMode, setViewMode] = useState<ViewMode>("3d")

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background flex flex-col overflow-hidden">
      <header className="border-b border-border px-4 py-2 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-lg md:text-xl font-bold text-foreground">Chess Game</h1>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "3d" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("3d")}
            >
              3D
            </Button>
            <Button
              variant={viewMode === "2d" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("2d")}
            >
              2D
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row gap-3 p-3 max-w-7xl mx-auto w-full overflow-hidden">
        <div className="flex-1 flex items-center justify-center min-h-0">
          {viewMode === "3d" ? (
            <div className="w-full h-full aspect-square max-h-[calc(100dvh-220px)] lg:max-h-full lg:aspect-auto rounded-xl overflow-hidden border border-border">
              <ChessScene />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center max-h-[calc(100dvh-220px)] lg:max-h-full">
              <ChessBoard2D />
            </div>
          )}
        </div>
        
        <aside className="lg:w-80 shrink-0 overflow-y-auto max-h-[180px] lg:max-h-full">
          <GameInfo />
        </aside>
      </main>

      <footer className="border-t border-border px-4 py-2 text-center text-xs text-muted-foreground shrink-0">
        <p>Tap a piece to select, then tap a highlighted square to move</p>
      </footer>
    </div>
  )
}

export function ChessGame() {
  return (
    <ChessProvider>
      <ChessGameContent />
    </ChessProvider>
  )
}
