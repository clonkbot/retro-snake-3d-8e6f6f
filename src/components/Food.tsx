import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Food } from '../types'

interface FoodItemProps {
  food: Food
}

export function FoodItem({ food }: FoodItemProps) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const glowRef = useRef<THREE.PointLight>(null!)

  useFrame((state) => {
    if (meshRef.current) {
      // Floating animation
      meshRef.current.position.y = food.position[1] + Math.sin(state.clock.elapsedTime * 3 + food.position[0]) * 0.15
      meshRef.current.rotation.y += 0.02
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 2) * 0.1
    }
    if (glowRef.current) {
      glowRef.current.intensity = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.5
    }
  })

  const getAppearance = () => {
    switch (food.type) {
      case 'golden':
        return {
          color: '#ffd700',
          emissive: '#ffa500',
          emissiveIntensity: 0.8,
          geometry: 'sphere' as const,
          scale: 0.4,
          lightColor: '#ffd700',
        }
      case 'rotten':
        return {
          color: '#4a3c28',
          emissive: '#2d2416',
          emissiveIntensity: 0.3,
          geometry: 'sphere' as const,
          scale: 0.35,
          lightColor: '#4a3c28',
        }
      case 'diamond':
        return {
          color: '#00ffff',
          emissive: '#00ccff',
          emissiveIntensity: 1,
          geometry: 'octahedron' as const,
          scale: 0.35,
          lightColor: '#00ffff',
        }
      default:
        return {
          color: '#ff3366',
          emissive: '#ff0044',
          emissiveIntensity: 0.5,
          geometry: 'sphere' as const,
          scale: 0.35,
          lightColor: '#ff3366',
        }
    }
  }

  const appearance = getAppearance()

  return (
    <group position={[food.position[0], food.position[1], food.position[2]]}>
      <mesh ref={meshRef} castShadow>
        {appearance.geometry === 'sphere' && (
          <sphereGeometry args={[appearance.scale, 16, 16]} />
        )}
        {appearance.geometry === 'octahedron' && (
          <octahedronGeometry args={[appearance.scale]} />
        )}
        <meshStandardMaterial
          color={appearance.color}
          emissive={appearance.emissive}
          emissiveIntensity={appearance.emissiveIntensity}
          roughness={0.1}
          metalness={food.type === 'diamond' ? 1 : 0.8}
        />
      </mesh>

      {/* Stem for apples */}
      {(food.type === 'normal' || food.type === 'golden' || food.type === 'rotten') && (
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.03, 0.05, 0.15, 6]} />
          <meshStandardMaterial color={food.type === 'rotten' ? '#1a1408' : '#4a2800'} />
        </mesh>
      )}

      {/* Leaf for normal and golden apples */}
      {(food.type === 'normal' || food.type === 'golden') && (
        <mesh position={[0.1, 0.45, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.15, 0.02, 0.1]} />
          <meshStandardMaterial
            color={food.type === 'golden' ? '#90EE90' : '#228B22'}
            emissive={food.type === 'golden' ? '#90EE90' : '#228B22'}
            emissiveIntensity={0.3}
          />
        </mesh>
      )}

      {/* Glow light */}
      <pointLight
        ref={glowRef}
        color={appearance.lightColor}
        intensity={1}
        distance={food.type === 'diamond' ? 4 : 2}
      />

      {/* Sparkles for golden and diamond */}
      {(food.type === 'golden' || food.type === 'diamond') && (
        <>
          <Sparkle offset={0} color={appearance.color} />
          <Sparkle offset={1} color={appearance.color} />
          <Sparkle offset={2} color={appearance.color} />
        </>
      )}
    </group>
  )
}

function Sparkle({ offset, color }: { offset: number; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime + offset * 2
      meshRef.current.position.x = Math.sin(t * 2) * 0.6
      meshRef.current.position.y = 0.3 + Math.cos(t * 1.5) * 0.4
      meshRef.current.position.z = Math.cos(t * 2) * 0.6
      meshRef.current.scale.setScalar(0.5 + Math.sin(t * 8) * 0.3)
    }
  })

  return (
    <mesh ref={meshRef}>
      <octahedronGeometry args={[0.05]} />
      <meshBasicMaterial color={color} />
    </mesh>
  )
}
