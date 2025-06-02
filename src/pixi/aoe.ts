import type { GlowFilterOptions } from 'pixi-filters'
import type { Application, FillInput, Graphics } from 'pixi.js'

import { GlowFilter } from 'pixi-filters'
import { Container, Point, Rectangle, Sprite, Texture } from 'pixi.js'

import type { RangeAreaFilterPreset } from '@/filters/RangeAreaFilter'

import { RangeAreaFilter } from '@/filters/RangeAreaFilter'

import * as G from './graphics'
import { DEFAULT_AOE_RESOLUTION } from './resolutions'
import { YmToPx } from './utils'

export const AOE_COLORS = {
  default: {
    aoe: '#fb923c',
    innerShadow: '#ff751f',
    outerGlow: '#fffc79',
  },
  // 以下颜色来自 https://tailwindcss.com/docs/colors，aoe取400，innerShadow取700，outerGlow取300
  tailwind: {
    red: {
      aoe: '#f87171',
      innerShadow: '#b91c1c',
      outerGlow: '#fca5a5',
    },
    orange: {
      aoe: '#fb923c',
      innerShadow: '#c2410c',
      outerGlow: '#fdba74',
    },
    amber: {
      aoe: '#fbbf24',
      innerShadow: '#b45309',
      outerGlow: '#fcd34d',
    },
    yellow: {
      aoe: '#facc15',
      innerShadow: '#a16207',
      outerGlow: '#fde047',
    },
    lime: {
      aoe: '#a3e635',
      innerShadow: '#4d7c0f',
      outerGlow: '#bef264',
    },
    green: {
      aoe: '#4ade80',
      innerShadow: '#15803d',
      outerGlow: '#86efac',
    },
    emerald: {
      aoe: '#34d399',
      innerShadow: '#047857',
      outerGlow: '#6ee7b7',
    },
    teal: {
      aoe: '#2dd4bf',
      innerShadow: '#0f766e',
      outerGlow: '#5eead4',
    },
    cyan: {
      aoe: '#22d3ee',
      innerShadow: '#0e7490',
      outerGlow: '#67e8f9',
    },
    sky: {
      aoe: '#3b82f6',
      innerShadow: '#0369a1',
      outerGlow: '#7dd3fc',
    },
    blue: {
      aoe: '#60a5fa',
      innerShadow: '#1d4ed8',
      outerGlow: '#93c5fd',
    },
    indigo: {
      aoe: '#818cf8',
      innerShadow: '#4338ca',
      outerGlow: '#a5b4fc',
    },
    violet: {
      aoe: '#a78bfa',
      innerShadow: '#6d28d9',
      outerGlow: '#c4b5fd',
    },
    purple: {
      aoe: '#c084fc',
      innerShadow: '#7e22ce',
      outerGlow: '#d8b4fe',
    },
    fuchsia: {
      aoe: '#e879f9',
      innerShadow: '#a21caf',
      outerGlow: '#f0abfc',
    },
    pink: {
      aoe: '#f472b6',
      innerShadow: '#be185d',
      outerGlow: '#f9a8d4',
    },
    rose: {
      aoe: '#fb7185',
      innerShadow: '#be123c',
      outerGlow: '#fda4af',
    },
  },
}

export type AoEColors = typeof AOE_COLORS.default

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
      { color: colors.aoe ?? AOE_COLORS.default.aoe, alpha: aoeAlpha },
      { color: colors.innerShadow ?? AOE_COLORS.default.innerShadow, ...innerShadowOptions },
      { color: colors.outerGlow ?? AOE_COLORS.default.outerGlow, ...outerGlowOptions },
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
      { color: colors.aoe ?? AOE_COLORS.default.aoe, alpha: aoeAlpha },
      { color: colors.innerShadow ?? AOE_COLORS.default.innerShadow, ...innerShadowOptions },
      { color: colors.outerGlow ?? AOE_COLORS.default.outerGlow, ...outerGlowOptions },
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
      { color: colors.aoe ?? AOE_COLORS.default.aoe, alpha: aoeAlpha },
      { color: colors.innerShadow ?? AOE_COLORS.default.innerShadow, ...innerShadowOptions },
      { color: colors.outerGlow ?? AOE_COLORS.default.outerGlow, ...outerGlowOptions },
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
      { color: colors.aoe ?? AOE_COLORS.default.aoe, alpha: aoeAlpha },
      { color: colors.innerShadow ?? AOE_COLORS.default.innerShadow, ...innerShadowOptions },
      { color: colors.outerGlow ?? AOE_COLORS.default.outerGlow, ...outerGlowOptions },
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
      { color: colors.aoe ?? AOE_COLORS.default.aoe, alpha: aoeAlpha },
      { color: colors.innerShadow ?? AOE_COLORS.default.innerShadow, ...innerShadowOptions },
      { color: colors.outerGlow ?? AOE_COLORS.default.outerGlow, ...outerGlowOptions },
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
        color: options.color ?? AOE_COLORS.default.innerShadow,
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
        alpha: options.alpha ?? 0.6,
        color: options.color ?? AOE_COLORS.default.outerGlow,
        distance: (options.distance ?? 10) * resolution,
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
