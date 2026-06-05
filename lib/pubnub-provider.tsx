"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import PubNub from "pubnub"
import { PubNubProvider as PubNubReactProvider, usePubNub } from "pubnub-react"
import { useChess } from "./chess-context"
import type { Square, PieceSymbol } from "chess.js"
import { v4 as uuidv4 } from "uuid"

type MessageType = 
  | { type: "move"; from: Square; to: Square; promotion?: PieceSymbol }
  | { type: "join"; color: "b" }
  | { type: "sync"; fen: string }
  | { type: "reset" }

const PubNubContext = createContext<{
  isConnected: boolean
  publishMove: (from: Square, to: Square, promotion?: PieceSymbol) => void
  publishReset: () => void
} | null>(null)

export function usePubNubGame() {
  return useContext(PubNubContext)
}

function PubNubGameHandler({ children }: { children: ReactNode }) {
  const pubnub = usePubNub()
  const { gameId, isMultiplayer, setMultiplayerMove, setOpponentConnected, playerColor, gameState, resetGame } = useChess()
  const [isConnected, setIsConnected] = useState(false)

  const channel = `chess-game-${gameId}`

  useEffect(() => {
    if (!isMultiplayer) return

    const listener = {
      message: (event: { message: MessageType }) => {
        const msg = event.message
        
        if (msg.type === "move") {
          setMultiplayerMove(msg.from, msg.to, msg.promotion)
        } else if (msg.type === "join") {
          setOpponentConnected(true)
          pubnub.publish({
            channel,
            message: { type: "sync", fen: gameState.fen } as MessageType,
          })
        } else if (msg.type === "reset") {
          resetGame()
        }
      },
      presence: (event: { action: string }) => {
        if (event.action === "join") {
          setOpponentConnected(true)
        } else if (event.action === "leave" || event.action === "timeout") {
          setOpponentConnected(false)
        }
      },
    }

    pubnub.addListener(listener)
    pubnub.subscribe({ channels: [channel], withPresence: true })

    if (playerColor === "b") {
      pubnub.publish({
        channel,
        message: { type: "join", color: "b" } as MessageType,
      })
    }

    setIsConnected(true)

    return () => {
      pubnub.removeListener(listener)
      pubnub.unsubscribe({ channels: [channel] })
      setIsConnected(false)
    }
  }, [isMultiplayer, channel, pubnub, setMultiplayerMove, setOpponentConnected, playerColor, gameState.fen, resetGame])

  const publishMove = useCallback(
    (from: Square, to: Square, promotion?: PieceSymbol) => {
      if (!isMultiplayer) return
      pubnub.publish({
        channel,
        message: { type: "move", from, to, promotion } as MessageType,
      })
    },
    [pubnub, channel, isMultiplayer]
  )

  const publishReset = useCallback(() => {
    if (!isMultiplayer) return
    pubnub.publish({
      channel,
      message: { type: "reset" } as MessageType,
    })
  }, [pubnub, channel, isMultiplayer])

  return (
    <PubNubContext.Provider value={{ isConnected, publishMove, publishReset }}>
      {children}
    </PubNubContext.Provider>
  )
}

export function GamePubNubProvider({ children }: { children: ReactNode }) {
  const publishKey = process.env.NEXT_PUBLIC_PUBNUB_PUBLISH_KEY
  const subscribeKey = process.env.NEXT_PUBLIC_PUBNUB_SUBSCRIBE_KEY

  if (!publishKey || !subscribeKey) {
    return (
      <PubNubContext.Provider value={null}>
        {children}
      </PubNubContext.Provider>
    )
  }

  const pubnub = new PubNub({
    publishKey,
    subscribeKey,
    userId: uuidv4(),
  })

  return (
    <PubNubReactProvider client={pubnub}>
      <PubNubGameHandler>{children}</PubNubGameHandler>
    </PubNubReactProvider>
  )
}
