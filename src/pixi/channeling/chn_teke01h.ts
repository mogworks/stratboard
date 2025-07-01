import { DropShadowFilter } from 'pixi-filters'
import { Assets, Container, Sprite } from 'pixi.js'

import { getScale } from '@/pixi/scale'

import tether_img from '/game/vfx/channeling/eff/chn_teke01h@3x.png?url'

// 实现类似 vfx/channeling/eff/chn_teke01h.avfx 的效果
export async function create_chn_teke01h(len: number, scale: number = 1) {
  const res = new Container()

  const texture = await Assets.load(tether_img)

  const chn = new Sprite(texture)
  chn.anchor.set(0.5, 0.5)
  chn.scale.set(getScale(30) * len / 41.5, getScale(30) * scale)

  const shadow = new Sprite(texture)
  shadow.anchor.set(0.5, 0.5)
  shadow.scale.set(getScale(30) * len / 41.5, getScale(30) * scale)
  shadow.filters = [
    new DropShadowFilter({
      offset: { x: 0, y: 0 },
      alpha: 0.6,
      shadowOnly: true,
    }),
  ]
  res.addChild(shadow)
  res.addChild(chn)

  return res
}
