import { Canvas } from '@react-three/fiber'
import { Suspense, useState, useCallback, useEffect } from 'react'
import { GameScene } from './components/GameScene'
import { GameUI } from './components/GameUI'
import { GameState, FoodType } from './types'

function App() {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    highScore: parseInt(localStorage.getItem('snakeHighScore') || '0'),
    combo: 1,
    isPlaying: false,
    isGameOver: false,
    snakeLength: 3,
  })
  const [lastEatenFood, setLastEatenFood] = useState<FoodType | null>(null)

  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      score: 0,
      combo: 1,
      isPlaying: true,
      isGameOver: false,
      snakeLength: 3,
    }))
    setLastEatenFood(null)
  }, [])

  const endGame = useCallback(() => {
    setGameState(prev => {
      const newHighScore = Math.max(prev.score, prev.highScore)
      localStorage.setItem('snakeHighScore', newHighScore.toString())
      return {
        ...prev,
        isPlaying: false,
        isGameOver: true,
        highScore: newHighScore,
      }
    })
  }, [])

  const onFoodEaten = useCallback((foodType: FoodType, points: number) => {
    setLastEatenFood(foodType)
    setGameState(prev => {
      let newCombo = prev.combo
      let newLength = prev.snakeLength

      if (foodType === 'golden') {
        newCombo = Math.min(prev.combo + 1, 10)
        newLength = prev.snakeLength + 1
      } else if (foodType === 'rotten') {
        newCombo = 1
        newLength = Math.max(prev.snakeLength - 1, 1)
      } else if (foodType === 'normal') {
        newLength = prev.snakeLength + 1
      } else if (foodType === 'diamond') {
        newCombo = Math.min(prev.combo + 2, 10)
        newLength = prev.snakeLength + 1
      }

      const actualPoints = Math.floor(points * prev.combo)

      return {
        ...prev,
        score: prev.score + actualPoints,
        combo: newCombo,
        snakeLength: newLength,
      }
    })

    setTimeout(() => setLastEatenFood(null), 500)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !gameState.isPlaying) {
        startGame()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameState.isPlaying, startGame])

  return (
    <div className="w-screen h-screen bg-[#0a0a12] overflow-hidden relative">
      {/* CRT Scanline overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-50"
        style={{
          background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 3px)',
          mixBlendMode: 'multiply',
        }}
      />

      {/* Vignette effect */}
      <div
        className="pointer-events-none absolute inset-0 z-40"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(0,0,0,0.5) 100%)',
        }}
      />

      {/* Game Canvas */}
      <Canvas
        camera={{ position: [0, 12, 8], fov: 50 }}
        shadows
        gl={{ antialias: true }}
        style={{ touchAction: 'none' }}
      >
        <Suspense fallback={null}>
          <GameScene
            gameState={gameState}
            onFoodEaten={onFoodEaten}
            onGameOver={endGame}
          />
        </Suspense>
      </Canvas>

      {/* UI Overlay */}
      <GameUI
        gameState={gameState}
        lastEatenFood={lastEatenFood}
        onStart={startGame}
      />

      {/* Footer */}
      <div className="absolute bottom-2 left-0 right-0 z-30 text-center">
        <p className="text-[10px] md:text-xs text-[#4a4a6a] font-mono tracking-wider">
          Requested by @plantingtoearn · Built by @clonkbot
        </p>
      </div>
    </div>
  )
}

export default App
