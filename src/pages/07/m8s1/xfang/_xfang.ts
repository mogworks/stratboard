import type { Application } from 'pixi.js'

import { Container, Graphics } from 'pixi.js'

import { AoE } from '@/pixi/aoe'
import { YmToPx } from '@/pixi/utils'

function createAoE(app: Application, rotate = false, ring = false) {
  const aoe = new Container()
  const rect1 = AoE.createRect(40, 6).toSprite(app)
  if (rotate) {
    rect1.rotation = Math.PI / 4
  }
  aoe.addChild(rect1)
  const rect2 = AoE.createRect(6, 40).toSprite(app)
  if (rotate) {
    rect2.rotation = Math.PI / 4
  }
  aoe.addChild(rect2)
  if (ring) {
    const ring = AoE.createRing(8, 15).toSprite(app)
    aoe.addChild(ring)
  } else {
    const circle = AoE.createCircle(8).toSprite(app)
    aoe.addChild(circle)
  }
  return aoe
}

function createMask(inverse = false) {
  const aoeMask = new Graphics()
  if (inverse) {
    // 环形遮罩（即电网范围）
    aoeMask.circle(0, 0, 15 * YmToPx)
    aoeMask.fill({ color: 'white' })
    aoeMask.circle(0, 0, 12 * YmToPx)
    aoeMask.cut()
  } else {
    // 圆形遮罩（即安全场地范围）
    aoeMask.circle(0, 0, 12 * YmToPx)
    aoeMask.fill({ color: 'white' })
  }
  return aoeMask
}

export function addXfang(app: Application, container: Container, rotate = false, ring = false) {
  // 被电网覆盖的外圈，几乎透明
  const aoe1 = createAoE(app, rotate, ring)
  aoe1.alpha = 0.2
  const mask1 = createMask(true) // 环形遮罩（即电网范围）
  aoe1.mask = mask1
  aoe1.addChild(mask1)

  // 未被电网覆盖的内圈
  const aoe2 = createAoE(app, rotate, ring)
  const mask2 = createMask(false) // 圆形遮罩（即安全场地范围）
  aoe2.mask = mask2
  aoe2.addChild(mask2)

  container.addChild(aoe1)
  container.addChild(aoe2)
}
