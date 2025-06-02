import type { GlowFilterOptions } from 'pixi-filters'
import type { Application, FillInput } from 'pixi.js'

import { GlowFilter } from 'pixi-filters'
import { Container, Graphics, Point, Rectangle, Sprite, Texture } from 'pixi.js'

import { YmToPx } from './utils'

const DEFAULT_RESOLUTION = 2

const COLORS = {
  aoe: '#e7a15d',
  innerShadow: '#ff751f',
  outerGlow: '#fffc79',
} as const

export type AoEColors = typeof COLORS

export interface AoECreateOptions {
  colors?: Partial<AoEColors>
  aoeAlpha?: number
  innerShadowOptions?: Partial<GlowFilterOptions>
  outerGlowOptions?: Partial<GlowFilterOptions>
  resolution?: number
}

export type AoEType = 'rect' | 'ray' | 'circle' | 'ring' | 'fan'

export class AoETexture extends Texture {
  type: AoEType
  resolution: number

  constructor(texture: Texture, type: AoEType, resolution: number) {
    super(texture)
    this.type = type
    this.resolution = resolution
  }

  getCenterPivot() {
    if (this.type === 'ray' || this.type === 'fan') {
      return new Point(YmToPx * this.resolution, this.height / 2)
    } else {
      return new Point(this.width / 2, this.height / 2)
    }
  }
}

export class AoE extends Container {
  type: AoEType
  resolution: number

  constructor(
    type: AoEType,
    resolution: number,
    fn: (style?: FillInput) => Graphics,
    aoeStyle?: FillInput,
    innerShadowOptions: GlowFilterOptions = {},
    outerGlowOptions: GlowFilterOptions = {},
  ) {
    super()

    this.type = type
    this.resolution = resolution

    const innerShadow = AoE.createInnerShadow(fn, innerShadowOptions, resolution)
    const outerGlow = AoE.createOuterGlow(fn, outerGlowOptions, resolution)
    const aoe = fn(aoeStyle)

    innerShadow.label = 'inner_shadow'
    outerGlow.label = 'outer_glow'
    aoe.label = 'aoe'

    this.addChild(innerShadow)
    this.addChild(outerGlow)
    this.addChild(aoe)
  }

  private getComputedRectangle() {
    const bounds = this.getLocalBounds()
    const rect = new Rectangle(
      bounds.x - YmToPx * this.resolution,
      bounds.y - YmToPx * this.resolution,
      bounds.width + YmToPx * this.resolution * 2,
      bounds.height + YmToPx * this.resolution * 2,
    )
    return rect
  }

  /**
   * 将当前AoE容器转换为纹理，以避免父容器添加遮罩时，出现光效残留bug
   */
  toTexture(app: Application) {
    const rectangle = this.getComputedRectangle()
    return new AoETexture(app.renderer.extract.texture({ target: this, frame: rectangle }), this.type, this.resolution)
  }

  /**
   * 将当前AoE容器转换为精灵，理由同上
   */
  toSprite(app: Application) {
    const texture = this.toTexture(app)
    const sprite = Sprite.from(texture)
    const centerPivot = texture.getCenterPivot()
    sprite.pivot.set(centerPivot.x, centerPivot.y)
    sprite.scale.set(1 / this.resolution)
    return sprite
  }

  /**
   * 创建矩形AoE效果
   */
  static createRect(width: number, height: number, options: AoECreateOptions = {}): AoE {
    const { colors = {}, aoeAlpha = 0.25, innerShadowOptions = {}, outerGlowOptions = {}, resolution = DEFAULT_RESOLUTION } = options

    return new AoE(
      'rect',
      resolution,
      style => AoE.createRectGraphics(width, height, style, resolution),
      { color: colors.aoe ?? COLORS.aoe, alpha: aoeAlpha },
      { color: colors.innerShadow ?? COLORS.innerShadow, ...innerShadowOptions },
      { color: colors.outerGlow ?? COLORS.outerGlow, ...outerGlowOptions },
    )
  }

  /**
   * 创建射线AoE效果
   */
  static createRay(width: number, length: number, options: AoECreateOptions = {}): AoE {
    const { colors = {}, aoeAlpha = 0.25, innerShadowOptions = {}, outerGlowOptions = {}, resolution = DEFAULT_RESOLUTION } = options

    return new AoE(
      'ray',
      resolution,
      style => AoE.createRectGraphics(length, width, style, resolution),
      { color: colors.aoe ?? COLORS.aoe, alpha: aoeAlpha },
      { color: colors.innerShadow ?? COLORS.innerShadow, ...innerShadowOptions },
      { color: colors.outerGlow ?? COLORS.outerGlow, ...outerGlowOptions },
    )
  }

  /**
   * 创建圆形AoE效果
   */
  static createCircle(radius: number, options: AoECreateOptions = {}): AoE {
    const { colors = {}, aoeAlpha = 0.25, innerShadowOptions = {}, outerGlowOptions = {}, resolution = DEFAULT_RESOLUTION } = options

    return new AoE(
      'circle',
      resolution,
      style => AoE.createCircleGraphics(radius, style, resolution),
      { color: colors.aoe ?? COLORS.aoe, alpha: aoeAlpha },
      { color: colors.innerShadow ?? COLORS.innerShadow, ...innerShadowOptions },
      { color: colors.outerGlow ?? COLORS.outerGlow, ...outerGlowOptions },
    )
  }

  /**
   * 创建环形AoE效果
   */
  static createRing(innerRadius: number, outerRadius: number, options: AoECreateOptions = {}): AoE {
    if (innerRadius >= outerRadius) {
      throw new Error('内圆半径必须小于外圆半径')
    }

    const { colors = {}, aoeAlpha = 0.25, innerShadowOptions = {}, outerGlowOptions = {}, resolution = DEFAULT_RESOLUTION } = options

    return new AoE(
      'ring',
      resolution,
      style => AoE.createRingGraphics(innerRadius, outerRadius, style, resolution),
      { color: colors.aoe ?? COLORS.aoe, alpha: aoeAlpha },
      { color: colors.innerShadow ?? COLORS.innerShadow, ...innerShadowOptions },
      { color: colors.outerGlow ?? COLORS.outerGlow, ...outerGlowOptions },
    )
  }

  /**
   * 创建扇形AoE效果
   */
  static createFan(radius: number, angle: number, options: AoECreateOptions = {}): AoE {
    const { colors = {}, aoeAlpha = 0.25, innerShadowOptions = {}, outerGlowOptions = {}, resolution = DEFAULT_RESOLUTION } = options

    const aoe = new AoE(
      'fan',
      resolution,
      style => AoE.createFanGraphics(radius, angle, style, resolution),
      { color: colors.aoe ?? COLORS.aoe, alpha: aoeAlpha },
      { color: colors.innerShadow ?? COLORS.innerShadow, ...innerShadowOptions },
      { color: colors.outerGlow ?? COLORS.outerGlow, ...outerGlowOptions },
    )
    return aoe
  }

  private static createRectGraphics(width: number, height: number, style?: FillInput, resolution = DEFAULT_RESOLUTION) {
    const rect = new Graphics()
    rect.rect((-width * YmToPx * resolution) / 2, (-height * YmToPx * resolution) / 2, width * YmToPx * resolution, height * YmToPx * resolution)
    rect.fill(style)
    return rect
  }

  private static createCircleGraphics(radius: number, style?: FillInput, resolution = DEFAULT_RESOLUTION) {
    const circle = new Graphics()
    circle.circle(0, 0, radius * YmToPx * resolution)
    circle.fill(style)
    return circle
  }

  private static createRingGraphics(innerRadius: number, outerRadius: number, style?: FillInput, resolution = DEFAULT_RESOLUTION) {
    const ring = new Graphics()
    ring.circle(0, 0, outerRadius * YmToPx * resolution)
    ring.fill(style)
    ring.circle(0, 0, innerRadius * YmToPx * resolution)
    ring.cut()
    return ring
  }

  private static createFanGraphics(radius: number, angle: number, style?: FillInput, resolution = DEFAULT_RESOLUTION) {
    const fan = new Graphics()
    fan.arc(0, 0, radius * YmToPx * resolution, (-angle * Math.PI) / 360, (angle * Math.PI) / 360)
    fan.lineTo(0, 0)
    fan.closePath()
    fan.fill(style)
    return fan
  }

  private static createInnerShadow(fn: (style?: FillInput) => Graphics, options: GlowFilterOptions = {}, resolution = DEFAULT_RESOLUTION) {
    const c = new Container()
    const g = fn({ color: 'white', alpha: 1 })
    c.addChild(g)
    c.filters = [
      new GlowFilter({
        alpha: options.alpha ?? 0.6,
        color: options.color ?? COLORS.innerShadow,
        distance: (options.distance ?? 36) * resolution,
        innerStrength: options.innerStrength ?? 4,
        outerStrength: options.outerStrength ?? 0,
        quality: options.quality ?? 0.5,
        knockout: options.knockout ?? true,
      }),
    ]
    return c
  }

  private static createOuterGlow(fn: (style?: FillInput) => Graphics, options: GlowFilterOptions = {}, resolution = DEFAULT_RESOLUTION) {
    const c = new Container()
    const g = fn({ color: 'white', alpha: 1 })
    c.addChild(g)
    c.filters = [
      new GlowFilter({
        alpha: options.alpha ?? 0.6,
        color: options.color ?? COLORS.outerGlow,
        distance: (options.distance ?? 8) * resolution,
        innerStrength: options.innerStrength ?? 5,
        outerStrength: options.outerStrength ?? 0,
        quality: options.quality ?? 0.5,
        knockout: options.knockout ?? true,
      }),
    ]
    return c
  }
}
