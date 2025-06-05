import type { GlowFilterOptions } from 'pixi-filters'
import type { Application, FillInput, Graphics } from 'pixi.js'

import { GlowFilter } from 'pixi-filters'
import { Container, Point, Rectangle, Sprite, Texture } from 'pixi.js'

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
    slate: {
      aoe: '#94a3b8',
      innerShadow: '#334155',
      outerGlow: '#cbd5e1',
    },
    gray: {
      aoe: '#9ca3af',
      innerShadow: '#374151',
      outerGlow: '#d1d5db',
    },
    zinc: {
      aoe: '#a1a1aa',
      innerShadow: '#3f3f46',
      outerGlow: '#d4d4d8',
    },
    neutral: {
      aoe: '#a3a3a3',
      innerShadow: '#404040',
      outerGlow: '#d4d4d4',
    },
    stone: {
      aoe: '#a8a29e',
      innerShadow: '#44403c',
      outerGlow: '#d6d3d1',
    },
  },
}

export type AoEColors = typeof AOE_COLORS.default

export interface AoECreateOptions {
  /** 渲染分辨率，影响最终效果的精细度和性能，默认 2 */
  resolution?: number

  /**
   * AoE 颜色配置，默认 AOE_COLORS.default
   *
   * 其中，innerShadow、outerGlow 会被 innerShadowOptions、outerGlowOptions 的同名选项覆盖
   *
   * @example { aoe: '#fb923c', innerShadow: '#ff751f', outerGlow: '#fffc79' }
   */
  colors?: Partial<AoEColors>

  /** AoE 主体透明度，范围 0-1，默认 0.25 */
  aoeAlpha?: number

  /** 内阴影滤镜配置，默认 {} */
  innerShadowOptions?: Partial<GlowFilterOptions>

  /** 外发光滤镜配置，默认 {}  */
  outerGlowOptions?: Partial<GlowFilterOptions>
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
    colors?: Partial<AoEColors>,
    aoeAlpha?: number,
    innerShadowOptions?: Partial<GlowFilterOptions>,
    outerGlowOptions?: Partial<GlowFilterOptions>,
  ) {
    super()

    this.type = type
    this.resolution = resolution

    const innerShadow = AoE.createInnerShadow(
      fn,
      { color: colors?.innerShadow ?? AOE_COLORS.default.innerShadow, ...innerShadowOptions },
      resolution,
    )
    const outerGlow = AoE.createOuterGlow(
      fn,
      { color: colors?.outerGlow ?? AOE_COLORS.default.outerGlow, ...outerGlowOptions },
      resolution,
    )
    const aoe = fn({ color: colors?.aoe ?? AOE_COLORS.default.aoe, alpha: aoeAlpha ?? 0.25 })

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
    const { resolution = DEFAULT_AOE_RESOLUTION } = options

    return new AoE(
      'rect',
      resolution,
      style => G.createRectGraphics(width, height, style, resolution),
      options.colors,
      options.aoeAlpha,
      options.innerShadowOptions,
      options.outerGlowOptions,
    )
  }

  /**
   * 创建射线AoE效果
   */
  static createRay(width: number, length: number, options: AoECreateOptions = {}): AoE {
    const { resolution = DEFAULT_AOE_RESOLUTION } = options

    return new AoE(
      'ray',
      resolution,
      style => G.createRectGraphics(length, width, style, resolution),
      options.colors,
      options.aoeAlpha,
      options.innerShadowOptions,
      options.outerGlowOptions,
    )
  }

  /**
   * 创建圆形AoE效果
   */
  static createCircle(radius: number, options: AoECreateOptions = {}): AoE {
    const { resolution = DEFAULT_AOE_RESOLUTION } = options

    return new AoE(
      'circle',
      resolution,
      style => G.createCircleGraphics(radius, style, resolution),
      options.colors,
      options.aoeAlpha,
      options.innerShadowOptions,
      options.outerGlowOptions,
    )
  }

  /**
   * 创建环形AoE效果
   */
  static createRing(innerRadius: number, outerRadius: number, options: AoECreateOptions = {}): AoE {
    if (innerRadius >= outerRadius) {
      throw new Error('内圆半径必须小于外圆半径')
    }

    const { resolution = DEFAULT_AOE_RESOLUTION } = options

    return new AoE(
      'ring',
      resolution,
      style => G.createRingGraphics(innerRadius, outerRadius, style, resolution),
      options.colors,
      options.aoeAlpha,
      options.innerShadowOptions,
      options.outerGlowOptions,
    )
  }

  /**
   * 创建扇形AoE效果
   */
  static createFan(radius: number, angle: number, options: AoECreateOptions = {}): AoE {
    const { resolution = DEFAULT_AOE_RESOLUTION } = options

    const aoe = new AoE(
      'fan',
      resolution,
      style => G.createFanGraphics(radius, angle, style, resolution),
      options.colors,
      options.aoeAlpha,
      options.innerShadowOptions,
      options.outerGlowOptions,
    )
    return aoe
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

  private static createInnerShadow(
    fn: (style?: FillInput) => Graphics,
    options: GlowFilterOptions = {},
    resolution = DEFAULT_AOE_RESOLUTION,
  ) {
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

  private static createOuterGlow(
    fn: (style?: FillInput) => Graphics,
    options: GlowFilterOptions = {},
    resolution = DEFAULT_AOE_RESOLUTION,
  ) {
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
