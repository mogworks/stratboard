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

const DOUBLE_PI: f32 = 3.14159265358979323846264 * 2.;

fn findDisToEdge(ouv: vec2<f32>, size1: f32, size2: f32) -> vec2<f32> {
    let texSize: vec2<u32> = textureDimensions(uSampler);
    var minDist1 = length(vec2<f32>(texSize));
    var minDist2 = length(vec2<f32>(texSize));
    let pixelSize = 1.0 / vec2<f32>(texSize);
    var uv = ouv;
    var minUv = uv;

    const SAMPLE_COUNT = 32u;
    // sample circle around the pixel
    var directions: array<vec2<f32>, SAMPLE_COUNT>;
    for (var i = 0u; i < SAMPLE_COUNT; i++) {
        let angle = f32(i) * (DOUBLE_PI / f32(SAMPLE_COUNT+1));
        directions[i] = vec2<f32>(cos(angle), sin(angle));
    }
    
    var step = max(size1, size2);
    while (step >= 1.0) {
        for (var i = 0u; i < SAMPLE_COUNT; i++) {
            let offset = directions[i] * step * pixelSize;
            let sampleUV = uv + offset;
            let sampleAlpha = getAlpha(sampleUV);
            var alpha = 0.0;
            if (sampleUV.x >= 0.0 && sampleUV.x < 1.0 && sampleUV.y >= 0.0 && sampleUV.y < 1.0) {
                alpha = sampleAlpha;
            }
            
            if (alpha == 0) {
                let dist = length((sampleUV - ouv)*vec2<f32>(texSize));
                if (dist < minDist1 && step <= size1) {
                    minDist1 = dist;
                    minUv = sampleUV;
                }
                if (dist < minDist2 && step <= size2) {
                    minDist2 = dist;
                    minUv = sampleUV;
                }
            }
        }
        
        step -= 1.0;

        uv = minUv;
    }
    
    return vec2<f32>(minDist1, minDist2);
}

@fragment
fn main(@builtin(position) position: vec4<f32>, @location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
    let tex = textureSample(uSampler, uSamplerSampler, uv);

    var innerShadow1 = vec4<f32>(0.0);
    var innerShadow2 = vec4<f32>(0.0);
    let dists = findDisToEdge(uv, uniforms.uInnerShadow1Size, uniforms.uInnerShadow2Size);
    let dist1 = dists.x;
    let dist2 = dists.y;

    if (tex.a > 0.0) {
        var alpha = max(0, 1.0 - dist1 / uniforms.uInnerShadow1Size);
        innerShadow1 = uniforms.uInnerShadow1Color * alpha;
        innerShadow1.a = alpha;

        alpha = max(0, 1.0 - dist2 / uniforms.uInnerShadow2Size);
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