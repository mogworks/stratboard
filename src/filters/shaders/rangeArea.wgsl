struct GlobalFilterUniforms {
  uInputSize: vec4<f32>,
  uInputPixel: vec4<f32>,
  uInputClamp: vec4<f32>,
  uOutputFrame: vec4<f32>,
  uGlobalFrame: vec4<f32>,
  uOutputTexture: vec4<f32>,
};

struct Uniforms {
  uInnerShadow1Color: vec4<f32>,
  uInnerShadow1Size: f32,
  uInnerShadow2Color: vec4<f32>,
  uInnerShadow2Size: f32,
  uBaseColor: vec4<f32>,
};

@group(0) @binding(0) var<uniform> gfu: GlobalFilterUniforms;
@group(0) @binding(1) var uSampler: texture_2d<f32>;
@group(0) @binding(2) var uSamplerSampler: sampler;
@group(1) @binding(0) var<uniform> uniforms: Uniforms;

fn getAlpha(uv: vec2<f32>) -> f32 {
    return textureSample(uSampler, uSamplerSampler, uv).a;
}

fn findDisToEdge(ouv: vec2<f32>, size: f32) -> f32 {
    var minDist = 999999.0;
    let texSize: vec2<u32> = textureDimensions(uSampler);
    let pixelSize = 1.0 / vec2<f32>(texSize);
    var uv = ouv;
    var minUv = uv;
    
    var step = size;
    while (step >= 1.0) {
        const SAMPLE_COUNT = 32u;
        var directions: array<vec2<f32>, SAMPLE_COUNT>;
        
        for (var i = 0u; i < SAMPLE_COUNT; i++) {
            let angle = f32(i) * 2.0 * 3.14159265359 / f32(SAMPLE_COUNT);
            directions[i] = vec2<f32>(cos(angle), sin(angle));
        }
        
        for (var i = 0u; i < SAMPLE_COUNT; i++) {
            let offset = directions[i] * step * pixelSize;
            let sampleUV = uv + offset;
            let alpha = getAlpha(sampleUV);
            
            if (alpha == 0.0) {
                let dist = length((sampleUV - ouv)*vec2<f32>(texSize));
                if (dist < minDist) {
                    minDist = dist;
                    minUv = sampleUV;
                }
            }
        }
        
        step = step / 2;  // 每次迭代减半步长
        uv = minUv;
    }
    
    return minDist;
}

@fragment
fn main(@builtin(position) position: vec4<f32>, @location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
    let tex = textureSample(uSampler, uSamplerSampler, uv);

    var innerShadow1 = vec4<f32>(0.0);
    let dist = findDisToEdge(uv, uniforms.uInnerShadow1Size);

    if (tex.a > 0.0) {
        let alpha = max(0, 1.0 - dist / uniforms.uInnerShadow1Size);
        innerShadow1 = uniforms.uInnerShadow1Color * alpha;
        innerShadow1.a = alpha;
    }

    var innerShadow2 = vec4<f32>(0.0);
    let dist2 = findDisToEdge(uv, uniforms.uInnerShadow2Size);

    if (tex.a > 0.0 && dist2 < uniforms.uInnerShadow2Size) {
        let alpha = max(0, 1.0 - dist2 / uniforms.uInnerShadow2Size);
        innerShadow2 = uniforms.uInnerShadow2Color * alpha;
        innerShadow2.a = alpha;
    }
    
    var finalColor = tex;
    
    if (tex.a > 0.0) {
        finalColor = uniforms.uBaseColor * uniforms.uBaseColor.a;
    }

    finalColor = innerShadow2 + finalColor * (1.0 - innerShadow2.a);
    finalColor = innerShadow1 + finalColor * (1.0 - innerShadow1.a);

    
    return finalColor;
}