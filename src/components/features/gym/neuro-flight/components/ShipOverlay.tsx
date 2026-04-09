import React, { useRef, useEffect } from 'react';
import { useFlightGameContext } from '../FlightGameContext';

const VERTEX_SHADER = `#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
    v_uv = a_position;
    gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;

uniform float u_time;
uniform vec2 u_resolution;
uniform mat4 u_shipRot;
uniform float u_thrust;
uniform float u_brake;
uniform float u_yaw_velocity;
uniform float u_pitch_velocity;
uniform float u_thrust_ignition_time;

// Ship DNA from sliders
uniform float u_complexity;
uniform float u_fold1;
uniform float u_fold2;
uniform float u_fold3;
uniform float u_scale;
uniform float u_stretch;
uniform float u_taper;
uniform float u_twist;
uniform float u_asymmetryX;
uniform float u_asymmetryY;
uniform float u_asymmetryZ;

// Parameter Biases
uniform float u_twistAsymX;
uniform float u_scaleAsymX;
uniform float u_fold1AsymX;
uniform float u_fold2AsymX;

uniform float u_generalScale;
uniform float u_chaseDistance;
uniform float u_chaseVerticalOffset;
uniform float u_translucency;

#define MAX_STEPS 64
#define MAX_DIST 15.0
#define SURF_DIST 0.001

mat2 rot(float a) { float s=sin(a), c=cos(a); return mat2(c, -s, s, c); }

// KIFS Fractal for Ship Body
float sdFractalShip(vec3 p) {
    vec3 pOrig = p;
    p.x *= 1.0 - sign(p.x) * u_asymmetryX * 0.5;
    p.y *= 1.0 - sign(p.y) * u_asymmetryY * 0.5;
    p.z *= 1.0 - sign(p.z) * u_asymmetryZ * 0.5;
    p /= u_generalScale;
    p.z /= u_stretch; 
    p.xy *= 1.0 + p.z * u_taper;

    float localTwist = u_twist + pOrig.x * u_twistAsymX;
    p.xy *= rot(p.z * localTwist * 2.0);
    p.yz *= rot(1.57); 

    float s = 1.0;
    for(int i=0; i<int(u_complexity); i++) {
        float localFold1 = u_fold1 + pOrig.x * u_fold1AsymX;
        float localFold2 = u_fold2 + pOrig.x * u_fold2AsymX;
        p = abs(p) - vec3(localFold1, localFold2, 0.3)/s;
        p.xz *= rot(u_fold3);
        float localScale = u_scale + pOrig.x * u_scaleAsymX * 0.2;
        p *= localScale;
        s *= localScale;
    }
    float d = length(max(abs(p) - vec3(0.1, 0.8, 0.1), 0.0));
    return d/s * u_generalScale;
}

float map(vec3 p) {
    p = (inverse(u_shipRot) * vec4(p, 1.0)).xyz;
    float dBody = sdFractalShip(p);
    
    vec3 pEng = p;
    pEng.x = abs(pEng.x);
    pEng -= vec3(0.5, 0.0, 1.2); 
    float dEng = max(length(pEng.xy) - 0.2, abs(pEng.z) - 0.4);
    
    vec3 pFlap = p;
    pFlap.x = abs(pFlap.x);
    pFlap -= vec3(1.1, 0.0, 0.2);
    pFlap.yz *= rot(u_brake * 0.8);
    float dFlap = length(max(abs(pFlap) - vec3(0.4, 0.05, 0.3), 0.0));

    float d = -log(exp(-dBody*12.0) + exp(-dEng*12.0) + exp(-dFlap*12.0)) / 12.0;
    return d;
}

vec3 getNormal(vec3 p) {
    vec2 e = vec2(0.001, 0.0);
    return normalize(vec3(
        map(p + e.xyy) - map(p - e.xyy),
        map(p + e.yxy) - map(p - e.yxy),
        map(p + e.yyx) - map(p - e.yyx)
    ));
}

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
    vec3 ro = vec3(0.0, u_chaseVerticalOffset, u_chaseDistance);
    vec3 rd = normalize(vec3(uv, -1.5)); 

    float d = 0.0, t = 0.0;
    for(int i = 0; i < MAX_STEPS; i++) {
        vec3 p = ro + rd * t;
        d = map(p);
        if(d < SURF_DIST || t > MAX_DIST) break;
        t += d;
    }

    if(t < MAX_DIST) {
        vec3 p = ro + rd * t;
        vec3 n = getNormal(p);
        vec3 l = normalize(vec3(1.0, 2.0, 3.0)); 

        float diff = max(dot(n, l), 0.0);
        float amb = 0.1;
        vec3 col = vec3(0.2, 0.25, 0.3) * (diff + amb);
        
        float rim = pow(1.0 - max(dot(-rd, n), 0.0), 4.0);
        col += vec3(0.1, 0.6, 1.0) * rim * 0.8;

        vec3 localP = (inverse(u_shipRot) * vec4(p, 1.0)).xyz;
        
        float engineMask = smoothstep(0.4, 1.5, localP.z) * (1.0 - smoothstep(0.4, 1.0, abs(localP.x)));
        
        float timeSinceIgnition = u_time - u_thrust_ignition_time;
        float ignitionDuration = 0.3; 
        float pulseProgress = clamp(timeSinceIgnition / ignitionDuration, 0.0, 1.0);
        float ignitionFrontZ = mix(0.5, 1.5, pulseProgress);
        float pulseWidth = 0.15;
        float pulseShape = smoothstep(0.0, pulseWidth, localP.z - (ignitionFrontZ - pulseWidth)) * 
                           smoothstep(0.0, -pulseWidth, localP.z - (ignitionFrontZ + pulseWidth));
        float pulseGlow = pulseShape * 2.5 * (1.0 - pulseProgress); 

        float wave1 = sin(localP.z * 8.0) * 0.5 + 0.5;
        float wave2 = sin(localP.z * 5.0) * 0.5 + 0.5;
        float sustainedIntensity = 0.2 + pow(wave1, 3.0) * 1.0 + pow(wave2, 5.0) * 0.8;
        float sustainedVisibility = smoothstep(ignitionFrontZ - 0.2, ignitionFrontZ, localP.z);
        if (timeSinceIgnition > ignitionDuration) {
            sustainedVisibility = 1.0; 
        }
        float finalSustainedGlow = mix(0.1, sustainedIntensity, u_thrust * sustainedVisibility);
        float totalGlow = finalSustainedGlow + pulseGlow;
        col += vec3(1.0, 0.4, 0.05) * engineMask * totalGlow;

        float leftBrakeAmount = u_brake + max(0.0, u_yaw_velocity * 2.5);
        float rightBrakeAmount = u_brake + max(0.0, -u_yaw_velocity * 2.5); 

        float flapMaskLeft = smoothstep(0.8, 1.6, localP.x) * (1.0 - smoothstep(0.0, 0.8, -localP.x));
        float flapMaskRight = smoothstep(0.8, 1.6, -localP.x) * (1.0 - smoothstep(0.0, 0.8, localP.x));

        col += vec3(1.0, 0.1, 0.1) * flapMaskLeft * leftBrakeAmount * 2.0;
        col += vec3(1.0, 0.1, 0.1) * flapMaskRight * rightBrakeAmount * 2.0;

        float pitchUpAmount = max(0.0, -u_pitch_velocity * 4.0);
        float pitchDownAmount = max(0.0, u_pitch_velocity * 4.0);
        float pitchLightAreaMask = smoothstep(0.8, 0.0, abs(localP.z));
        float topMask = smoothstep(0.2, 0.4, localP.y) * pitchLightAreaMask;
        float bottomMask = smoothstep(-0.2, -0.4, localP.y) * pitchLightAreaMask;

        col += vec3(1.0, 0.1, 0.1) * topMask * pitchDownAmount;
        col += vec3(1.0, 0.1, 0.1) * bottomMask * pitchUpAmount;

        outColor = vec4(col, u_translucency);
    } else {
        outColor = vec4(0.0); 
    }
}
`;

const mat4 = {
    identity: (out: Float32Array) => { out.fill(0); out[0] = 1; out[5] = 1; out[10] = 1; out[15] = 1; },
    rotateX: (out: Float32Array, a: Float32Array, rad: number) => {
        let s = Math.sin(rad), c = Math.cos(rad), a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
        out.set(a);
        out[4] = a10 * c + a20 * s; out[5] = a11 * c + a21 * s; out[6] = a12 * c + a22 * s; out[7] = a13 * c + a23 * s;
        out[8] = a20 * c - a10 * s; out[9] = a21 * c - a11 * s; out[10] = a22 * c - a12 * s; out[11] = a23 * c - a13 * s;
    },
    rotateY: (out: Float32Array, a: Float32Array, rad: number) => {
        let s = Math.sin(rad), c = Math.cos(rad), a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
        out.set(a);
        out[0] = a00 * c - a20 * s; out[1] = a01 * c - a21 * s; out[2] = a02 * c - a22 * s; out[3] = a03 * c - a23 * s;
        out[8] = a00 * s + a20 * c; out[9] = a01 * s + a21 * c; out[10] = a02 * s + a22 * c; out[11] = a03 * s + a23 * c;
    },
    rotateZ: (out: Float32Array, a: Float32Array, rad: number) => {
        let s = Math.sin(rad), c = Math.cos(rad), a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
        out.set(a);
        out[0] = a00 * c + a10 * s; out[1] = a01 * c + a11 * s; out[2] = a02 * c + a13 * s; out[3] = a03 * c + a13 * s;
        out[4] = a10 * c - a00 * s; out[5] = a11 * c - a01 * s; out[6] = a12 * c - a02 * s; out[7] = a13 * c - a03 * s;
    },
};

export const ShipOverlay: React.FC = () => {
    // There is no controlConfig or shipConfig in the destructured object yet because I didn't export them from useFlightStore
    // I need to update useFlightStore to export `controlConfig` (was static inside, I should probably expose it or move it to a ref if I want to use it here, but actually ShipOverlay relies on it for thrusters logic?)
    // Actually, looking at ShipOverlay logic provided:
    // It uses `controlConfigRef` (via context) to check `invertForward`.
    // And `shipConfig` and `effectiveShipConfigRef`.
    // I need to make sure useFlightStore exports these.

    // Let's assume I will hotfix useFlightStore if needed, or if I missed it in previous step.
    // In previous step I exported: activeShaderCode, uniforms, cameraRef, renderCameraRef, pressKey, releaseKey, pressedKeys, viewMode, setViewMode, viewModeTransition, isHdEnabled, setIsHdEnabled, effectiveShipConfigRef.
    // I MISSED `controlConfig` and `shipConfig`. I should add them.
    // AND `cameraAngularVelocityRef`.

    // I will write this file assuming they exist, and then I will update `useFlightStore` to export them.
    const { viewMode, pressedKeys, effectiveShipConfigRef, cameraAngularVelocityRef } = useFlightGameContext() as any;
    // Type casting as any for now until I fix the store return type implementation.

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const shipState = useRef({ pitch: 0, yaw: 0, roll: 0 });

    // Constants for control logic since I didn't expose controlConfig yet
    const controlConfig = { invertForward: true }; // Hardcoded typical default for now or until I fix store

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || viewMode !== 'chase') return;
        const gl = canvas.getContext('webgl2', { alpha: true, depth: false, antialias: false });
        if (!gl) return;

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        const compile = (type: number, src: string) => {
            const s = gl.createShader(type)!;
            gl.shaderSource(s, src);
            gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s));
            return s;
        };
        const p = gl.createProgram()!;
        gl.attachShader(p, compile(gl.VERTEX_SHADER, VERTEX_SHADER));
        gl.attachShader(p, compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
        gl.linkProgram(p);
        gl.useProgram(p);

        const locs = {
            uRes: gl.getUniformLocation(p, 'u_resolution'),
            uTime: gl.getUniformLocation(p, 'u_time'),
            uShipRot: gl.getUniformLocation(p, 'u_shipRot'),
            uThrust: gl.getUniformLocation(p, 'u_thrust'),
            uThrustIgnitionTime: gl.getUniformLocation(p, 'u_thrust_ignition_time'),
            uBrake: gl.getUniformLocation(p, 'u_brake'),
            uYawVelocity: gl.getUniformLocation(p, 'u_yaw_velocity'),
            uPitchVelocity: gl.getUniformLocation(p, 'u_pitch_velocity'),
            uComplexity: gl.getUniformLocation(p, 'u_complexity'),
            uFold1: gl.getUniformLocation(p, 'u_fold1'),
            uFold2: gl.getUniformLocation(p, 'u_fold2'),
            uFold3: gl.getUniformLocation(p, 'u_fold3'),
            uScale: gl.getUniformLocation(p, 'u_scale'),
            uStretch: gl.getUniformLocation(p, 'u_stretch'),
            uTaper: gl.getUniformLocation(p, 'u_taper'),
            uTwist: gl.getUniformLocation(p, 'u_twist'),
            uAsymmetryX: gl.getUniformLocation(p, 'u_asymmetryX'),
            uAsymmetryY: gl.getUniformLocation(p, 'u_asymmetryY'),
            uAsymmetryZ: gl.getUniformLocation(p, 'u_asymmetryZ'),
            uTwistAsymX: gl.getUniformLocation(p, 'u_twistAsymX'),
            uScaleAsymX: gl.getUniformLocation(p, 'u_scaleAsymX'),
            uFold1AsymX: gl.getUniformLocation(p, 'u_fold1AsymX'),
            uFold2AsymX: gl.getUniformLocation(p, 'u_fold2AsymX'),
            uGeneralScale: gl.getUniformLocation(p, 'u_generalScale'),
            uChaseDistance: gl.getUniformLocation(p, 'u_chaseDistance'),
            uChaseVerticalOffset: gl.getUniformLocation(p, 'u_chaseVerticalOffset'),
            uTranslucency: gl.getUniformLocation(p, 'u_translucency'),
        };

        const vao = gl.createVertexArray()!;
        gl.bindVertexArray(vao);
        const vbo = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

        const rotMat = new Float32Array(16);
        let lastTime = 0, animId = 0;

        const thrustState = {
            level: 0.0,
            isThrusting: false,
            ignitionTime: -100.0,
        };
        const brakeLevel = { current: 0.0 };

        const render = (t: number) => {
            const dt = Math.min((t - lastTime) / 1000, 0.1);
            const currentTimeSec = t * 0.001;
            lastTime = t;

            const dpr = window.devicePixelRatio || 1;
            const w = canvas.clientWidth * dpr, h = canvas.clientHeight * dpr;
            if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            const isThrustingNow = (pressedKeys.has('s') && !controlConfig.invertForward) || (pressedKeys.has('w') && controlConfig.invertForward);
            const isBraking = (pressedKeys.has('w') && !controlConfig.invertForward) || (pressedKeys.has('s') && controlConfig.invertForward);

            if (isThrustingNow && !thrustState.isThrusting) {
                thrustState.ignitionTime = currentTimeSec;
            }
            thrustState.isThrusting = isThrustingNow;

            const LERP_SPEED = 8.0;
            thrustState.level += ((isThrustingNow ? 1.0 : 0.0) - thrustState.level) * LERP_SPEED * dt;
            brakeLevel.current += ((isBraking ? 1.0 : 0.0) - brakeLevel.current) * LERP_SPEED * dt;

            const tYaw = -cameraAngularVelocityRef.current[1] * 1.2;
            const tPitch_velocity = cameraAngularVelocityRef.current[0];
            const tPitch = -tPitch_velocity * 1.0;

            shipState.current.yaw += (tYaw - shipState.current.yaw) * 3.0 * dt;
            shipState.current.pitch += (tPitch - shipState.current.pitch) * 3.0 * dt;
            shipState.current.roll += (tYaw * 1.5 - shipState.current.roll) * 3.0 * dt;

            mat4.identity(rotMat);
            mat4.rotateY(rotMat, rotMat, shipState.current.yaw);
            mat4.rotateX(rotMat, rotMat, shipState.current.pitch);
            mat4.rotateZ(rotMat, rotMat, shipState.current.roll);

            gl.useProgram(p);
            gl.uniform2f(locs.uRes, w, h);
            gl.uniform1f(locs.uTime, currentTimeSec);
            gl.uniformMatrix4fv(locs.uShipRot, false, rotMat);
            gl.uniform1f(locs.uThrust, thrustState.level);
            gl.uniform1f(locs.uThrustIgnitionTime, thrustState.ignitionTime);
            gl.uniform1f(locs.uBrake, brakeLevel.current);
            gl.uniform1f(locs.uYawVelocity, tYaw);
            gl.uniform1f(locs.uPitchVelocity, tPitch_velocity);

            const ec = effectiveShipConfigRef.current;
            gl.uniform1f(locs.uComplexity, ec.complexity);
            gl.uniform1f(locs.uFold1, ec.fold1);
            gl.uniform1f(locs.uFold2, ec.fold2);
            gl.uniform1f(locs.uFold3, ec.fold3);
            gl.uniform1f(locs.uScale, ec.scale);
            gl.uniform1f(locs.uStretch, ec.stretch);
            gl.uniform1f(locs.uTaper, ec.taper);
            gl.uniform1f(locs.uTwist, ec.twist);
            gl.uniform1f(locs.uAsymmetryX, ec.asymmetryX);
            gl.uniform1f(locs.uAsymmetryY, ec.asymmetryY);
            gl.uniform1f(locs.uAsymmetryZ, ec.asymmetryZ);

            gl.uniform1f(locs.uTwistAsymX, ec.twistAsymX);
            gl.uniform1f(locs.uScaleAsymX, ec.scaleAsymX);
            gl.uniform1f(locs.uFold1AsymX, ec.fold1AsymX);
            gl.uniform1f(locs.uFold2AsymX, ec.fold2AsymX);

            gl.uniform1f(locs.uGeneralScale, ec.generalScale ?? 1.0);
            gl.uniform1f(locs.uChaseDistance, ec.chaseDistance ?? 6.5);
            gl.uniform1f(locs.uChaseVerticalOffset, ec.chaseVerticalOffset ?? 1.0);
            gl.uniform1f(locs.uTranslucency, ec.translucency ?? 1.0);

            gl.bindVertexArray(vao);
            gl.drawArrays(gl.TRIANGLES, 0, 6);

            animId = requestAnimationFrame(render);
        };
        render(performance.now());
        return () => { cancelAnimationFrame(animId); gl.deleteProgram(p); };
    }, [viewMode]);

    if (viewMode !== 'chase') return null;
    return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none z-10" />;
};
