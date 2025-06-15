import type { Application } from 'pixi.js'

import { Assets, Container, Graphics, GraphicsContext, TilingSprite } from 'pixi.js'

import ch_arrow01f_img from '/game/vfx/channeling/texture/ch_arrow01f.png?url'
import chane08f_img from '/game/vfx/channeling/texture/chane08f.png?url'
import chane14f_img from '/game/vfx/channeling/texture/chane14f.png?url'

// 实现类似 vfx/channeling/eff/chn_arrow01f.avfx 的效果
export async function create_chn_arrow01f(app: Application, length: number) {
  const chane08f_texture = await Assets.load(chane08f_img)
  const chane14f_texture = await Assets.load(chane14f_img)
  const ch_arrow01f_texture = await Assets.load(ch_arrow01f_img)

  const tetherContext = new GraphicsContext()
    .texture(chane08f_texture, '#07000A', -chane08f_texture.width / 2, -chane08f_texture.height / 2)
    .texture(chane08f_texture, '#07000A', -chane08f_texture.width / 2, -chane08f_texture.height / 2)
    .texture(chane14f_texture, '#831843', -chane14f_texture.width / 2, -chane14f_texture.height / 2)
    .texture(chane14f_texture, '#831843', -chane14f_texture.width / 2, -chane14f_texture.height / 2)
    .texture(ch_arrow01f_texture, '#fb7185', -ch_arrow01f_texture.width / 2, -ch_arrow01f_texture.height / 2)

  const tetherGraphics = new Graphics(tetherContext)
  const tetherTexture = app.renderer.extract.texture(tetherGraphics)

  const ratio = 0.12

  const res = new Container()

  const tilingSprite1 = new TilingSprite({
    texture: tetherTexture,
    width: tetherTexture.width,
    height: length / ratio / 2,
  })
  tilingSprite1.anchor.set(0.5, 1)
  tilingSprite1.position.set(0, 0)
  tilingSprite1.scale.set(ratio)
  tilingSprite1.rotation = Math.PI / 2

  const tilingSprite2 = new TilingSprite({
    texture: tetherTexture,
    width: tetherTexture.width,
    height: length / ratio / 2,
  })
  tilingSprite2.anchor.set(0.5, 1)
  tilingSprite2.position.set(0, 0)
  tilingSprite2.scale.set(ratio)
  tilingSprite2.rotation = -Math.PI / 2

  res.addChild(tilingSprite1)
  res.addChild(tilingSprite2)

  return res
}
