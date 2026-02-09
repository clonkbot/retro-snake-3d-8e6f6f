export type FoodType = 'normal' | 'golden' | 'rotten' | 'diamond'

export interface GameState {
  score: number
  highScore: number
  combo: number
  isPlaying: boolean
  isGameOver: boolean
  snakeLength: number
}

export interface Food {
  id: string
  position: [number, number, number]
  type: FoodType
  points: number
}

export interface SnakeSegment {
  position: [number, number, number]
  id: string
}

export type Direction = 'up' | 'down' | 'left' | 'right'
