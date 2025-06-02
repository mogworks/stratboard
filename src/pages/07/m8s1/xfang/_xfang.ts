import type { Application } from 'pixi.js'

import { Container, Graphics } from 'pixi.js'

import { AoE, AOE_COLORS } from '@/pixi/aoe'
import { YmToPx } from '@/pixi/utils'

function createAoESingle(app: Application, rotate = false, ring = false, activate = false) {
  const rect1 = AoE.createRect(40, 6, activate ? { colors: AOE_COLORS.tailwind.sky } : undefined).toSprite(app)
  if (rotate) {
    rect1.rotation = Math.PI / 4
  }
  const rect2 = AoE.createRect(6, 40, activate ? { colors: AOE_COLORS.tailwind.sky } : undefined).toSprite(app)
  if (rotate) {
    rect2.rotation = Math.PI / 4
  }
  if (ring) {
    const ring = AoE.createRing(8, 15, activate ? { colors: AOE_COLORS.tailwind.green } : undefined).toSprite(app)
    return [rect1, rect2, ring]
  } else {
    const circle = AoE.createCircle(9, activate ? { colors: AOE_COLORS.tailwind.orange } : undefined).toSprite(app)
    return [rect1, rect2, circle]
  }
}

function createAoE(app: Application, rotate: boolean | 'all' = false, ring = false, activate = false) {
  const aoe = new Container()
  if (rotate === 'all') {
    const [rect11, rect12, ringOrCircle1] = createAoESingle(app, false, ring, activate)
    const [rect21, rect22, _ringOrCircle2] = createAoESingle(app, true, ring, activate)
    aoe.addChild(rect11)
    aoe.addChild(rect12)
    aoe.addChild(rect21)
    aoe.addChild(rect22)
    aoe.addChild(ringOrCircle1)
  } else {
    const [rect1, rect2, ringOrCircle] = createAoESingle(app, rotate, ring, activate)
    aoe.addChild(rect1)
    aoe.addChild(rect2)
    aoe.addChild(ringOrCircle)
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

export function addXfang(app: Application, container: Container, rotate: boolean | 'all' = false, ring = false, activate = false) {
  // 被电网覆盖的外圈，几乎透明
  const aoe1 = createAoE(app, rotate, ring, activate)
  aoe1.alpha = 0.2
  const mask1 = createMask(true) // 环形遮罩（即电网范围）
  aoe1.mask = mask1
  aoe1.addChild(mask1)

  // 未被电网覆盖的内圈
  const aoe2 = createAoE(app, rotate, ring, activate)
  const mask2 = createMask(false) // 圆形遮罩（即安全场地范围）
  aoe2.mask = mask2
  aoe2.addChild(mask2)

  container.addChild(aoe1)
  container.addChild(aoe2)
}
