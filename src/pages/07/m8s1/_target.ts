import { Assets, Sprite } from 'pixi.js'

import target_ring_img from '/assets/target_ring/r5@3x.png?url'

export async function createTargetRing() {
  const targetRingTexture = await Assets.load(target_ring_img)
  const targetRing = Sprite.from(targetRingTexture)
  targetRing.anchor.set(0.5, 0.54)
  targetRing.position.set(0, 0)
  return targetRing
}
