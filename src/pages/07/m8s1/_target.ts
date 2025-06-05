import { Assets, Container, Sprite } from 'pixi.js'

import { YmToPx } from '@/pixi/scale'

import { splitContainerAsync } from './_mask'

import target_ring_img from '/assets/target_ring/r5@3x.png?url'

// 创建目标环
export async function createTargetRing() {
  const targetRingTexture = await Assets.load(target_ring_img)
  const targetRing = Sprite.from(targetRingTexture)
  targetRing.anchor.set(0.5, 0.54)
  targetRing.position.set(0, 0)
  return targetRing
}

// 创建带遮罩效果的目标环（目标环被电网覆盖的部分加上一定的透明度，符合游戏内情况）
export function createMaskTargetRing(r: number, a: number, A: number) {
  return splitContainerAsync(async () => {
    const targetRingContainer = new Container()
    const targetRing = await createTargetRing()
    targetRing.rotation = (Math.PI * A) / 180
    targetRing.position.set(
      r * YmToPx * Math.cos((Math.PI * a) / 180),
      r * YmToPx * Math.sin((Math.PI * a) / 180),
    )
    targetRingContainer.addChild(targetRing)
    return targetRingContainer
  })
}
