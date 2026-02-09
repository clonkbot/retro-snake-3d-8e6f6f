import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SnakeSegment } from '../types'

interface SnakeProps {
  segments: SnakeSegment[]
}

function SnakeHead({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const glowRef = useRef<THREE.PointLight>(null!)

  useFrame((state) => {
    if (meshRef.current) {
      // Subtle breathing animation
      const scale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.05
      meshRef.current.scale.setScalar(scale)
    }
    if (glowRef.current) {
      glowRef.current.intensity = 0.8 + Math.sin(state.clock.elapsedTime * 6) * 0.3
    }
  })

  return (
    <group position={position}>
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        <meshStandardMaterial
          color="#00ff88"
          emissive="#00ff88"
          emissiveIntensity={0.5}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
      {/* Eyes */}
      <mesh position={[0.25, 0.15, -0.4]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.25, 0.15, -0.4]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* Pupils */}
      <mesh position={[0.25, 0.15, -0.5]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh position={[-0.25, 0.15, -0.5]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <pointLight ref={glowRef} color="#00ff88" intensity={1} distance={3} />
    </group>
  )
}

function SnakeBody({ position, index }: { position: [number, number, number]; index: number }) {
  const meshRef = useRef<THREE.Mesh>(null!)

  // Gradient color based on index
  const color = useMemo(() => {
    const hue = (120 + index * 5) % 360
    return new THREE.Color().setHSL(hue / 360, 1, 0.5)
  }, [index])

  useFrame((state) => {
    if (meshRef.current) {
      // Wave animation
      const offset = index * 0.3
      const scale = 0.85 + Math.sin(state.clock.elapsedTime * 3 + offset) * 0.05
      meshRef.current.scale.setScalar(scale)
    }
  })

  return (
    <mesh ref={meshRef} position={position} castShadow>
      <boxGeometry args={[0.8, 0.8, 0.8]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.3}
        roughness={0.3}
        metalness={0.6}
      />
    </mesh>
  )
}

export function Snake({ segments }: SnakeProps) {
  return (
    <group>
      {segments.map((segment, index) =>
        index === 0 ? (
          <SnakeHead key={segment.id} position={segment.position} />
        ) : (
          <SnakeBody key={segment.id} position={segment.position} index={index} />
        )
      )}
    </group>
  )
}
