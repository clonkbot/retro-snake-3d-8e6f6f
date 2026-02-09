import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface GameBoardProps {
  size: number
}

export function GameBoard({ size }: GameBoardProps) {
  const gridRef = useRef<THREE.Group>(null!)

  // Generate grid lines
  const gridLines = useMemo(() => {
    const lines: JSX.Element[] = []
    const halfSize = size

    // Create grid pattern
    for (let i = -halfSize; i <= halfSize; i++) {
      const isBorder = i === -halfSize || i === halfSize
      const color = isBorder ? '#ff00ff' : '#1a1a3a'
      const intensity = isBorder ? 1 : 0.3

      // X-axis lines
      lines.push(
        <mesh key={`x-${i}`} position={[i, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.02, halfSize * 2]} />
          <meshBasicMaterial color={color} transparent opacity={intensity} />
        </mesh>
      )

      // Z-axis lines
      lines.push(
        <mesh key={`z-${i}`} position={[0, 0.01, i]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
          <planeGeometry args={[0.02, halfSize * 2]} />
          <meshBasicMaterial color={color} transparent opacity={intensity} />
        </mesh>
      )
    }

    return lines
  }, [size])

  // Animated corner posts
  const cornerPosts = useMemo(() => {
    const posts: JSX.Element[] = []
    const positions: [number, number, number][] = [
      [-size, 0.5, -size],
      [-size, 0.5, size],
      [size, 0.5, -size],
      [size, 0.5, size],
    ]

    positions.forEach((pos, i) => {
      posts.push(<CornerPost key={i} position={pos} index={i} />)
    })

    return posts
  }, [size])

  return (
    <group ref={gridRef}>
      {/* Base plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[size * 2 + 2, size * 2 + 2]} />
        <meshStandardMaterial
          color="#0a0a15"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Inner play area */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[size * 2, size * 2]} />
        <meshStandardMaterial
          color="#12122a"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Grid lines */}
      {gridLines}

      {/* Border walls with glow */}
      <BorderWall position={[0, 0.25, -size - 0.1]} rotation={[0, 0, 0]} width={size * 2 + 0.2} />
      <BorderWall position={[0, 0.25, size + 0.1]} rotation={[0, 0, 0]} width={size * 2 + 0.2} />
      <BorderWall position={[-size - 0.1, 0.25, 0]} rotation={[0, Math.PI / 2, 0]} width={size * 2 + 0.2} />
      <BorderWall position={[size + 0.1, 0.25, 0]} rotation={[0, Math.PI / 2, 0]} width={size * 2 + 0.2} />

      {/* Corner posts */}
      {cornerPosts}
    </group>
  )
}

function BorderWall({ position, rotation, width }: { position: [number, number, number]; rotation: [number, number, number]; width: number }) {
  const meshRef = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.15
    }
  })

  return (
    <mesh ref={meshRef} position={position} rotation={rotation}>
      <boxGeometry args={[width, 0.5, 0.1]} />
      <meshStandardMaterial
        color="#ff00ff"
        emissive="#ff00ff"
        emissiveIntensity={0.3}
        roughness={0.2}
        metalness={0.9}
      />
    </mesh>
  )
}

function CornerPost({ position, index }: { position: [number, number, number]; index: number }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const lightRef = useRef<THREE.PointLight>(null!)

  const colors = ['#ff00ff', '#00ffff', '#ffff00', '#00ff88']

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 2
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3 + index) * 0.1
      meshRef.current.scale.setScalar(scale)
    }
    if (lightRef.current) {
      lightRef.current.intensity = 1 + Math.sin(state.clock.elapsedTime * 4 + index) * 0.5
    }
  })

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.3]} />
        <meshStandardMaterial
          color={colors[index]}
          emissive={colors[index]}
          emissiveIntensity={0.5}
          roughness={0.1}
          metalness={1}
        />
      </mesh>
      <pointLight ref={lightRef} color={colors[index]} intensity={1} distance={4} />
    </group>
  )
}
