"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame, type ThreeElements } from "@react-three/fiber"
import { OrbitControls, Environment, Html } from "@react-three/drei"
import { useChess } from "@/lib/chess-context"
import { usePubNubGame } from "@/lib/pubnub-provider"
import type { Square, PieceSymbol, Color } from "chess.js"
import * as THREE from "three"

const SQUARE_SIZE = 1
const BOARD_SIZE = 8

const PIECE_COLORS = {
  w: "#f5f5f5",
  b: "#1a1a1a",
}

const SQUARE_COLORS = {
  light: "#e8d4b8",
  dark: "#b58863",
  selected: "#7cb342",
  validMove: "#aed581",
  lastMove: "#f9e076",
}

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"]
const RANKS = ["1", "2", "3", "4", "5", "6", "7", "8"]

function getSquareFromPosition(col: number, row: number): Square {
  return `${FILES[col]}${RANKS[row]}` as Square
}

function getPositionFromSquare(square: Square): [number, number] {
  const file = square.charCodeAt(0) - 97
  const rank = parseInt(square[1]) - 1
  return [file, rank]
}

function ChessPiece({
  type,
  color,
  position,
  isSelected,
}: {
  type: PieceSymbol
  color: Color
  position: [number, number, number]
  isSelected: boolean
}) {
  const meshRef = useRef<THREE.Group>(null)
  const targetY = useRef(position[1])
  
  const material = useMemo(() => (
    <meshStandardMaterial
      color={PIECE_COLORS[color]}
      metalness={color === "w" ? 0.1 : 0.3}
      roughness={color === "w" ? 0.4 : 0.6}
    />
  ), [color])
  
  useFrame((_, delta) => {
    if (meshRef.current) {
      if (isSelected) {
        targetY.current = 0.8
      } else {
        targetY.current = position[1]
      }
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        targetY.current,
        delta * 10
      )
    }
  })

  const pieceGeometry = useMemo(() => {
    switch (type) {
      case "k":
        return (
          <group>
            <mesh position={[0, 0.2, 0]}>
              <cylinderGeometry args={[0.25, 0.35, 0.4, 16]} />
              {material}
            </mesh>
            <mesh position={[0, 0.55, 0]}>
              <cylinderGeometry args={[0.18, 0.25, 0.5, 16]} />
              {material}
            </mesh>
            <mesh position={[0, 0.9, 0]}>
              <cylinderGeometry args={[0.12, 0.18, 0.3, 16]} />
              {material}
            </mesh>
            <mesh position={[0, 1.15, 0]}>
              <boxGeometry args={[0.08, 0.2, 0.08]} />
              {material}
            </mesh>
            <mesh position={[0, 1.2, 0]}>
              <boxGeometry args={[0.2, 0.08, 0.08]} />
              {material}
            </mesh>
          </group>
        )
      case "q":
        return (
          <group>
            <mesh position={[0, 0.2, 0]}>
              <cylinderGeometry args={[0.25, 0.35, 0.4, 16]} />
              {material}
            </mesh>
            <mesh position={[0, 0.55, 0]}>
              <cylinderGeometry args={[0.18, 0.25, 0.5, 16]} />
              {material}
            </mesh>
            <mesh position={[0, 0.85, 0]}>
              <sphereGeometry args={[0.2, 16, 16]} />
              {material}
            </mesh>
            <mesh position={[0, 1.05, 0]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              {material}
            </mesh>
          </group>
        )
      case "r":
        return (
          <group>
            <mesh position={[0, 0.15, 0]}>
              <cylinderGeometry args={[0.22, 0.3, 0.3, 16]} />
              {material}
            </mesh>
            <mesh position={[0, 0.4, 0]}>
              <cylinderGeometry args={[0.18, 0.22, 0.3, 16]} />
              {material}
            </mesh>
            <mesh position={[0, 0.6, 0]}>
              <cylinderGeometry args={[0.22, 0.18, 0.15, 4]} />
              {material}
            </mesh>
          </group>
        )
      case "b":
        return (
          <group>
            <mesh position={[0, 0.15, 0]}>
              <cylinderGeometry args={[0.2, 0.3, 0.3, 16]} />
              {material}
            </mesh>
            <mesh position={[0, 0.45, 0]}>
              <cylinderGeometry args={[0.08, 0.2, 0.4, 16]} />
              {material}
            </mesh>
            <mesh position={[0, 0.75, 0]}>
              <sphereGeometry args={[0.12, 16, 16]} />
              {material}
            </mesh>
          </group>
        )
      case "n":
        return (
          <group>
            <mesh position={[0, 0.15, 0]}>
              <cylinderGeometry args={[0.2, 0.28, 0.3, 16]} />
              {material}
            </mesh>
            <mesh position={[0, 0.4, 0.05]} rotation={[0.3, 0, 0]}>
              <boxGeometry args={[0.15, 0.4, 0.25]} />
              {material}
            </mesh>
            <mesh position={[0, 0.65, 0.15]} rotation={[0.8, 0, 0]}>
              <boxGeometry args={[0.12, 0.25, 0.15]} />
              {material}
            </mesh>
          </group>
        )
      case "p":
        return (
          <group>
            <mesh position={[0, 0.12, 0]}>
              <cylinderGeometry args={[0.15, 0.22, 0.24, 16]} />
              {material}
            </mesh>
            <mesh position={[0, 0.35, 0]}>
              <sphereGeometry args={[0.15, 16, 16]} />
              {material}
            </mesh>
          </group>
        )
      default:
        return (
          <mesh>
            <sphereGeometry args={[0.3, 16, 16]} />
            {material}
          </mesh>
        )
    }
  }, [type, material])

  return (
    <group ref={meshRef} position={position}>
      <group scale={[0.9, 0.9, 0.9]}>
        {pieceGeometry}
      </group>
    </group>
  )
}

function BoardSquare({
  position,
  color,
  isSelected,
  isValidMove,
  isLastMove,
  onClick,
}: {
  position: [number, number, number]
  color: "light" | "dark"
  isSelected: boolean
  isValidMove: boolean
  isLastMove: boolean
  onClick: () => void
}) {
  const squareColor = isSelected
    ? SQUARE_COLORS.selected
    : isValidMove
    ? SQUARE_COLORS.validMove
    : isLastMove
    ? SQUARE_COLORS.lastMove
    : SQUARE_COLORS[color]

  return (
    <mesh position={position} onClick={onClick} receiveShadow>
      <boxGeometry args={[SQUARE_SIZE, 0.2, SQUARE_SIZE]} />
      <meshStandardMaterial color={squareColor} />
    </mesh>
  )
}

function ChessBoard() {
  const { game, gameState, selectedSquare, validMoves, selectSquare, makeMove, playerColor } = useChess()
  const pubnub = usePubNubGame()

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

  const squares = []
  const pieces = []

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const square = getSquareFromPosition(col, row)
      const isLight = (row + col) % 2 === 1
      const isSelected = selectedSquare === square
      const isValidMove = validMoves.includes(square)
      const isLastMove = lastMove ? (lastMove.from === square || lastMove.to === square) : false

      const x = col * SQUARE_SIZE - (BOARD_SIZE * SQUARE_SIZE) / 2 + SQUARE_SIZE / 2
      const z = row * SQUARE_SIZE - (BOARD_SIZE * SQUARE_SIZE) / 2 + SQUARE_SIZE / 2

      squares.push(
        <BoardSquare
          key={`square-${square}`}
          position={[x, 0, -z]}
          color={isLight ? "light" : "dark"}
          isSelected={isSelected}
          isValidMove={isValidMove}
          isLastMove={isLastMove}
          onClick={() => handleSquareClick(square)}
        />
      )

      const piece = game.get(square)
      if (piece) {
        pieces.push(
          <ChessPiece
            key={`piece-${square}`}
            type={piece.type}
            color={piece.color}
            position={[x, 0.1, -z]}
            isSelected={isSelected}
          />
        )
      }
    }
  }

  return (
    <group rotation={playerColor === "b" ? [0, Math.PI, 0] : [0, 0, 0]}>
      <mesh position={[0, -0.15, 0]} receiveShadow>
        <boxGeometry args={[BOARD_SIZE + 0.4, 0.1, BOARD_SIZE + 0.4]} />
        <meshStandardMaterial color="#4a3728" />
      </mesh>
      {squares}
      {pieces}
    </group>
  )
}

export function ChessScene() {
  return (
    <div className="h-full w-full">
      <Canvas
        camera={{ position: [0, 8, 8], fov: 45 }}
        shadows
        gl={{ antialias: true }}
      >
        <color attach="background" args={["#1a1a2e"]} />
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-5, 5, -5]} intensity={0.5} />
        <ChessBoard />
        <OrbitControls
          enablePan={false}
          minDistance={6}
          maxDistance={15}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.5}
        />
        <Environment preset="studio" />
      </Canvas>
    </div>
  )
}
