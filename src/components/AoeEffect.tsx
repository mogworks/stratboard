import Konva from 'konva'
import React, { useEffect, useRef } from 'react'
import { Group } from 'react-konva'

export const STROKE_WIDTH = Konva.pixelRatio * 2

type ReactKonvaExports = typeof import('react-konva')
type ReactKonvaShapeCtor =
  | ReactKonvaExports['Arc']
  | ReactKonvaExports['Arrow']
  | ReactKonvaExports['Circle']
  | ReactKonvaExports['Ellipse']
  | ReactKonvaExports['Line']
  | ReactKonvaExports['Path']
  | ReactKonvaExports['Rect']
  | ReactKonvaExports['RegularPolygon']
  | ReactKonvaExports['Ring']
  | ReactKonvaExports['Star']
  | ReactKonvaExports['Wedge']
  | ReactKonvaExports['Shape']

type ReactKonvaShapeElement = React.ReactElement<any, ReactKonvaShapeCtor>

interface GlowProps {
  children: ReactKonvaShapeElement
  color: string
  blurRadius: number
  shadowOpacity: number
}

function Glow({
  children,
  color,
  blurRadius,
  shadowOpacity,
}: GlowProps) {
  const groupRef = useRef<Konva.Group>(null)
  const shadowRef = useRef<Konva.Shape>(null)

  useEffect(() => {
    const shadow = shadowRef.current
    if (shadow) {
      shadow.cache()
      shadow.filters([Konva.Filters.Blur])
      shadow.blurRadius(blurRadius * Konva.pixelRatio)
    }

    const group = groupRef.current
    if (group) {
      const rect = group.getClientRect({ skipShadow: false, skipStroke: false })
      const padding = 32 * Konva.pixelRatio
      group.cache({
        x: rect.x - padding,
        y: rect.y - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      })
    }
  }, [children, color, blurRadius, shadowOpacity])

  const base = React.cloneElement(children, {
    fill: color,
    stroke: color,
    strokeWidth: STROKE_WIDTH,
    opacity: 1,
    listening: false,
  })

  const shadow = React.cloneElement(children, {
    ref: (node: Konva.Shape | null) => {
      shadowRef.current = node
    },
    fill: color,
    shadowColor: color,
    shadowBlur: 32,
    shadowOpacity,
    shadowOffset: { x: 0, y: 0 },
    opacity: 1,
    globalCompositeOperation: 'destination-out',
    listening: false,
  })

  return (
    <Group ref={groupRef} listening={false}>
      {base}
      {shadow}
    </Group>
  )
}

function InnerGlow({
  children,
  color = '#ff751f',
  opacity = 1,
}: { children: ReactKonvaShapeElement; color?: string; opacity?: number }) {
  return (
    <Group listening={false} opacity={opacity}>
      <Glow children={children} color={color} blurRadius={16} shadowOpacity={0.1} />
      <Glow children={children} color={color} blurRadius={32} shadowOpacity={0.1} />
    </Group>
  )
}

function OuterGlow({
  children,
  color = '#fffc79',
  opacity = 1,
}: { children: ReactKonvaShapeElement; color?: string; opacity?: number }) {
  return (
    <Group listening={false} opacity={opacity}>
      <Glow children={children} color={color} blurRadius={4} shadowOpacity={1} />
      <Glow children={children} color={color} blurRadius={8} shadowOpacity={1} />
    </Group>
  )
}

export function AoeEffect({
  children,
  draggable = true,
  opacity = 1,
  baseColor = '#fb923c',
  baseOpacity = 0.25,
  innerGlowColor = '#ff751f',
  innerGlowOpacity = 1,
  outerGlowColor = '#fffc79',
  outerGlowOpacity = 1,
}: {
  children: ReactKonvaShapeElement
  draggable?: boolean
  opacity?: number
  baseColor?: string
  baseOpacity?: number
  innerGlowColor?: string
  innerGlowOpacity?: number
  outerGlowColor?: string
  outerGlowOpacity?: number
}) {
  const base = React.cloneElement(children, { fill: baseColor, opacity: baseOpacity })

  return (
    <Group draggable={draggable} opacity={opacity}>
      {base}
      <InnerGlow children={children} color={innerGlowColor} opacity={innerGlowOpacity} />
      <OuterGlow children={children} color={outerGlowColor} opacity={outerGlowOpacity} />
    </Group>
  )
}
