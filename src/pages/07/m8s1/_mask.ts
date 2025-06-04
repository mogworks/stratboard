import { Container, Graphics } from 'pixi.js'

import { YmToPx } from '@/pixi/utils'

// 创建电网范围或安全场地范围的遮罩
export function createMask(inverse = false) {
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

// 把一个 AoE 分成两部分，一部分被电网覆盖，另一部分未被电网覆盖，电网覆盖的部分透明度设为 alpha，默认 0.2
export function createMaskAoE(fn: () => Container, alpha = 0.2) {
  const aoe = new Container()

  // 被电网覆盖的外圈，几乎透明
  const aoe1 = fn()
  aoe1.alpha = alpha
  const mask1 = createMask(true) // 环形遮罩（即电网范围）
  aoe1.mask = mask1
  aoe1.addChild(mask1)

  // 未被电网覆盖的内圈
  const aoe2 = fn()
  const mask2 = createMask(false) // 圆形遮罩（即安全场地范围）
  aoe2.mask = mask2
  aoe2.addChild(mask2)

  aoe.addChild(aoe1)
  aoe.addChild(aoe2)

  return aoe
}
