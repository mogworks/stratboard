import { Assets, Container, Sprite } from 'pixi.js'
import { z } from 'zod'

import { getScale, YmToPx } from './utils'

import One_bg from '/assets/waymark/1_bg@3x.png?url'
import One from '/assets/waymark/1@3x.png?url'
import Two_bg from '/assets/waymark/2_bg@3x.png?url'
import Two from '/assets/waymark/2@3x.png?url'
import Three_bg from '/assets/waymark/3_bg@3x.png?url'
import Three from '/assets/waymark/3@3x.png?url'
import Four_bg from '/assets/waymark/4_bg@3x.png?url'
import Four from '/assets/waymark/4@3x.png?url'
import A_bg from '/assets/waymark/a_bg@3x.png?url'
import A from '/assets/waymark/a@3x.png?url'
import B_bg from '/assets/waymark/b_bg@3x.png?url'
import B from '/assets/waymark/b@3x.png?url'
import C_bg from '/assets/waymark/c_bg@3x.png?url'
import C from '/assets/waymark/c@3x.png?url'
import D_bg from '/assets/waymark/d_bg@3x.png?url'
import D from '/assets/waymark/d@3x.png?url'

const _waymarkPositionSchema = z.object({
  X: z.number(),
  Z: z.number(),
  alpha: z.number().optional(),
  rotation: z.number().optional(),
})

const _waymarkDataSchema = z.object({
  A: _waymarkPositionSchema.optional(),
  B: _waymarkPositionSchema.optional(),
  C: _waymarkPositionSchema.optional(),
  D: _waymarkPositionSchema.optional(),
  One: _waymarkPositionSchema.optional(),
  Two: _waymarkPositionSchema.optional(),
  Three: _waymarkPositionSchema.optional(),
  Four: _waymarkPositionSchema.optional(),
})

export type WaymarkType = 'A' | 'B' | 'C' | 'D' | 'One' | 'Two' | 'Three' | 'Four'
export type WaymarkPosition = z.infer<typeof _waymarkPositionSchema>
export type WaymarkData = z.infer<typeof _waymarkDataSchema>

export class Waymark extends Container {
  type: WaymarkType
  fgSprite?: Sprite
  bgSprite?: Sprite

  constructor(type: WaymarkType) {
    super()
    this.type = type
  }

  async init() {
    const bg = {
      A_bg,
      B_bg,
      C_bg,
      D_bg,
      One_bg,
      Two_bg,
      Three_bg,
      Four_bg,
    }[`${this.type}_bg`]
    const bg_texture = await Assets.load(bg)
    const bg_sprite = Sprite.from(bg_texture)
    bg_sprite.anchor.set(0.5, 0.5)
    bg_sprite.scale.set(getScale())
    this.bgSprite = bg_sprite
    this.addChild(bg_sprite)

    const fg = {
      A,
      B,
      C,
      D,
      One,
      Two,
      Three,
      Four,
    }[`${this.type}`]
    const fg_texture = await Assets.load(fg)
    const fg_sprite = Sprite.from(fg_texture)
    fg_sprite.anchor.set(0.5, 0.5)
    fg_sprite.scale.set(0.5)
    this.fgSprite = fg_sprite
    this.addChild(fg_sprite)
  }
}

export async function setWaymark(container: Container, payload: WaymarkData, alpha = 1) {
  const waymarks = new Map<WaymarkType, Waymark>()
  for (const key in payload) {
    const k = key as WaymarkType
    const v = payload[k]!
    const waymark = new Waymark(k)
    await waymark.init()
    waymark.position.set(v.X * YmToPx, v.Z * YmToPx)
    waymark.alpha = v.alpha ?? alpha
    waymark.fgSprite!.rotation = v.rotation ?? 0
    container.addChild(waymark)
    waymarks.set(k, waymark)
  }
  return waymarks
}
