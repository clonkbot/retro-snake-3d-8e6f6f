import { useRef, useState, useEffect, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { GameState, Food, SnakeSegment, Direction, FoodType } from '../types'
import { Snake } from './Snake'
import { FoodItem } from './Food'
import { GameBoard } from './GameBoard'

const GRID_SIZE = 10
const CELL_SIZE = 1
const INITIAL_SPEED = 0.2
const MIN_SPEED = 0.08

interface GameSceneProps {
  gameState: GameState
  onFoodEaten: (type: FoodType, points: number) => void
  onGameOver: () => void
}

function getRandomPosition(): [number, number, number] {
  const x = Math.floor(Math.random() * (GRID_SIZE * 2)) - GRID_SIZE
  const z = Math.floor(Math.random() * (GRID_SIZE * 2)) - GRID_SIZE
  return [x * CELL_SIZE, 0.5, z * CELL_SIZE]
}

function getRandomFoodType(): { type: FoodType; points: number } {
  const rand = Math.random()
  if (rand < 0.5) return { type: 'normal', points: 10 }
  if (rand < 0.75) return { type: 'golden', points: 25 }
  if (rand < 0.9) return { type: 'rotten', points: -5 }
  return { type: 'diamond', points: 50 }
}

function spawnFood(existingFood: Food[], snakeSegments: SnakeSegment[]): Food {
  let position: [number, number, number]
  let attempts = 0

  do {
    position = getRandomPosition()
    attempts++
  } while (
    attempts < 100 &&
    (existingFood.some(f =>
      Math.abs(f.position[0] - position[0]) < 0.5 &&
      Math.abs(f.position[2] - position[2]) < 0.5
    ) ||
      snakeSegments.some(s =>
        Math.abs(s.position[0] - position[0]) < 0.5 &&
        Math.abs(s.position[2] - position[2]) < 0.5
      ))
  )

  const { type, points } = getRandomFoodType()
  return {
    id: Math.random().toString(36).substr(2, 9),
    position,
    type,
    points,
  }
}

export function GameScene({ gameState, onFoodEaten, onGameOver }: GameSceneProps) {
  const [snake, setSnake] = useState<SnakeSegment[]>([])
  const [foods, setFoods] = useState<Food[]>([])
  const [direction, setDirection] = useState<Direction>('right')
  const directionRef = useRef<Direction>('right')
  const lastMoveTime = useRef(0)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  // Initialize game
  useEffect(() => {
    if (gameState.isPlaying) {
      const initialSnake: SnakeSegment[] = [
        { position: [0, 0.5, 0], id: '0' },
        { position: [-1, 0.5, 0], id: '1' },
        { position: [-2, 0.5, 0], id: '2' },
      ]
      setSnake(initialSnake)
      setDirection('right')
      directionRef.current = 'right'

      // Spawn initial foods
      const initialFoods: Food[] = []
      for (let i = 0; i < 5; i++) {
        initialFoods.push(spawnFood(initialFoods, initialSnake))
      }
      setFoods(initialFoods)
      lastMoveTime.current = 0
    }
  }, [gameState.isPlaying])

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameState.isPlaying) return

      const currentDir = directionRef.current
      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          if (currentDir !== 'down') {
            setDirection('up')
            directionRef.current = 'up'
          }
          break
        case 'ArrowDown':
        case 'KeyS':
          if (currentDir !== 'up') {
            setDirection('down')
            directionRef.current = 'down'
          }
          break
        case 'ArrowLeft':
        case 'KeyA':
          if (currentDir !== 'right') {
            setDirection('left')
            directionRef.current = 'left'
          }
          break
        case 'ArrowRight':
        case 'KeyD':
          if (currentDir !== 'left') {
            setDirection('right')
            directionRef.current = 'right'
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameState.isPlaying])

  // Handle touch input
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (!gameState.isPlaying) return
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!gameState.isPlaying || !touchStartRef.current) return

      const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x
      const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y
      const minSwipe = 30

      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipe) {
        // Horizontal swipe
        if (deltaX > 0 && directionRef.current !== 'left') {
          setDirection('right')
          directionRef.current = 'right'
        } else if (deltaX < 0 && directionRef.current !== 'right') {
          setDirection('left')
          directionRef.current = 'left'
        }
      } else if (Math.abs(deltaY) > minSwipe) {
        // Vertical swipe
        if (deltaY > 0 && directionRef.current !== 'up') {
          setDirection('down')
          directionRef.current = 'down'
        } else if (deltaY < 0 && directionRef.current !== 'down') {
          setDirection('up')
          directionRef.current = 'up'
        }
      }

      touchStartRef.current = null
    }

    window.addEventListener('touchstart', handleTouchStart)
    window.addEventListener('touchend', handleTouchEnd)
    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [gameState.isPlaying])

  // Game loop
  useFrame((state) => {
    if (!gameState.isPlaying || snake.length === 0) return

    const currentTime = state.clock.getElapsedTime()
    const speed = Math.max(MIN_SPEED, INITIAL_SPEED - (gameState.snakeLength - 3) * 0.005)

    if (currentTime - lastMoveTime.current < speed) return
    lastMoveTime.current = currentTime

    // Calculate new head position
    const head = snake[0]
    let newHeadPos: [number, number, number] = [...head.position]

    switch (direction) {
      case 'up':
        newHeadPos[2] -= CELL_SIZE
        break
      case 'down':
        newHeadPos[2] += CELL_SIZE
        break
      case 'left':
        newHeadPos[0] -= CELL_SIZE
        break
      case 'right':
        newHeadPos[0] += CELL_SIZE
        break
    }

    // Check wall collision
    if (
      Math.abs(newHeadPos[0]) > GRID_SIZE ||
      Math.abs(newHeadPos[2]) > GRID_SIZE
    ) {
      onGameOver()
      return
    }

    // Check self collision
    for (let i = 1; i < snake.length; i++) {
      if (
        Math.abs(snake[i].position[0] - newHeadPos[0]) < 0.5 &&
        Math.abs(snake[i].position[2] - newHeadPos[2]) < 0.5
      ) {
        onGameOver()
        return
      }
    }

    // Check food collision
    let grow = false
    let shrink = false
    const newFoods = foods.filter(food => {
      if (
        Math.abs(food.position[0] - newHeadPos[0]) < 0.8 &&
        Math.abs(food.position[2] - newHeadPos[2]) < 0.8
      ) {
        onFoodEaten(food.type, food.points)
        if (food.type === 'golden' || food.type === 'normal' || food.type === 'diamond') {
          grow = true
        } else if (food.type === 'rotten') {
          shrink = true
        }
        return false
      }
      return true
    })

    // Respawn eaten food
    while (newFoods.length < 5) {
      newFoods.push(spawnFood(newFoods, snake))
    }
    setFoods(newFoods)

    // Update snake
    const newSnake: SnakeSegment[] = [
      { position: newHeadPos, id: Math.random().toString(36).substr(2, 9) },
      ...snake,
    ]

    if (shrink && newSnake.length > 2) {
      newSnake.pop()
      newSnake.pop()
    } else if (!grow) {
      newSnake.pop()
    }

    setSnake(newSnake)
  })

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 15, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#ff00ff" />
      <pointLight position={[-5, 3, -5]} intensity={0.3} color="#00ffff" />
      <pointLight position={[5, 3, 5]} intensity={0.3} color="#ffff00" />

      {/* Background */}
      <Stars radius={50} depth={50} count={2000} factor={3} saturation={0.5} />

      {/* Game Board */}
      <GameBoard size={GRID_SIZE} />

      {/* Snake */}
      {snake.length > 0 && <Snake segments={snake} />}

      {/* Food Items */}
      {foods.map(food => (
        <FoodItem key={food.id} food={food} />
      ))}

      {/* Camera Controls - limited for top-down view */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={10}
        maxDistance={25}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 3}
      />
    </>
  )
}
