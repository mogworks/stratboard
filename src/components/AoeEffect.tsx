import Konva from 'konva'
import React, { useEffect, useRef } from 'react'
import { Group } from 'react-konva'

export const STROKE_WIDTH = 4

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
    // 读取当前 Layer 的 pixelRatio（Konva 自动设置），用于缩放模糊半径与缓存边距
    const layer = groupRef.current?.getLayer() ?? shadowRef.current?.getLayer() ?? null
    let pr = 1
    try {
      const canvas = layer?.getCanvas?.()
      const r = canvas?.getPixelRatio?.()
      if (typeof r === 'number' && r > 0) {
        pr = r
      }
    } catch {}

    const shadow = shadowRef.current
    if (shadow) {
      shadow.cache()
      shadow.filters([Konva.Filters.Blur])
      shadow.blurRadius(blurRadius * pr)
    }

    const group = groupRef.current
    if (group) {
      const rect = group.getClientRect({ skipShadow: false, skipStroke: false })
      const padding = 32 * pr
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
}: { children: ReactKonvaShapeElement; color?: string }) {
  return (
    <Group listening={false}>
      <Glow children={children} color={color} blurRadius={16} shadowOpacity={0.1} />
      <Glow children={children} color={color} blurRadius={32} shadowOpacity={0.1} />
    </Group>
  )
}

function OuterGlow({
  children,
  color = '#fffc79',
}: { children: ReactKonvaShapeElement; color?: string }) {
  return (
    <Group listening={false}>
      <Glow children={children} color={color} blurRadius={4} shadowOpacity={1} />
      <Glow children={children} color={color} blurRadius={8} shadowOpacity={1} />
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
      <InnerGlow children={children} color={innerColor} />
      <OuterGlow children={children} color={outerColor} />
    </Group>
  )
}
