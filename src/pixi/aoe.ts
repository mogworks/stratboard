import type { GlowFilterOptions } from 'pixi-filters'
import type { Application, FillInput, Graphics } from 'pixi.js'

import { GlowFilter } from 'pixi-filters'
import { Container, Point, Rectangle, Sprite, Texture } from 'pixi.js'

import type { Coordinates } from './coordinates'

import { convertCoordinates, degToRad, scaleCoordinates } from './coordinates'
import * as G from './graphics'
import { DEFAULT_AOE_RESOLUTION } from './resolutions'
import { YmToPx } from './scale'

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

// 模仿游戏内颜色的一些预设
export const AOE_PRESET = {
  style_1: {
    colors: { aoe: '#feca9b', outerGlow: '#feca9b', innerShadow: '#4b3f2f' },
    aoeAlpha: 0.24,
    innerShadowOptions: { alpha: 0.8 },
  },
  style_2: {
    colors: { aoe: '#a1f1fe', outerGlow: '#7dd3fc', innerShadow: '#0369a1' },
    aoeAlpha: 0.12,
  },
  style_3: { // 模仿紫圈点名
    colors: { aoe: '#f9a8d4', outerGlow: '#fbcfe8', innerShadow: '#db2777' },
    aoeAlpha: 0.1,
    innerShadowOptions: { alpha: 0.4 },
  },
  style_4: { // 绿色
    colors: { aoe: '#86efac', outerGlow: '#bbf7d0', innerShadow: '#16a34a' },
    aoeAlpha: 0.1,
    innerShadowOptions: { alpha: 0.4 },
  },
  lockon_circle_aoe_1: { // 模仿淡黄圈点名
    colors: { aoe: '#feca9b', outerGlow: '#feca9b', innerShadow: '#4b3f2f' },
    aoeAlpha: 0.12,
    innerShadowOptions: { alpha: 0.4 },
  },
  lockon_circle_aoe_2: { // 模仿风圈效果
    colors: { aoe: '#8dcc85', outerGlow: '#8dcc85', innerShadow: '#344c31' },
    aoeAlpha: 0.2,
    innerShadowOptions: { alpha: 0.4 },
  },
} as const

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

export type AoEType = 'rect' | 'ray' | 'circle' | 'ring' | 'fan' | 'x' | 'ring_fan'

export class AoETexture extends Texture {
  type: AoEType
  resolution: number

  constructor(texture: Texture, type: AoEType, resolution: number) {
    super(texture)
    this.type = type
    this.resolution = resolution
  }

  getCenterPivot(metaData?: Record<string, any>) {
    if (this.type === 'ray') {
      return new Point(YmToPx * this.resolution, this.height / 2)
    } else if (this.type === 'fan') {
      const angle = (metaData?.angle ?? 0) % 360
      if (angle <= 180) {
        return new Point(YmToPx * this.resolution, this.height / 2)
      } else {
        const radius = metaData?.radius ?? 0
        const radian = degToRad(angle / 2 - 90)
        return new Point((1 + radius * Math.sin(radian)) * YmToPx * this.resolution, this.height / 2)
      }
    } else if (this.type === 'ring_fan') {
      const angle = (metaData?.angle ?? 0) % 360
      const innerRadius = metaData?.innerRadius ?? 0
      const outerRadius = metaData?.outerRadius ?? 0
      if (angle <= 180) {
        return new Point((1 - innerRadius * Math.cos(degToRad(angle / 2))) * YmToPx * this.resolution, this.height / 2)
      } else {
        const radian = degToRad(angle / 2 - 90)
        return new Point((1 + outerRadius * Math.sin(radian)) * YmToPx * this.resolution, this.height / 2)
      }
    } else {
      return new Point(this.width / 2, this.height / 2)
    }
  }
}

export class AoE extends Container {
  type: AoEType
  resolution: number
  metaData?: Record<string, any>

  constructor(
    type: AoEType,
    resolution: number,
    fn: (style?: FillInput) => Graphics,
    colors?: Partial<AoEColors>,
    aoeAlpha?: number,
    innerShadowOptions?: Partial<GlowFilterOptions>,
    outerGlowOptions?: Partial<GlowFilterOptions>,
    metaData?: Record<string, any>,
  ) {
    super()

    this.type = type
    this.resolution = resolution
    this.metaData = metaData

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
    const centerPivot = texture.getCenterPivot(this.metaData)
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
   * 批量创建矩形AoE效果
   */
  static createRects(
    app: Application,
    params: { alpha?: number; position?: Coordinates; rotation?: number; width?: number; height?: number; options?: AoECreateOptions }[],
    defaultWidth: number = 0,
    defaultHeight: number = 0,
    defaultOptions: AoECreateOptions = {},
  ) {
    const c = new Container()
    params.forEach((param) => {
      const rect = AoE.createRect(
        param.width ?? defaultWidth,
        param.height ?? defaultHeight,
        param.options ?? defaultOptions,
      ).toSprite(app)
      rect.alpha = param.alpha ?? 1
      rect.position = convertCoordinates(scaleCoordinates(param.position ?? { x: 0, y: 0 }, YmToPx), 'cartesian')
      rect.rotation = degToRad(param.rotation ?? 0)
      c.addChild(rect)
    })
    return c
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
   * 批量创建射线AoE效果
   */
  static createRays(
    app: Application,
    params: { alpha?: number; position?: Coordinates; rotation?: number; width?: number; length?: number; options?: AoECreateOptions }[],
    defaultWidth: number = 0,
    defaultLength: number = 0,
    defaultOptions: AoECreateOptions = {},
  ) {
    const c = new Container()
    params.forEach((param) => {
      const ray = AoE.createRay(
        param.width ?? defaultWidth,
        param.length ?? defaultLength,
        param.options ?? defaultOptions,
      ).toSprite(app)
      ray.alpha = param.alpha ?? 1
      ray.position = convertCoordinates(scaleCoordinates(param.position ?? { x: 0, y: 0 }, YmToPx), 'cartesian')
      ray.rotation = degToRad(param.rotation ?? 0)
      c.addChild(ray)
    })
    return c
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
   * 批量创建圆形AoE效果
   */
  static createCircles(
    app: Application,
    params: { alpha?: number; position?: Coordinates; radius?: number; options?: AoECreateOptions }[],
    defaultRadius: number = 0,
    defaultOptions: AoECreateOptions = {},
  ) {
    const c = new Container()
    params.forEach((param) => {
      const circle = AoE.createCircle(param.radius ?? defaultRadius, param.options ?? defaultOptions).toSprite(app)
      circle.alpha = param.alpha ?? 1
      circle.position = convertCoordinates(scaleCoordinates(param.position ?? { x: 0, y: 0 }, YmToPx), 'cartesian')
      c.addChild(circle)
    })
    return c
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
   * 批量创建环形AoE效果
   */
  static createRings(
    app: Application,
    params: { alpha?: number; position?: Coordinates; innerRadius?: number; outerRadius?: number; options?: AoECreateOptions }[],
    defaultInnerRadius: number = 0,
    defaultOuterRadius: number = 0,
    defaultOptions: AoECreateOptions = {},
  ) {
    const c = new Container()
    params.forEach((param) => {
      const ring = AoE.createRing(
        param.innerRadius ?? defaultInnerRadius,
        param.outerRadius ?? defaultOuterRadius,
        param.options ?? defaultOptions,
      ).toSprite(app)
      ring.alpha = param.alpha ?? 1
      ring.position = convertCoordinates(scaleCoordinates(param.position ?? { x: 0, y: 0 }, YmToPx), 'cartesian')
      c.addChild(ring)
    })
    return c
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
      { angle, radius },
    )
    return aoe
  }

  /**
   * 批量创建扇形AoE效果
   */
  static createFans(
    app: Application,
    params: { alpha?: number; position?: Coordinates; rotation?: number; radius?: number; angle?: number; options?: AoECreateOptions }[],
    defaultRadius: number = 0,
    defaultAngle: number = 0,
    defaultOptions: AoECreateOptions = {},
  ) {
    const c = new Container()
    params.forEach((param) => {
      const fan = AoE.createFan(
        param.radius ?? defaultRadius,
        param.angle ?? defaultAngle,
        param.options ?? defaultOptions,
      ).toSprite(app)
      fan.alpha = param.alpha ?? 1
      fan.position = convertCoordinates(scaleCoordinates(param.position ?? { x: 0, y: 0 }, YmToPx), 'cartesian')
      fan.rotation = degToRad(param.rotation ?? 0)
      c.addChild(fan)
    })
    return c
  }

  /**
   * 创建X形AoE效果
   */
  static createX(width: number, length: number, options: AoECreateOptions = {}): AoE {
    const { resolution = DEFAULT_AOE_RESOLUTION } = options

    return new AoE(
      'x',
      resolution,
      style => G.createXGraphics(width, length, style, resolution),
      options.colors,
      options.aoeAlpha,
      options.innerShadowOptions,
      options.outerGlowOptions,
    )
  }

  /**
   * 批量创建X形AoE效果
   */
  static createXs(
    app: Application,
    params: { alpha?: number; position?: Coordinates; rotation?: number; width?: number; length?: number; options?: AoECreateOptions }[],
      defaultWidth: number = 0,
      defaultLength: number = 0,
      defaultOptions: AoECreateOptions = {},
  ) {
    const c = new Container()
    params.forEach((param) => {
      const x = AoE.createX(
        param.width ?? defaultWidth,
        param.length ?? defaultLength,
        param.options ?? defaultOptions,
      ).toSprite(app)
      x.alpha = param.alpha ?? 1
      x.position = convertCoordinates(scaleCoordinates(param.position ?? { x: 0, y: 0 }, YmToPx), 'cartesian')
      x.rotation = degToRad(param.rotation ?? 0)
      c.addChild(x)
    })
    return c
  }

  /**
   * 创建扇环AoE效果
   */
  static createRingFan(innerRadius: number, outerRadius: number, angle: number, options: AoECreateOptions = {}): AoE {
    const { resolution = DEFAULT_AOE_RESOLUTION } = options

    const aoe = new AoE(
      'ring_fan',
      resolution,
      style => G.createRingFanGraphics(innerRadius, outerRadius, angle, style, resolution),
      options.colors,
      options.aoeAlpha,
      options.innerShadowOptions,
      options.outerGlowOptions,
      { angle, innerRadius, outerRadius },
    )
    return aoe
  }

  /**
   * 批量创建扇环AoE效果
   */
  static createRingFans(
    app: Application,
    params: { alpha?: number; position?: Coordinates; rotation?: number; innerRadius?: number; outerRadius?: number; angle?: number; options?: AoECreateOptions }[],
      defaultInnerRadius: number = 0,
      defaultOuterRadius: number = 0,
      defaultAngle: number = 0,
      defaultOptions: AoECreateOptions = {},
  ) {
    const c = new Container()
    params.forEach((param) => {
      const ringFan = AoE.createRingFan(
        param.innerRadius ?? defaultInnerRadius,
        param.outerRadius ?? defaultOuterRadius,
        param.angle ?? defaultAngle,
        param.options ?? defaultOptions,
      ).toSprite(app)
      ringFan.alpha = param.alpha ?? 1
      ringFan.position = convertCoordinates(scaleCoordinates(param.position ?? { x: 0, y: 0 }, YmToPx), 'cartesian')
      ringFan.rotation = degToRad(param.rotation ?? 0)
      c.addChild(ringFan)
    })
    return c
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
