import { DropShadowFilter } from 'pixi-filters'
import { Assets, Container, TilingSprite } from 'pixi.js'

import type { CartesianCoordinates } from '../coordinates'

import { getScale } from '../scale'

import tether_img from '/game/vfx/channeling/eff/chn_closer_0v@3x.png?url'

// 实现类似 vfx/channeling/eff/chn_closer_0v.avfx 的效果
export async function create_chn_closer_0v(length: number, scale: number = 1, tilePosition: CartesianCoordinates = { x: 0, y: 0 }) {
  const texture = await Assets.load(tether_img)

  const ratio = getScale(30) * scale

  const res = new Container()

  const tilingSprite = new TilingSprite({
    texture,
    width: texture.width / 40 * length / scale,
    height: texture.height,
  })
  tilingSprite.tilePosition.set(tilePosition.x, tilePosition.y)
  tilingSprite.anchor.set(0.5)
  tilingSprite.position.set(0, 0)
  tilingSprite.scale.set(ratio)

  const shadow = new TilingSprite({
    texture,
    width: texture.width / 40 * length / scale,
    height: texture.height,
  })
  shadow.tilePosition.set(tilePosition.x, tilePosition.y)
  shadow.anchor.set(0.5)
  shadow.position.set(0, 0)
  shadow.scale.set(ratio)
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
