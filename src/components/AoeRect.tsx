import type Konva from 'konva'

import { Rect } from 'react-konva'

import { AoeEffect } from './AoeEffect'

export default function AoeRect(props: Konva.RectConfig) {
  return (
    <AoeEffect>
      <Rect {...props} />
    </AoeEffect>
  )
}
