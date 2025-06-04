import type { Application } from 'pixi.js'

import { Container } from 'pixi.js'

import { AoE } from '@/pixi/aoe'
import { YmToPx } from '@/pixi/utils'

import { createMaskAoE } from '../_mask'

export function createCircleAoE(app: Application, R: number, params: { r: number; a: number }[]) {
  return createMaskAoE(() => {
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
