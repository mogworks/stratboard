import { Application, Graphics, type FillInput } from 'pixi.js'

import { GlowFilter, type GlowFilterOptions } from 'pixi-filters'
import { Container } from 'pixi.js'

import { YmToPx } from './utils'

const COLORS = {
  aoe: '#e7a15d',
  innerShadow: '#e09142',
  outerGlow: '#f6c74f',
}

function createInnerShadow(fn: (style: FillInput) => Graphics, options: GlowFilterOptions = {}) {
  const c = new Container()
  const g = fn({ color: 'white', alpha: 1 })
  c.addChild(g)
  c.filters = [
    new GlowFilter({
      color: options.color ?? COLORS.innerShadow,
      distance: options.distance ?? 32,
      innerStrength: options.innerStrength ?? 2,
      outerStrength: options.outerStrength ?? 0,
      quality: options.quality ?? 0.5,
      knockout: options.knockout ?? true,
    }),
  ]
  c.alpha = options.alpha ?? 1
  return c
}

function createOuterGlow(fn: (style: FillInput) => Graphics, options: GlowFilterOptions = {}) {
  const c = new Container()
  const g = fn({ color: 'white', alpha: 1 })
  c.addChild(g)
  c.filters = [
    new GlowFilter({
      color: options.color ?? COLORS.outerGlow,
      distance: options.distance ?? 8,
      innerStrength: options.innerStrength ?? 0,
      outerStrength: options.outerStrength ?? 8,
      quality: options.quality ?? 0.5,
      knockout: options.knockout ?? false,
    }),
  ]
  const mask = fn({ color: 'white', alpha: 1 })
  c.setMask({ mask, inverse: true })
  c.addChild(mask)
  c.alpha = options.alpha ?? 0.4
  return c
}

function createAoE(
  fn: (style: FillInput) => Graphics,
  aoeStyle: FillInput = { color: COLORS.aoe, alpha: 0.25 },
  innerShadowOptions: GlowFilterOptions = {},
  outerGlowOptions: GlowFilterOptions = {}
) {
  const c = new Container()
  const innerShadow = createInnerShadow(fn, innerShadowOptions)
  const outerGlow = createOuterGlow(fn, outerGlowOptions)
  const aoe = fn(aoeStyle)
  c.addChild(innerShadow)
  c.addChild(outerGlow)
  c.addChild(aoe)
  return c
}

function createRingGraphics(innerRadius: number, outerRadius: number, style: FillInput) {
  console.log(style)
  const ring = new Graphics()
  ring.circle(0, 0, outerRadius * YmToPx)
  ring.fill(style)
  ring.circle(0, 0, innerRadius * YmToPx)
  ring.cut()
  return ring
}

function createCircleGraphics(radius: number, style: FillInput) {
  const circle = new Graphics()
  circle.circle(0, 0, radius * YmToPx)
  circle.fill(style)
  return circle
}

function createRectGraphics(width: number, height: number, style: FillInput) {
  const rect = new Graphics()
  rect.rect((-width * YmToPx) / 2, (-height * YmToPx) / 2, width * YmToPx, height * YmToPx)
  rect.fill(style)
  return rect
}

export function createRingAoE(innerRadius: number, outerRadius: number, colors: Partial<typeof COLORS> = COLORS) {
  return createAoE(
    (style) => createRingGraphics(innerRadius, outerRadius, style),
    { color: colors.aoe ?? COLORS.aoe, alpha: 0.25 },
    { color: colors.innerShadow ?? COLORS.innerShadow },
    { color: colors.outerGlow ?? COLORS.outerGlow }
  )
}

export function createCircleAoE(radius: number, colors: Partial<typeof COLORS> = COLORS) {
  return createAoE(
    (style) => createCircleGraphics(radius, style),
    { color: colors.aoe ?? COLORS.aoe, alpha: 0.25 },
    { color: colors.innerShadow ?? COLORS.innerShadow },
    { color: colors.outerGlow ?? COLORS.outerGlow }
  )
}

export function createRectAoE(width: number, height: number, colors: Partial<typeof COLORS> = COLORS) {
  return createAoE(
    (style) => createRectGraphics(width, height, style),
    { color: colors.aoe ?? COLORS.aoe, alpha: 0.25 },
    { color: colors.innerShadow ?? COLORS.innerShadow },
    { color: colors.outerGlow ?? COLORS.outerGlow }
  )
}

export function toTexture(app: Application, c: Container) {
  return app.renderer.extract.texture(c)
}
