import type { ShapeConfig } from 'konva/lib/Shape'

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

type ReactKonvaShapeElement = React.ReactElement<ShapeConfig, ReactKonvaShapeCtor>

interface GlowProps {
  children: ReactKonvaShapeElement
  color: string
  blurRadius: number
  shadowOpacity: number
}

function Glow({ children, color, blurRadius, shadowOpacity }: GlowProps) {
  const groupRef = useRef<Konva.Group>(null)

  useEffect(() => {
    const group = groupRef.current
    if (!group) {
      return
    }

    // 对阴影形状应用高斯模糊，并缓存其位图。
    const childrenNodes = group.getChildren()
    const shadow = childrenNodes[1] as Konva.Shape | undefined
    if (shadow) {
      shadow.cache()
      shadow.filters([Konva.Filters.Blur])
      shadow.blurRadius(blurRadius * Konva.pixelRatio)
    }

    // 使用局部坐标设置 Group 的缓存区域：
    // getClientRect 返回的是舞台绝对坐标，需要减去 Group 的绝对位置换算成本地坐标。
    const rect = group.getClientRect({ skipShadow: false, skipStroke: false })
    const pos = group.getAbsolutePosition()

    group.cache({
      x: rect.x - pos.x,
      y: rect.y - pos.y,
      width: rect.width,
      height: rect.height,
    })
  }, [children, color, blurRadius, shadowOpacity])

  const base = React.cloneElement(children, {
    fill: color,
    stroke: color,
    strokeWidth: STROKE_WIDTH,
    opacity: 1,
    listening: false,
  })

  const shadow = React.cloneElement(children, {
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
}: {
  children: ReactKonvaShapeElement
  color?: string
  opacity?: number
}) {
  return (
    <Group listening={false} opacity={opacity}>
      <Glow color={color} blurRadius={16} shadowOpacity={0.1}>
        {children}
      </Glow>
      <Glow color={color} blurRadius={32} shadowOpacity={0.1}>
        {children}
      </Glow>
    </Group>
  )
}

function OuterGlow({
  children,
  color = '#fffc79',
  opacity = 1,
}: {
  children: ReactKonvaShapeElement
  color?: string
  opacity?: number
}) {
  return (
    <Group listening={false} opacity={opacity}>
      <Glow color={color} blurRadius={4} shadowOpacity={1}>
        {children}
      </Glow>
      <Glow color={color} blurRadius={8} shadowOpacity={1}>
        {children}
      </Glow>
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
      <InnerGlow color={innerGlowColor} opacity={innerGlowOpacity}>
        {children}
      </InnerGlow>
      <OuterGlow color={outerGlowColor} opacity={outerGlowOpacity}>
        {children}
      </OuterGlow>
    </Group>
  )
}
