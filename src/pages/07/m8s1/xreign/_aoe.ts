import type { Application } from 'pixi.js'

import { Container } from 'pixi.js'

import { AoE } from '@/pixi/aoe'
import { YmToPx } from '@/pixi/utils'

import { splitContainer } from '../_mask'

export function createCircleAoE(app: Application, R: number, params: { r: number; a: number }[]) {
  return splitContainer(() => {
    const c = new Container()
    params.forEach((p) => {
      const radius = p.r * YmToPx
      const radian = (p.a * Math.PI) / 180
      const circle = AoE.createCircle(R).toSprite(app)
      circle.position.set(radius * Math.cos(radian), radius * Math.sin(radian))
      c.addChild(circle)
    })
    return c
  })
}

export function createRectAoE(app: Application, W: number, H: number, params: { a: number }[]) {
  return splitContainer(() => {
    const c = new Container()
    params.forEach((p) => {
      const rect = AoE.createRect(W, H).toSprite(app)
      rect.rotation = (p.a * Math.PI) / 180
      c.addChild(rect)
    })
    return c
  })
}

export function createFanAoE(app: Application, R: number, params: { r: number; a: number; A: number; rotation: number }[]) {
  return splitContainer(() => {
    const c = new Container()
    params.forEach((p) => {
      const radius = p.r * YmToPx
      const radian = (p.a * Math.PI) / 180
      const fan = AoE.createFan(R, p.A).toSprite(app)
      fan.position.set(radius * Math.cos(radian), radius * Math.sin(radian))
      fan.rotation = p.rotation * Math.PI / 180
      c.addChild(fan)
    })
    return c
  })
}
