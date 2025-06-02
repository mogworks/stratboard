import type { GlowFilterOptions } from 'pixi-filters'
import type { Application, FillInput, Graphics } from 'pixi.js'

import { GlowFilter } from 'pixi-filters'
import { Container, Point, Rectangle, Sprite, Texture } from 'pixi.js'

import type { RangeAreaFilterPreset } from '@/filters/RangeAreaFilter'

import { RangeAreaFilter } from '@/filters/RangeAreaFilter'

import * as G from './graphics'
import { DEFAULT_AOE_RESOLUTION } from './resolutions'
import { YmToPx } from './utils'

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

export class BaseAoE extends Container {
  type: AoEType
  resolution: number

  constructor(type: AoEType, resolution: number) {
    super()

    this.type = type
    this.resolution = resolution
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
}

/**
 * 不使用shader的版本（兼容性强一些）
 */
export class AoE extends BaseAoE {
  declare type: AoEType
  declare resolution: number

  constructor(
    type: AoEType,
    resolution: number,
    fn: (style?: FillInput) => Graphics,
    aoeStyle?: FillInput,
    innerShadowOptions: GlowFilterOptions = {},
    outerGlowOptions: GlowFilterOptions = {},
  ) {
    super(type, resolution)

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

  /**
   * 创建矩形AoE效果
   */
  static createRect(width: number, height: number, options: AoECreateOptions = {}): AoE {
    const { colors = {}, aoeAlpha = 0.25, innerShadowOptions = {}, outerGlowOptions = {}, resolution = DEFAULT_AOE_RESOLUTION } = options

    return new AoE(
      'rect',
      resolution,
      style => G.createRectGraphics(width, height, style, resolution),
      { color: colors.aoe ?? COLORS.aoe, alpha: aoeAlpha },
      { color: colors.innerShadow ?? COLORS.innerShadow, ...innerShadowOptions },
      { color: colors.outerGlow ?? COLORS.outerGlow, ...outerGlowOptions },
    )
  }

  /**
   * 创建射线AoE效果
   */
  static createRay(width: number, length: number, options: AoECreateOptions = {}): AoE {
    const { colors = {}, aoeAlpha = 0.25, innerShadowOptions = {}, outerGlowOptions = {}, resolution = DEFAULT_AOE_RESOLUTION } = options

    return new AoE(
      'ray',
      resolution,
      style => G.createRectGraphics(length, width, style, resolution),
      { color: colors.aoe ?? COLORS.aoe, alpha: aoeAlpha },
      { color: colors.innerShadow ?? COLORS.innerShadow, ...innerShadowOptions },
      { color: colors.outerGlow ?? COLORS.outerGlow, ...outerGlowOptions },
    )
  }

  /**
   * 创建圆形AoE效果
   */
  static createCircle(radius: number, options: AoECreateOptions = {}): AoE {
    const { colors = {}, aoeAlpha = 0.25, innerShadowOptions = {}, outerGlowOptions = {}, resolution = DEFAULT_AOE_RESOLUTION } = options

    return new AoE(
      'circle',
      resolution,
      style => G.createCircleGraphics(radius, style, resolution),
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

    const { colors = {}, aoeAlpha = 0.25, innerShadowOptions = {}, outerGlowOptions = {}, resolution = DEFAULT_AOE_RESOLUTION } = options

    return new AoE(
      'ring',
      resolution,
      style => G.createRingGraphics(innerRadius, outerRadius, style, resolution),
      { color: colors.aoe ?? COLORS.aoe, alpha: aoeAlpha },
      { color: colors.innerShadow ?? COLORS.innerShadow, ...innerShadowOptions },
      { color: colors.outerGlow ?? COLORS.outerGlow, ...outerGlowOptions },
    )
  }

  /**
   * 创建扇形AoE效果
   */
  static createFan(radius: number, angle: number, options: AoECreateOptions = {}): AoE {
    const { colors = {}, aoeAlpha = 0.25, innerShadowOptions = {}, outerGlowOptions = {}, resolution = DEFAULT_AOE_RESOLUTION } = options

    const aoe = new AoE(
      'fan',
      resolution,
      style => G.createFanGraphics(radius, angle, style, resolution),
      { color: colors.aoe ?? COLORS.aoe, alpha: aoeAlpha },
      { color: colors.innerShadow ?? COLORS.innerShadow, ...innerShadowOptions },
      { color: colors.outerGlow ?? COLORS.outerGlow, ...outerGlowOptions },
    )
    return aoe
  }

  private static createInnerShadow(fn: (style?: FillInput) => Graphics, options: GlowFilterOptions = {}, resolution = DEFAULT_AOE_RESOLUTION) {
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

  private static createOuterGlow(fn: (style?: FillInput) => Graphics, options: GlowFilterOptions = {}, resolution = DEFAULT_AOE_RESOLUTION) {
    const c = new Container()
    const g = fn({ color: 'white', alpha: 1 })
    c.addChild(g)
    c.filters = [
      new GlowFilter({
        alpha: options.alpha ?? 0.5,
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

/**
 * 使用shader的版本
 */
export class ShaderAoE extends BaseAoE {
  declare type: AoEType
  declare resolution: number

  constructor(
    type: AoEType,
    resolution: number,
    preset: RangeAreaFilterPreset,
    fn: (style?: FillInput) => Graphics,
  ) {
    super(type, resolution)

    const aoe = fn({ color: '#000000' })
    aoe.label = 'aoe'

    this.addChild(aoe)
    this.filters = [new RangeAreaFilter({ preset })]
  }

  /**
   * 创建矩形AoE效果
   */
  static createRect(width: number, height: number, resolution = DEFAULT_AOE_RESOLUTION, preset: RangeAreaFilterPreset = 'default'): ShaderAoE {
    return new ShaderAoE(
      'rect',
      resolution,
      preset,
      style => G.createRectGraphics(width, height, style, resolution),
    )
  }

  /**
   * 创建射线AoE效果
   */
  static createRay(width: number, length: number, resolution = DEFAULT_AOE_RESOLUTION, preset: RangeAreaFilterPreset = 'default'): ShaderAoE {
    return new ShaderAoE(
      'ray',
      resolution,
      preset,
      style => G.createRectGraphics(length, width, style, resolution),
    )
  }

  /**
   * 创建圆形AoE效果
   */
  static createCircle(radius: number, resolution = DEFAULT_AOE_RESOLUTION, preset: RangeAreaFilterPreset = 'default'): ShaderAoE {
    return new ShaderAoE(
      'circle',
      resolution,
      preset,
      style => G.createCircleGraphics(radius, style, resolution),
    )
  }

  /**
   * 创建环形AoE效果
   */
  static createRing(innerRadius: number, outerRadius: number, resolution = DEFAULT_AOE_RESOLUTION, preset: RangeAreaFilterPreset = 'default'): ShaderAoE {
    if (innerRadius >= outerRadius) {
      throw new Error('内圆半径必须小于外圆半径')
    }

    return new ShaderAoE(
      'ring',
      resolution,
      preset,
      style => G.createRingGraphics(innerRadius, outerRadius, style, resolution),
    )
  }

  /**
   * 创建扇形AoE效果
   */
  static createFan(radius: number, angle: number, resolution = DEFAULT_AOE_RESOLUTION, preset: RangeAreaFilterPreset = 'default'): ShaderAoE {
    return new ShaderAoE(
      'fan',
      resolution,
      preset,
      style => G.createFanGraphics(radius, angle, style, resolution),
    )
  }
}
