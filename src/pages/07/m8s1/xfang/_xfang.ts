import type { Application } from 'pixi.js'

import { Container } from 'pixi.js'

import { AoE, AOE_COLORS } from '@/pixi/aoe'

import { splitContainer } from '../_mask'

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

export function createXfang(app: Application, rotate: boolean | 'all' = false, ring = false, activate = false) {
  return splitContainer(() => {
    return createAoE(app, rotate, ring, activate)
  })
}
