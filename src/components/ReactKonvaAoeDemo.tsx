import React, { useState } from 'react'
import { Layer, Ring, Shape, Stage } from 'react-konva'

import { AoeEffect, STROKE_WIDTH } from './AoeEffect'

export default function ReactKonvaAoeDemo() {
  const [center] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 })

  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <AoeEffect>
          <Ring
            x={center.x}
            y={center.y}
            innerRadius={120 + STROKE_WIDTH / 2}
            outerRadius={200 - STROKE_WIDTH / 2}
          />
        </AoeEffect>
        {/* 整体透明度调整 */}
        <AoeEffect opacity={0.5}>
          <Ring
            x={center.x - 180}
            y={center.y + 30}
            innerRadius={80 + STROKE_WIDTH / 2}
            outerRadius={180 - STROKE_WIDTH / 2}
          />
        </AoeEffect>
        {/* 内部组件透明度调整 */}
        <AoeEffect baseOpacity={0.125} innerGlowOpacity={0.5} outerGlowOpacity={0.5}>
          <Ring
            x={center.x + 110}
            y={center.y + 70}
            innerRadius={80 + STROKE_WIDTH / 2}
            outerRadius={160 - STROKE_WIDTH / 2}
          />
        </AoeEffect>
        {/* 自定义形状 */}
        <AoeEffect>
          <Shape
            x={center.x - 130}
            y={center.y - 275}
            width={260}
            height={170}
            sceneFunc={function (context, shape) {
              const width = shape.width()
              const height = shape.height()
              context.beginPath()
              context.moveTo(0, 0)
              context.lineTo(width - 40, height - 90)
              context.quadraticCurveTo(width - 110, height - 70, width, height)
              context.closePath()
              context.fillStrokeShape(shape)
            }}
          />
        </AoeEffect>
      </Layer>
    </Stage>
  )
}
