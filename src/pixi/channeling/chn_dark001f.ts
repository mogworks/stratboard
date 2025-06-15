import type { Application } from 'pixi.js'

import { DropShadowFilter } from 'pixi-filters'
import { Assets, Container, Graphics, GraphicsContext, TilingSprite } from 'pixi.js'

import tether_img from '/assets/texture/fire_tether.png?url'

// 实现类似 vfx/channeling/eff/chn_dark001f.avfx 的效果
export async function create_chn_dark001f(app: Application, length: number) {
  const texture = await Assets.load(tether_img)

  const tetherContext = new GraphicsContext()
    .texture(texture, '#AE01DE', -texture.width / 2, -texture.height / 2)

  const tetherGraphics = new Graphics(tetherContext)
  const tetherTexture = app.renderer.extract.texture(tetherGraphics)

  const ratio = 0.2

  const res = new Container()

  const tilingSprite = new TilingSprite({
    texture: tetherTexture,
    width: length / ratio,
    height: tetherTexture.height,
  })
  tilingSprite.anchor.set(0.5, 0.5)
  tilingSprite.position.set(0, 0)
  tilingSprite.scale.set(ratio)

  const shadow = new TilingSprite({
    texture: tetherTexture,
    width: length / ratio,
    height: tetherTexture.height,
  })
  shadow.anchor.set(0.5, 0.5)
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
