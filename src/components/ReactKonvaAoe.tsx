import Konva from 'konva'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Group, Layer, Ring, Stage } from 'react-konva'

const STROKE_WIDTH = 4
const PADDING = 64

interface RingProps {
  x: number
  y: number
  innerRadius: number
  outerRadius: number
}

function Glow({ ringProps, color, blurRadius, shadowOpacity = 0.1 }: {
  ringProps: RingProps
  color: string
  blurRadius: number
  shadowOpacity?: number
}) {
  const groupRef = useRef<Konva.Group>(null)
  const shadowRef = useRef<Konva.Ring>(null)

  useEffect(() => {
    const shadow = shadowRef.current
    if (shadow) {
      shadow.cache()
      shadow.filters([Konva.Filters.Blur])
      shadow.blurRadius(blurRadius)
    }

    const group = groupRef.current
    if (group) {
      const rect = group.getClientRect({ skipShadow: false, skipStroke: false })
      group.cache({
        x: rect.x - PADDING,
        y: rect.y - PADDING,
        width: rect.width + PADDING * 2,
        height: rect.height + PADDING * 2,
      })
    }
  }, [blurRadius, ringProps.x, ringProps.y, ringProps.innerRadius, ringProps.outerRadius, color, shadowOpacity])

  return (
    <Group ref={groupRef} listening={false}>
      <Ring
        {...ringProps}
        fill={color}
        stroke={color}
        strokeWidth={STROKE_WIDTH}
        opacity={1}
        listening={false}
      />
      <Ring
        ref={shadowRef}
        {...ringProps}
        fill={color}
        shadowColor={color}
        shadowBlur={32}
        shadowOpacity={shadowOpacity}
        shadowOffset={{ x: 0, y: 0 }}
        opacity={1}
        globalCompositeOperation="destination-out"
        listening={false}
      />
    </Group>
  )
}

function InnerGlow({ ringProps, color = '#ff751f' }: { ringProps: RingProps; color?: string }) {
  return (
    <Group listening={false}>
      <Glow ringProps={ringProps} color={color} blurRadius={32} shadowOpacity={0.1} />
      <Glow ringProps={ringProps} color={color} blurRadius={48} shadowOpacity={0.1} />
    </Group>
  )
}

function OuterGlow({ ringProps, color = '#fffc79' }: { ringProps: RingProps; color?: string }) {
  return (
    <Group listening={false}>
      <Glow ringProps={ringProps} color={color} blurRadius={8} shadowOpacity={1} />
      <Glow ringProps={ringProps} color={color} blurRadius={16} shadowOpacity={1} />
    </Group>
  )
}

function Aoe({ x, y, innerRadius, outerRadius }: { x: number; y: number; innerRadius: number; outerRadius: number }) {
  const ringProps = useMemo<RingProps>(() => ({
    x,
    y,
    innerRadius: innerRadius + STROKE_WIDTH / 2,
    outerRadius: outerRadius - STROKE_WIDTH / 2,
  }), [x, y, innerRadius, outerRadius])

  return (
    <Group draggable>
      <Ring
        {...ringProps}
        fill="#fb923c"
        opacity={0.25}
      />
      <InnerGlow ringProps={ringProps} />
      <OuterGlow ringProps={ringProps} />
    </Group>
  )
}

export default function ReactKonvaAoeDemo() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateSize = () => {
      if (typeof window !== 'undefined') {
        setSize({ width: window.innerWidth, height: window.innerHeight })
      } else {
        const el = containerRef.current
        if (el) {
          setSize({ width: el.clientWidth, height: el.clientHeight })
        }
      }
    }
    updateSize()
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateSize)
      return () => window.removeEventListener('resize', updateSize)
    }
    return () => {}
  }, [])

  return (
    <Stage width={size.width} height={size.height}>
      <Layer>
        <Aoe x={size.width / 2} y={size.height / 2} innerRadius={120} outerRadius={200} />
        <Aoe x={size.width / 2 + 110} y={size.height / 2 + 70} innerRadius={80} outerRadius={160} />
      </Layer>
    </Stage>
  )
}
