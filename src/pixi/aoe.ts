import { Application, Graphics, type FillInput } from 'pixi.js'

import { GlowFilter, type GlowFilterOptions } from 'pixi-filters'
import { Container } from 'pixi.js'

import { YmToPx } from './utils'

const COLORS = {
  aoe: '#e7a15d',
  innerShadow: '#e09142',
  outerGlow: '#f6c74f',
}

export class AoE extends Container {
  constructor(
    fn: (style: FillInput) => Graphics,
    aoeStyle: FillInput = { color: COLORS.aoe, alpha: 0.25 },
    innerShadowOptions: GlowFilterOptions = {},
    outerGlowOptions: GlowFilterOptions = {}
  ) {
    super()

    const innerShadow = AoE.createInnerShadow(fn, innerShadowOptions)
    const outerGlow = AoE.createOuterGlow(fn, outerGlowOptions)
    const aoe = fn(aoeStyle)

    innerShadow.label = 'inner_shadow'
    outerGlow.label = 'outer_glow'
    aoe.label = 'aoe'

    this.addChild(innerShadow)
    this.addChild(outerGlow)
    this.addChild(aoe)
  }

  /**
   * 将当前AoE容器转换为纹理，以避免父容器添加遮罩时，出现光效残留bug
   */
  toTexture(app: Application) {
    return app.renderer.extract.texture(this)
  }

  /**
   * 创建圆形AoE效果
   */
  static createCircle(radius: number, colors: Partial<typeof COLORS> = COLORS): AoE {
    return new AoE(
      (style) => AoE.createCircleGraphics(radius, style),
      { color: colors.aoe ?? COLORS.aoe, alpha: 0.25 },
      { color: colors.innerShadow ?? COLORS.innerShadow },
      { color: colors.outerGlow ?? COLORS.outerGlow }
    )
  }

  /**
   * 创建环形AoE效果
   */
  static createRing(innerRadius: number, outerRadius: number, colors: Partial<typeof COLORS> = COLORS): AoE {
    return new AoE(
      (style) => AoE.createRingGraphics(innerRadius, outerRadius, style),
      { color: colors.aoe ?? COLORS.aoe, alpha: 0.25 },
      { color: colors.innerShadow ?? COLORS.innerShadow },
      { color: colors.outerGlow ?? COLORS.outerGlow }
    )
  }

  /**
   * 创建矩形AoE效果
   */
  static createRect(width: number, height: number, colors: Partial<typeof COLORS> = COLORS): AoE {
    return new AoE(
      (style) => AoE.createRectGraphics(width, height, style),
      { color: colors.aoe ?? COLORS.aoe, alpha: 0.25 },
      { color: colors.innerShadow ?? COLORS.innerShadow },
      { color: colors.outerGlow ?? COLORS.outerGlow }
    )
  }

  private static createCircleGraphics(radius: number, style: FillInput) {
    const circle = new Graphics()
    circle.circle(0, 0, radius * YmToPx)
    circle.fill(style)
    return circle
  }

  private static createRingGraphics(innerRadius: number, outerRadius: number, style: FillInput) {
    const ring = new Graphics()
    ring.circle(0, 0, outerRadius * YmToPx)
    ring.fill(style)
    ring.circle(0, 0, innerRadius * YmToPx)
    ring.cut()
    return ring
  }

  private static createRectGraphics(width: number, height: number, style: FillInput) {
    const rect = new Graphics()
    rect.rect((-width * YmToPx) / 2, (-height * YmToPx) / 2, width * YmToPx, height * YmToPx)
    rect.fill(style)
    return rect
  }

  private static createInnerShadow(fn: (style: FillInput) => Graphics, options: GlowFilterOptions = {}) {
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

  private static createOuterGlow(fn: (style: FillInput) => Graphics, options: GlowFilterOptions = {}) {
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
}
