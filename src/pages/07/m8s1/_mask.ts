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

// 把一个 Container 分成两部分，一部分被电网覆盖，另一部分未被电网覆盖，电网覆盖的部分透明度设为 alpha，默认 0.2
export function splitContainer(fn: () => Container, alpha = 0.2) {
  const c = new Container()

  // 被电网覆盖的外圈，几乎透明
  const c1 = fn()
  c1.alpha = alpha
  const m1 = createMask(true) // 环形遮罩（即电网范围）
  c1.mask = m1
  c1.addChild(m1)

  // 未被电网覆盖的内圈
  const c2 = fn()
  const m2 = createMask(false) // 圆形遮罩（即安全场地范围）
  c2.mask = m2
  c2.addChild(m2)

  c.addChild(c1)
  c.addChild(c2)

  return c
}

// 异步版本
export async function splitContainerAsync(fn: () => Promise<Container>, alpha = 0.2) {
  const c = new Container()

  // 被电网覆盖的外圈，几乎透明
  const c1 = await fn()
  c1.alpha = alpha
  const m1 = createMask(true) // 环形遮罩（即电网范围）
  c1.mask = m1
  c1.addChild(m1)

  // 未被电网覆盖的内圈
  const c2 = await fn()
  const m2 = createMask(false) // 圆形遮罩（即安全场地范围）
  c2.mask = m2
  c2.addChild(m2)

  c.addChild(c1)
  c.addChild(c2)

  return c
}
