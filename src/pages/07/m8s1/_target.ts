import { Assets, Sprite } from 'pixi.js'

import type { Coordinates } from '@/pixi/coordinates'

import { convertCoordinates, degToRad, scaleCoordinates } from '@/pixi/coordinates'
import { YmToPx } from '@/pixi/scale'

import { splitContainerAsync } from './_mask'

import target_ring_img from '/assets/target_ring/r5@3x.png?url'

// 创建目标环
export async function createTargetRing(position?: Coordinates, rotation?: number) {
  const targetRingTexture = await Assets.load(target_ring_img)
  const targetRing = Sprite.from(targetRingTexture)
  targetRing.anchor.set(0.5, 0.54)
  targetRing.position = convertCoordinates(scaleCoordinates(position ?? { x: 0, y: 0 }, YmToPx), 'cartesian')
  targetRing.rotation = degToRad(rotation ?? 0)
  return targetRing
}

// 创建带遮罩效果的目标环（目标环被电网覆盖的部分加上一定的透明度，符合游戏内情况）
export function createMaskTargetRing(position?: Coordinates, rotation?: number) {
  return splitContainerAsync(async () => {
    return await createTargetRing(position, rotation)
  })
}
