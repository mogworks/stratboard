import { Filter, GpuProgram } from 'pixi.js'

import defaultVertexShader from '@/filters/shaders/default.wgsl?raw'
import rangeAreaFragmentShader from '@/filters/shaders/rangeArea.wgsl?raw'

const PRESETS = {
  default: {
    baseColor: [1, 0.635, 0.25, 0.3],
    innerShadow1Color: [0.984, 0.82, 0.45, 1],
    innerShadow1Size: 4.0,
    innerShadow2Color: [1, 0.59, 0.207, 1],
    innerShadow2Size: 16.0,
  },
  blue: {
    baseColor: [0.5, 0.8, 1, 0.3],
    innerShadow1Color: [0.184, 0.725, 1, 1],
    innerShadow1Size: 4.0,
    innerShadow2Color: [0.184, 0.725, 1, 1],
    innerShadow2Size: 16.0,
  },
  purple: {
    baseColor: [1, 0.482, 0.788, 0.3],
    innerShadow1Color: [1, 0.5, 0.807, 1],
    innerShadow1Size: 4.0,
    innerShadow2Color: [1, 0.5, 0.807, 1],
    innerShadow2Size: 16.0,
  },
}

export interface RangeAreaFilterOptions {
  preset?: keyof typeof PRESETS
}

export class RangeAreaFilter extends Filter {
  constructor(options: RangeAreaFilterOptions) {
    super({
      gpuProgram: new GpuProgram({
        vertex: {
          source: defaultVertexShader,
          entryPoint: 'main',
        },
        fragment: {
          source: rangeAreaFragmentShader,
          entryPoint: 'main',
        },
      }),
      resources: {
        uniforms: {
          uInnerShadow1Color: { value: PRESETS[options.preset || 'default'].innerShadow1Color, type: 'vec4<f32>' },
          uInnerShadow1Size: { value: PRESETS[options.preset || 'default'].innerShadow1Size, type: 'f32' },
          uInnerShadow2Color: { value: PRESETS[options.preset || 'default'].innerShadow2Color, type: 'vec4<f32>' },
          uInnerShadow2Size: { value: PRESETS[options.preset || 'default'].innerShadow2Size, type: 'f32' },
          uBaseColor: { value: PRESETS[options.preset || 'default'].baseColor, type: 'vec4<f32>' },
        },
      },
      padding: 200,
    })
  }
}
