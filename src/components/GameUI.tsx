import { useEffect, useState } from 'react'
import { GameState, FoodType } from '../types'

interface GameUIProps {
  gameState: GameState
  lastEatenFood: FoodType | null
  onStart: () => void
}

export function GameUI({ gameState, lastEatenFood, onStart }: GameUIProps) {
  const [showComboAnim, setShowComboAnim] = useState(false)
  const [displayCombo, setDisplayCombo] = useState(1)

  useEffect(() => {
    if (lastEatenFood === 'golden' || lastEatenFood === 'diamond') {
      setShowComboAnim(true)
      setDisplayCombo(gameState.combo)
      setTimeout(() => setShowComboAnim(false), 500)
    } else if (lastEatenFood === 'rotten') {
      setDisplayCombo(1)
    }
  }, [lastEatenFood, gameState.combo])

  const getFoodMessage = () => {
    switch (lastEatenFood) {
      case 'golden':
        return { text: 'GOLDEN!', color: 'text-yellow-400' }
      case 'diamond':
        return { text: 'DIAMOND!', color: 'text-cyan-400' }
      case 'rotten':
        return { text: 'ROTTEN!', color: 'text-amber-800' }
      default:
        return null
    }
  }

  const foodMessage = getFoodMessage()

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {/* Top HUD */}
      <div className="absolute top-0 left-0 right-0 p-3 md:p-6">
        <div className="flex justify-between items-start max-w-4xl mx-auto">
          {/* Score */}
          <div className="text-left">
            <div className="text-[10px] md:text-xs font-bold tracking-[0.3em] text-fuchsia-400 mb-1 uppercase">
              Score
            </div>
            <div
              className="text-2xl md:text-5xl font-black text-white"
              style={{
                textShadow: '0 0 10px #ff00ff, 0 0 20px #ff00ff, 0 0 40px #ff00ff',
                fontFamily: "'Press Start 2P', monospace",
              }}
            >
              {gameState.score.toString().padStart(6, '0')}
            </div>
          </div>

          {/* Combo */}
          <div className="text-center">
            <div className="text-[10px] md:text-xs font-bold tracking-[0.3em] text-cyan-400 mb-1 uppercase">
              Combo
            </div>
            <div
              className={`text-2xl md:text-5xl font-black transition-all duration-200 ${
                showComboAnim ? 'scale-150 text-yellow-300' : 'text-white'
              }`}
              style={{
                textShadow: showComboAnim
                  ? '0 0 20px #ffd700, 0 0 40px #ffd700, 0 0 60px #ffd700'
                  : '0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 40px #00ffff',
                fontFamily: "'Press Start 2P', monospace",
              }}
            >
              x{displayCombo}
            </div>
          </div>

          {/* High Score */}
          <div className="text-right">
            <div className="text-[10px] md:text-xs font-bold tracking-[0.3em] text-yellow-400 mb-1 uppercase">
              High Score
            </div>
            <div
              className="text-2xl md:text-5xl font-black text-white"
              style={{
                textShadow: '0 0 10px #ffd700, 0 0 20px #ffd700, 0 0 40px #ffd700',
                fontFamily: "'Press Start 2P', monospace",
              }}
            >
              {gameState.highScore.toString().padStart(6, '0')}
            </div>
          </div>
        </div>
      </div>

      {/* Food eaten popup */}
      {foodMessage && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce">
          <div
            className={`text-3xl md:text-6xl font-black ${foodMessage.color}`}
            style={{
              textShadow: '0 0 20px currentColor, 0 0 40px currentColor',
              fontFamily: "'Press Start 2P', monospace",
              animation: 'pulse 0.3s ease-in-out',
            }}
          >
            {foodMessage.text}
          </div>
        </div>
      )}

      {/* Start Screen */}
      {!gameState.isPlaying && !gameState.isGameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 pointer-events-auto">
          <div className="text-center p-4 md:p-8">
            <h1
              className="text-4xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-yellow-400 mb-4 md:mb-8"
              style={{
                fontFamily: "'Press Start 2P', monospace",
                textShadow: '0 0 30px #ff00ff',
                WebkitTextStroke: '2px rgba(255,255,255,0.1)',
              }}
            >
              SNAKE
            </h1>
            <h2
              className="text-lg md:text-2xl text-fuchsia-400 mb-6 md:mb-12"
              style={{
                fontFamily: "'Press Start 2P', monospace",
                textShadow: '0 0 15px #ff00ff',
              }}
            >
              3D EDITION
            </h2>

            {/* Food Legend */}
            <div className="mb-6 md:mb-10 grid grid-cols-2 gap-2 md:gap-4 max-w-sm mx-auto text-left">
              <div className="flex items-center gap-2">
                <span className="text-lg md:text-2xl">🍎</span>
                <span className="text-[10px] md:text-xs text-white" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                  +10 pts
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg md:text-2xl">🌟</span>
                <span className="text-[10px] md:text-xs text-yellow-400" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                  +25 & combo
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg md:text-2xl">💎</span>
                <span className="text-[10px] md:text-xs text-cyan-400" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                  +50 & x2 combo
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg md:text-2xl">🤢</span>
                <span className="text-[10px] md:text-xs text-amber-700" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                  shrink & reset
                </span>
              </div>
            </div>

            <button
              onClick={onStart}
              className="px-6 md:px-10 py-3 md:py-4 bg-gradient-to-r from-fuchsia-600 to-cyan-500 text-white text-sm md:text-xl font-bold rounded-lg
                         hover:from-fuchsia-500 hover:to-cyan-400 transition-all duration-300
                         hover:scale-110 hover:shadow-[0_0_30px_#ff00ff] active:scale-95"
              style={{
                fontFamily: "'Press Start 2P', monospace",
              }}
            >
              START
            </button>

            <p
              className="mt-4 md:mt-6 text-[8px] md:text-[10px] text-fuchsia-300/70"
              style={{ fontFamily: "'Press Start 2P', monospace" }}
            >
              SWIPE or ARROW KEYS to move
            </p>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState.isGameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 pointer-events-auto">
          <div className="text-center p-4 md:p-8">
            <h1
              className="text-4xl md:text-6xl font-black text-red-500 mb-4 md:mb-6 animate-pulse"
              style={{
                fontFamily: "'Press Start 2P', monospace",
                textShadow: '0 0 20px #ff0000, 0 0 40px #ff0000',
              }}
            >
              GAME OVER
            </h1>

            <div className="mb-6 md:mb-8">
              <div
                className="text-[10px] md:text-sm text-fuchsia-400 mb-2"
                style={{ fontFamily: "'Press Start 2P', monospace" }}
              >
                FINAL SCORE
              </div>
              <div
                className="text-3xl md:text-5xl font-black text-white"
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  textShadow: '0 0 15px #ff00ff, 0 0 30px #ff00ff',
                }}
              >
                {gameState.score.toString().padStart(6, '0')}
              </div>
              {gameState.score >= gameState.highScore && gameState.score > 0 && (
                <div
                  className="text-yellow-400 text-sm md:text-lg mt-2 md:mt-4 animate-bounce"
                  style={{
                    fontFamily: "'Press Start 2P', monospace",
                    textShadow: '0 0 10px #ffd700',
                  }}
                >
                  NEW HIGH SCORE!
                </div>
              )}
            </div>

            <button
              onClick={onStart}
              className="px-6 md:px-10 py-3 md:py-4 bg-gradient-to-r from-fuchsia-600 to-cyan-500 text-white text-sm md:text-xl font-bold rounded-lg
                         hover:from-fuchsia-500 hover:to-cyan-400 transition-all duration-300
                         hover:scale-110 hover:shadow-[0_0_30px_#ff00ff] active:scale-95"
              style={{
                fontFamily: "'Press Start 2P', monospace",
              }}
            >
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}

      {/* Mobile Controls Hint */}
      {gameState.isPlaying && (
        <div className="absolute bottom-16 left-0 right-0 text-center md:hidden">
          <p
            className="text-[8px] text-fuchsia-400/50"
            style={{ fontFamily: "'Press Start 2P', monospace" }}
          >
            SWIPE TO MOVE
          </p>
        </div>
      )}
    </div>
  )
}
