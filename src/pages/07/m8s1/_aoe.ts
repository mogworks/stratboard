import type { Application } from 'pixi.js'

import { Container } from 'pixi.js'

import type { AoECreateOptions } from '@/pixi/aoe'

import { AoE } from '@/pixi/aoe'
import { YmToPx } from '@/pixi/scale'

import { splitContainer } from './_mask'

// 批量创建圆形AoE
export function createCircleAoEWithoutMask(
  app: Application,
  R: number,
  params: { r: number; a: number }[],
  options: AoECreateOptions = {},
) {
  const c = new Container()
  params.forEach((p) => {
    const radius = p.r * YmToPx
    const radian = (p.a * Math.PI) / 180
    const circle = AoE.createCircle(R, options).toSprite(app)
    circle.position.set(radius * Math.cos(radian), radius * Math.sin(radian))
    c.addChild(circle)
  })
  return c
}

// 批量创建圆形AoE（电网遮罩版本，被电网覆盖的部分调整透明度）
export function createCircleAoE(
  app: Application,
  R: number,
  params: { r: number; a: number }[],
  options: AoECreateOptions = {},
) {
  return splitContainer(() => {
    return createCircleAoEWithoutMask(app, R, params, options)
  })
}

// 批量创建矩形AoE
export function createRectAoEWithoutMask(
  app: Application,
  W: number,
  H: number,
  params: { a: number }[],
  options: AoECreateOptions = {},
) {
  const c = new Container()
  params.forEach((p) => {
    const rect = AoE.createRect(W, H, options).toSprite(app)
    rect.rotation = (p.a * Math.PI) / 180
    c.addChild(rect)
  })
  return c
}

// 批量创建矩形AoE（电网遮罩版本，被电网覆盖的部分调整透明度）
export function createRectAoE(
  app: Application,
  W: number,
  H: number,
  params: { a: number }[],
  options: AoECreateOptions = {},
) {
  return splitContainer(() => {
    return createRectAoEWithoutMask(app, W, H, params, options)
  })
}

// 批量创建扇形AoE
export function createFanAoEWithoutMask(
  app: Application,
  R: number,
  params: { r: number; a: number; A: number; rotation: number }[],
  options: AoECreateOptions = {},
) {
  const c = new Container()
  params.forEach((p) => {
    const radius = p.r * YmToPx
    const radian = (p.a * Math.PI) / 180
    const fan = AoE.createFan(R, p.A, options).toSprite(app)
    fan.position.set(radius * Math.cos(radian), radius * Math.sin(radian))
    fan.rotation = (p.rotation * Math.PI) / 180
    c.addChild(fan)
  })
  return c
}

// 批量创建扇形AoE（电网遮罩版本，被电网覆盖的部分调整透明度）
export function createFanAoE(
  app: Application,
  R: number,
  params: { r: number; a: number; A: number; rotation: number }[],
  options: AoECreateOptions = {},
) {
  return splitContainer(() => {
    return createFanAoEWithoutMask(app, R, params, options)
  })
}
