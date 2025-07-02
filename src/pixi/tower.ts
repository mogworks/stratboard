import type { Container } from 'pixi.js'

import { Assets, Sprite } from 'pixi.js'

import type { Coordinates } from './coordinates'

import { convertCoordinates, scaleCoordinates } from './coordinates'
import { getScale, YmToPx } from './scale'

import pillar_img from '/assets/tower/pillar@3x.png?url'
import tower2_img from '/game/vfx/omen/eff/general_trap_o2x@3x.png?url'
import tower3_img from '/game/vfx/omen/eff/general_trap_o3x@3x.png?url'
import tower4_img from '/game/vfx/omen/eff/general_trap_o4x@3x.png?url'
import tower1_img from '/game/vfx/omen/eff/m0119_trap_01t@3x.png?url'

const towerImgMap = {
  1: tower1_img,
  2: tower2_img,
  3: tower3_img,
  4: tower4_img,
}

export async function createTower(type: keyof typeof towerImgMap, position: Coordinates, scale = 1) {
  const p = scaleCoordinates(convertCoordinates(position, 'cartesian'), YmToPx * scale)
  const towerTexture = await Assets.load(towerImgMap[type])
  const tower = Sprite.from(towerTexture)
  tower.anchor.set(0.5, 0.5)
  tower.scale.set(getScale(20, 0.78) * scale)
  tower.blendMode = 'overlay'
  tower.position = p
  const pillars = []
  const pillarTexture = await Assets.load(pillar_img)
  if (type === 1) {
    const pillar = Sprite.from(pillarTexture)
    pillar.anchor.set(0.5, 0.5)
    pillar.scale.set(0.16 * scale)
    pillar.position = { x: p.x + 0.1 * YmToPx, y: p.y - 0.7 * YmToPx }
    pillars.push(pillar)
  } else if (type === 2) {
    const pillar1 = Sprite.from(pillarTexture)
    pillar1.anchor.set(0.5, 0.5)
    pillar1.scale.set(0.16 * scale)
    pillar1.position = { x: p.x - 1 * YmToPx, y: p.y - 0.7 * YmToPx }
    pillars.push(pillar1)
    const pillar2 = Sprite.from(pillarTexture)
    pillar2.anchor.set(0.5, 0.5)
    pillar2.scale.set(0.16 * scale)
    pillar2.position = { x: p.x + 1.2 * YmToPx, y: p.y - 0.7 * YmToPx }
    pillars.push(pillar2)
  } else if (type === 3) {
    const pillar = Sprite.from(pillarTexture)
    pillar.anchor.set(0.5, 0.5)
    pillar.scale.set(0.16 * scale)
    pillar.position = { x: p.x + 0.1 * YmToPx, y: p.y - 1.5 * YmToPx }
    pillars.push(pillar)
    const pillar1 = Sprite.from(pillarTexture)
    pillar1.anchor.set(0.5, 0.5)
    pillar1.scale.set(0.16 * scale)
    pillar1.position = { x: p.x - 1 * YmToPx, y: p.y - 0.1 * YmToPx }
    pillars.push(pillar1)
    const pillar2 = Sprite.from(pillarTexture)
    pillar2.anchor.set(0.5, 0.5)
    pillar2.scale.set(0.16 * scale)
    pillar2.position = { x: p.x + 1.2 * YmToPx, y: p.y - 0.1 * YmToPx }
    pillars.push(pillar2)
  } else {
    const pillar1 = Sprite.from(pillarTexture)
    pillar1.anchor.set(0.5, 0.5)
    pillar1.scale.set(0.16 * scale)
    pillar1.position = { x: p.x - 0.8 * YmToPx, y: p.y - 1.5 * YmToPx }
    pillars.push(pillar1)
    const pillar2 = Sprite.from(pillarTexture)
    pillar2.anchor.set(0.5, 0.5)
    pillar2.scale.set(0.16 * scale)
    pillar2.position = { x: p.x + 1 * YmToPx, y: p.y - 1.5 * YmToPx }
    pillars.push(pillar2)
    const pillar3 = Sprite.from(pillarTexture)
    pillar3.anchor.set(0.5, 0.5)
    pillar3.scale.set(0.16 * scale)
    pillar3.position = { x: p.x - 0.8 * YmToPx, y: p.y + 0.1 * YmToPx }
    pillars.push(pillar3)
    const pillar4 = Sprite.from(pillarTexture)
    pillar4.anchor.set(0.5, 0.5)
    pillar4.scale.set(0.16 * scale)
    pillar4.position = { x: p.x + 1 * YmToPx, y: p.y + 0.1 * YmToPx }
    pillars.push(pillar4)
  }
  return { tower, pillars }
}

export async function addTower(c: Container, type: keyof typeof towerImgMap, position: Coordinates, scale = 1) {
  const { tower, pillars } = await createTower(type, position, scale)
  c.addChild(tower)
  pillars.forEach((pillar) => {
    c.addChild(pillar)
  })
}
