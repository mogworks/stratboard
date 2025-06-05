import type { Application } from 'pixi.js'

import type { AoECreateOptions } from '@/pixi/aoe'
import type { Coordinates } from '@/pixi/coordinates'

import { AoE } from '@/pixi/aoe'

import { splitContainer } from './_mask'

// 批量创建圆形AoE（电网遮罩版本，被电网覆盖的部分调整透明度）
export function createCircles(
  app: Application,
  params: { position?: Coordinates; radius?: number; options?: AoECreateOptions }[],
  defaultRadius: number = 0,
  defaultOptions: AoECreateOptions = {},
) {
  return splitContainer(() => {
    return AoE.createCircles(app, params, defaultRadius, defaultOptions)
  })
}

// 批量创建矩形AoE（电网遮罩版本，被电网覆盖的部分调整透明度）
export function createRects(
  app: Application,
  params: { position?: Coordinates; rotation?: number; width?: number; height?: number; options?: AoECreateOptions }[],
  defaultWidth: number = 0,
  defaultHeight: number = 0,
  defaultOptions: AoECreateOptions = {},
) {
  return splitContainer(() => {
    return AoE.createRects(app, params, defaultWidth, defaultHeight, defaultOptions)
  })
}

// 批量创建扇形AoE（电网遮罩版本，被电网覆盖的部分调整透明度）
export function createFans(
  app: Application,
  params: { position?: Coordinates; rotation?: number; radius?: number; angle?: number; options?: AoECreateOptions }[],
  defaultRadius: number = 0,
  defaultAngle: number = 0,
  defaultOptions: AoECreateOptions = {},
) {
  return splitContainer(() => {
    return AoE.createFans(app, params, defaultRadius, defaultAngle, defaultOptions)
  })
}
