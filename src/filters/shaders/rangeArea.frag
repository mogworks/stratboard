precision highp float;

uniform vec4 uInputSize;
uniform vec4 uInputPixel;
uniform vec4 uInputClamp;
uniform vec4 uOutputFrame;
uniform vec4 uGlobalFrame;
uniform vec4 uOutputTexture;

uniform vec4 uInnerShadow1Color;
uniform float uInnerShadow1Size;
uniform vec4 uInnerShadow2Color;
uniform float uInnerShadow2Size;
uniform vec4 uBaseColor;

uniform sampler2D uSampler;

varying vec2 vUV;

float getAlpha(vec2 uv) {
    return texture2D(uSampler, uv).a;
}

#define DOUBLE_PI 6.283185307179586

vec2 findDisToEdge(vec2 ouv, float size1, float size2) {
    vec2 texSize = uInputSize.xy;
    float minDist1 = length(texSize);
    float minDist2 = length(texSize);
    vec2 pixelSize = 1.0 / texSize;
    vec2 uv = ouv;
    vec2 minUv = uv;

    const int SAMPLE_COUNT = 32;
    vec2 directions[SAMPLE_COUNT];
    for (int i = 0; i < SAMPLE_COUNT; i++) {
        float angle = float(i) * (DOUBLE_PI / float(SAMPLE_COUNT + 1));
        directions[i] = vec2(cos(angle), sin(angle));
    }

    float step = max(size1, size2);
    for (int s = 0; s < 100; s++) { // Limited iterations to avoid infinite loops
        if (step < 1.0) break;
        for (int i = 0; i < SAMPLE_COUNT; i++) {
            vec2 offset = directions[i] * step * pixelSize;
            vec2 sampleUV = uv + offset;
            float sampleAlpha = 0.0;
            if (sampleUV.x >= 0.0 && sampleUV.x < 1.0 && sampleUV.y >= 0.0 && sampleUV.y < 1.0) {
                sampleAlpha = getAlpha(sampleUV);
            }

            if (sampleAlpha == 0.0) {
                float dist = length((sampleUV - ouv) * texSize);
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

    return vec2(minDist1, minDist2);
}

void main() {
    vec4 tex = texture2D(uSampler, vUV);

    vec4 innerShadow1 = vec4(0.0);
    vec4 innerShadow2 = vec4(0.0);
    vec2 dists = findDisToEdge(vUV, uInnerShadow1Size, uInnerShadow2Size);
    float dist1 = dists.x;
    float dist2 = dists.y;

    if (tex.a > 0.0) {
        float alpha = max(0.0, 1.0 - dist1 / uInnerShadow1Size);
        innerShadow1 = uInnerShadow1Color * alpha;
        innerShadow1.a = alpha;

        alpha = max(0.0, 1.0 - dist2 / uInnerShadow2Size);
        innerShadow2 = uInnerShadow2Color * alpha;
        innerShadow2.a = alpha;
    }

    finalColor = tex;
    if (tex.a > 0.0) {
        finalColor = uBaseColor * uBaseColor.a;
    }

    finalColor = innerShadow2 + finalColor * (1.0 - innerShadow2.a);
    finalColor = innerShadow1 + finalColor * (1.0 - innerShadow1.a);
}