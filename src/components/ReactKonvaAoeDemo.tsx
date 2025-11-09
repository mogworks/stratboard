import React, { useEffect, useRef, useState } from 'react'
import { Layer, Ring, Shape, Stage } from 'react-konva'

import { AoeEffect, STROKE_WIDTH } from './AoeEffect'

export default function ReactKonvaAoeDemo() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateSize = () => {
      if (typeof window !== 'undefined') {
        setSize({ width: window.innerWidth, height: window.innerHeight })
      } else {
        const el = containerRef.current
        if (el) {
          setSize({ width: el.clientWidth, height: el.clientHeight })
        }
      }
    }
    updateSize()
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateSize)
      return () => window.removeEventListener('resize', updateSize)
    }
    return () => {}
  }, [])

  return (
    <Stage width={size.width} height={size.height}>
      <Layer>
        <AoeEffect>
          <Ring
            x={size.width / 2}
            y={size.height / 2}
            innerRadius={120 + STROKE_WIDTH / 2}
            outerRadius={200 - STROKE_WIDTH / 2}
          />
        </AoeEffect>
        <AoeEffect>
          <Shape
            x={size.width / 2 - 130}
            y={size.height / 2 - 85}
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
