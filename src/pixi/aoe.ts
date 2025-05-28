import { Sprite, Texture } from 'pixi.js'

import { YmToPx } from './utils'

export const drawRing = (x = 0, y = 0, innerRadius = 10, outerRadius = 10) => {
  const c = document.createElement('canvas')
  // 绘制精度
  const scale = 4
  const ww = outerRadius * 2 * YmToPx * scale
  const hh = outerRadius * 2 * YmToPx * scale

  c.width = ww
  c.height = hh
  const ctx = c.getContext('2d') as unknown as CanvasRenderingContext2D
  const gradient = ctx.createRadialGradient(
    ww / 2,
    hh / 2,
    0,
    ww / 2,
    hh / 2,
    outerRadius * YmToPx * scale,
  )

  const oo = 0.3 / outerRadius / scale
  const cc = innerRadius / (outerRadius / (1 - oo * 3))

  if (cc === 0) {
    gradient.addColorStop(0, 'rgba(231, 161, 93, 0.4)') // 暗部
    gradient.addColorStop(1 - oo * 6, 'rgba(231, 161, 93, 0.4)') // 暗部
    gradient.addColorStop(1 - oo * 4, 'rgba(231, 161, 93, 1)') // 暗部
    gradient.addColorStop(1 - oo * 4, 'rgba(241,212,109, 1)') // 亮
    gradient.addColorStop(1 - oo * 3, 'rgba(241,212,109, 1)') // 亮
    gradient.addColorStop(1 - oo, 'rgba(231, 161, 93, 1') // 暗部
    gradient.addColorStop(1, 'rgba(231, 161, 93, 0)') // 暗
  } else {
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
    gradient.addColorStop(cc - oo * 3, 'rgba(231, 161, 93, 0') // 暗部
    gradient.addColorStop(cc - oo, 'rgba(231, 161, 93, 1') // 暗部
    gradient.addColorStop(cc, 'rgba(241,212,109, 1)') // 亮部
    gradient.addColorStop(cc + oo, 'rgba(241,212,109, 1)') // 暗部
    gradient.addColorStop(cc + oo, 'rgba(231, 161, 93, 1)') // 暗部
    gradient.addColorStop(cc + oo * 3, 'rgba(231, 161, 93, 0.4') // 暗部
    gradient.addColorStop(1 - oo * 6, 'rgba(231, 161, 93, 0.4)') // 暗部
    gradient.addColorStop(1 - oo * 4, 'rgba(231, 161, 93, 1)') // 暗部
    gradient.addColorStop(1 - oo * 4, 'rgba(241,212,109, 1)') // 亮
    gradient.addColorStop(1 - oo * 3, 'rgba(241,212,109, 1)') // 亮
    gradient.addColorStop(1 - oo, 'rgba(231, 161, 93, 1') // 暗部
    gradient.addColorStop(1, 'rgba(231, 161, 93, 0)') // 暗
  }

  ctx.beginPath()
  ctx.arc(ww / 2, hh / 2, outerRadius * YmToPx * scale, 0, Math.PI * 2)
  ctx.fillStyle = gradient
  ctx.fill()

  const gradTexture = Texture.from(c)
  const rankBlueBg = new Sprite(gradTexture)
  rankBlueBg.position.set(x * YmToPx, y * YmToPx)
  rankBlueBg.anchor.set(0.5, 0.5)
  rankBlueBg.scale.set(1 / scale)
  return rankBlueBg
}
