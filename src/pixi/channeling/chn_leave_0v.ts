import { DropShadowFilter } from 'pixi-filters'
import { Assets, Container, TilingSprite } from 'pixi.js'

import { getScale, YmToPx } from '@/pixi/scale'

import tether_img from '/game/vfx/channeling/eff/chn_leave_0v@3x.png?url'

// 实现类似 vfx/channeling/eff/chn_leave_0v.avfx 的效果
export async function create_chn_leave_0v(len: number, scale: number = 1) {
  const texture = await Assets.load(tether_img)

  const ratio = getScale(30) * scale

  const res = new Container()

  const tilingSprite = new TilingSprite({
    texture,
    width: (texture.width / 40) * len,
    height: texture.height,
    anchor: 0.5,
  })
  tilingSprite.tilePosition.set((-(40 * scale - len * scale) / 2 / ratio) * YmToPx, 0)
  tilingSprite.scale.set(ratio, ratio)

  const shadow = new TilingSprite({
    texture,
    width: (texture.width / 40) * len,
    height: texture.height,
    anchor: 0.5,
  })
  shadow.tilePosition.set((-(40 - len) / 2 / ratio) * YmToPx, 0)
  shadow.scale.set(ratio, ratio)
  shadow.filters = [
    new DropShadowFilter({
      offset: { x: 0, y: 0 },
      alpha: 0.6,
      shadowOnly: true,
    }),
  ]
  res.addChild(shadow)
  res.addChild(tilingSprite)

  return res
}
