import Konva from 'konva'
import React, { useEffect, useRef } from 'react'
import { Group } from 'react-konva'

export const STROKE_WIDTH = 4

const PADDING = 64

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

interface GlowSlotProps {
  children: ReactKonvaShapeElement
  color: string
  blurRadius: number
  shadowOpacity: number
}

function GlowSlot({
  children,
  color,
  blurRadius,
  shadowOpacity,
}: GlowSlotProps) {
  const groupRef = useRef<Konva.Group>(null)
  const shadowRef = useRef<Konva.Shape>(null)

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
  }, [blurRadius, color, shadowOpacity, children])

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

function InnerGlowSlot({
  children,
  color = '#ff751f',
}: { children: ReactKonvaShapeElement; color?: string }) {
  return (
    <Group listening={false}>
      <GlowSlot children={children} color={color} blurRadius={32} shadowOpacity={0.1} />
      <GlowSlot children={children} color={color} blurRadius={64} shadowOpacity={0.1} />
    </Group>
  )
}

function OuterGlowSlot({
  children,
  color = '#fffc79',
}: { children: ReactKonvaShapeElement; color?: string }) {
  return (
    <Group listening={false}>
      <GlowSlot children={children} color={color} blurRadius={8} shadowOpacity={1} />
      <GlowSlot children={children} color={color} blurRadius={16} shadowOpacity={1} />
    </Group>
  )
}

export function AoeEffect({
  children,
  draggable = true,
  color = '#fb923c',
  opacity = 0.25,
  innerColor = '#ff751f',
  outerColor = '#fffc79',
}: {
  children: ReactKonvaShapeElement
  draggable?: boolean
  color?: string
  opacity?: number
  innerColor?: string
  outerColor?: string
}) {
  const base = React.cloneElement(children, { fill: color, opacity })

  return (
    <Group draggable={draggable}>
      {base}
      <InnerGlowSlot children={children} color={innerColor} />
      <OuterGlowSlot children={children} color={outerColor} />
    </Group>
  )
}
