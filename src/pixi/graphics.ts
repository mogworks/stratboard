import type { FillInput } from 'pixi.js'

import { Graphics } from 'pixi.js'

import { DEFAULT_AOE_RESOLUTION } from './resolutions'
import { YmToPx } from './utils'

export function createRectGraphics(width: number, height: number, style?: FillInput, resolution = DEFAULT_AOE_RESOLUTION) {
  const rect = new Graphics()
  rect.rect((-width * YmToPx * resolution) / 2, (-height * YmToPx * resolution) / 2, width * YmToPx * resolution, height * YmToPx * resolution)
  rect.fill(style)
  return rect
}

export function createCircleGraphics(radius: number, style?: FillInput, resolution = DEFAULT_AOE_RESOLUTION) {
  const circle = new Graphics()
  circle.circle(0, 0, radius * YmToPx * resolution)
  circle.fill(style)
  return circle
}

export function createRingGraphics(innerRadius: number, outerRadius: number, style?: FillInput, resolution = DEFAULT_AOE_RESOLUTION) {
  const ring = new Graphics()
  ring.circle(0, 0, outerRadius * YmToPx * resolution)
  ring.fill(style)
  ring.circle(0, 0, innerRadius * YmToPx * resolution)
  ring.cut()
  return ring
}

export function createFanGraphics(radius: number, angle: number, style?: FillInput, resolution = DEFAULT_AOE_RESOLUTION) {
  const fan = new Graphics()
  fan.arc(0, 0, radius * YmToPx * resolution, (-angle * Math.PI) / 360, (angle * Math.PI) / 360)
  fan.lineTo(0, 0)
  fan.closePath()
  fan.fill(style)
  return fan
}
