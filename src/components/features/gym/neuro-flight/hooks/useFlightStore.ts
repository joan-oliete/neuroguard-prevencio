import { useState, useCallback, useRef, useEffect } from 'react';
import { Slider, SoundConfig, Modulation, ModulationSource, ModulationTarget, CameraData, ViewMode, ShipConfig, ShipModulation, ShipModulationTarget } from '../types';

// Simple UUID generator
const uuidv4 = () => Math.random().toString(36).substr(2, 9);

// --- INLINED CONFIGURATION FROM SESSION 1 ---
const DEFAULT_SHADER_CODE = `vec3 a=vec3(1,0,0),q,p=u_cameraPosition;vec2 centered_uv=FC.xy*2.-r;float rollAngle=u_cameraRoll;mat2 rollMat=mat2(cos(rollAngle),-sin(rollAngle),sin(rollAngle),cos(rollAngle));centered_uv=rollMat*centered_uv;vec3 v=vec3(centered_uv/slider_zoom,r.y);v=rotate3D(u_cameraRotation.y,a.yxy)*v;vec3 camRight=normalize(cross(a.yxy,v));v=rotate3D(slider_cameraXRotation+u_cameraRotation.x,camRight)*v;vec3 rd=normalize(v);for(float d,i,l;l++<slider_maxIterations;p-=rd*d)for(q=p,d=-q.y,i=58.;i>.05;i*=slider_fractalScale)d=max(d,min(min(q=i*.9-abs(mod(rotate3D(slider_fractalRotation + sin(t*1.+q.y*5.)*slider_fractalPulseStrength,a.zxz)*q,i+i)-i),q.y).x,q.z)),l>1e2?(d+=1e-5,v/=v,o):(o.rgb+=max(5e-4-d*d,0.)*(vec3(1.)+vec3(sin(l*.1+t),cos(l*.15+t),sin(l*.2+t))*slider_colorEffectStrength),o);o*=log(7.-p.y)*.1;o.rgb*=slider_brightness;vec3 sunDir=normalize(vec3(0.,slider_sunElevation,1.));float sunDot=max(0.,dot(rd,sunDir));vec3 sky=mix(vec3(1.0,0.3,0.1),vec3(0.05,0.2,0.5),clamp(rd.y*.8+.2,0.,1.));sky+=vec3(1.0,0.7,0.3)*pow(sunDot,8.)*2.0;float dist=length(u_cameraPosition-p);float fog=1.-exp(-dist*slider_atmosphereDensity*.01);o.rgb=mix(o.rgb,sky*slider_brightness,fog);o.rgb+=vec3(1.0,0.9,0.5)*smoothstep(.995,1.,sunDot)*10.*slider_brightness*smoothstep(50.,500.,dist);`;

const DEFAULT_UNIFORMS = {
    slider_cameraXRotation: 0,
    slider_zoom: 3.95,
    slider_fractalScale: 0.37,
    slider_fractalRotation: 1.09,
    slider_brightness: 4.25,
    slider_maxIterations: 115,
    slider_colorEffectStrength: 1.9,
    slider_fractalPulseStrength: 0,
    slider_atmosphereDensity: 0.08,
    slider_sunElevation: 0.15
};

const DEFAULT_SOUND_CONFIG: SoundConfig = {
    enabled: true,
    masterVolume: 0.5,
    reverb: { enabled: true, mix: 0.65, decay: 7, tone: 2200 },
    drone: { enabled: true, gain: 0.16, filter: 120, pitch: -4.5 },
    atmosphere: { enabled: true, gain: 0, texture: "grit" },
    melody: { enabled: true, gain: 0.1, density: 0.4, scale: "dorian" },
    arp: { enabled: true, gain: 0, speed: 1, octaves: 2, filter: 600, direction: "updown" },
    rhythm: { enabled: true, gain: 0.17, bpm: 50, filter: 150 },
    modulations: [
        { id: "1", enabled: true, source: "speed", target: "drone.filter", amount: 0.4 },
        { id: "5", enabled: true, source: "altitude", target: "atmosphere.gain", amount: 0.15 },
        { id: "new1", enabled: true, source: "pitch", target: "arp.direction", amount: 1.5 },
        { id: "new2", enabled: true, source: "speed", target: "arp.speed", amount: 0.15 },
        { id: "new3", enabled: true, source: "pitch", target: "arp.octaves", amount: 1 },
        { source: "altitude", target: "rhythm.bpm", amount: 5, enabled: true, id: "ac5a1ec2" },
        { source: "altitude", target: "arp.speed", amount: 0.08, enabled: true, id: "bc74d4c4" },
        { source: "altitude", target: "arp.octaves", amount: 0.1, enabled: true, id: "a2a78857" },
        { source: "altitude", target: "drone.pitch", amount: -0.1, enabled: true, id: "90e51d2e" },
        { id: "dea51834", enabled: true, source: "speed", target: "arp.gain", amount: 0.1 }
    ]
};

const DEFAULT_SHIP_CONFIG: ShipConfig = {
    complexity: 10,
    fold1: 1.7,
    fold2: 1.37,
    fold3: -0.61,
    scale: 1.36,
    stretch: 1.24,
    taper: 0,
    twist: 0,
    asymmetryX: 0,
    asymmetryY: 0,
    asymmetryZ: 0,
    twistAsymX: 0,
    scaleAsymX: 0,
    fold1AsymX: 0,
    fold2AsymX: 0,
    chaseDistance: 9.14,
    chaseVerticalOffset: 0.0,
    pitchOffset: 0.0,
    generalScale: 0.39,
    translucency: 0.94,
    modulations: [
        { id: "1d12faa0", enabled: true, source: "speed", target: "fold3", amount: 0.59 },
        { id: "5a4a800e", enabled: true, source: "turning", target: "twist", amount: 0.12 },
        { id: "900ff66c", enabled: true, source: "pitch", target: "twistAsymX", amount: 0.04 },
        { id: "87d0076b", enabled: true, source: "descent", target: "twistAsymX", amount: 0.06 }
    ]
};

// --- CONSTANTS ---
const MOD_RANGES: Record<ModulationTarget, number> = {
    'masterVolume': 1.0,
    'drone.gain': 1.0, 'drone.filter': 2000, 'drone.pitch': 24,
    'atmosphere.gain': 1.0,
    'arp.gain': 1.0, 'arp.speed': 3.0, 'arp.filter': 4000, 'arp.octaves': 3, 'arp.direction': 1.0,
    'rhythm.gain': 1.0, 'rhythm.filter': 2000, 'rhythm.bpm': 100,
    'melody.gain': 1.0, 'melody.density': 1.0,
    'reverb.mix': 1.0, 'reverb.tone': 5000
};

const SHIP_MOD_RANGES: Record<ShipModulationTarget, number> = {
    'complexity': 5, 'fold1': 0.5, 'fold2': 0.5, 'fold3': 1.0, 'scale': 0.5, 'stretch': 1.0, 'taper': 1.0, 'twist': 1.0,
    'asymmetryX': 1.0, 'asymmetryY': 1.0, 'asymmetryZ': 1.0, 'twistAsymX': 1.0, 'scaleAsymX': 1.0, 'fold1AsymX': 0.5, 'fold2AsymX': 0.5
};

const SCALES = {
    dorian: [62, 64, 65, 67, 69, 71, 72, 74],
    phrygian: [62, 63, 65, 67, 69, 70, 72],
    lydian: [62, 64, 66, 67, 69, 71, 73],
};
const mtof = (note: number) => 440 * Math.pow(2, (note - 69) / 12);

const INITIAL_CAMERA_POS: [number, number, number] = [0, -1.49, 0];
const INITIAL_CAMERA_ROT: [number, number] = [0.1, 0.0];

// Raymarching Helpers
const temp_q = new Float32Array(3);
const temp_q_rot = new Float32Array(3);
const getDistance = (p_vec: Float32Array, uniforms: any, t: number) => {
    const scale = uniforms['slider_fractalScale'] ?? 0.37;
    const rot = uniforms['slider_fractalRotation'] ?? 1.09;
    const pulse = uniforms['slider_fractalPulseStrength'] ?? 0.0;

    temp_q[0] = p_vec[0]; temp_q[1] = p_vec[1]; temp_q[2] = p_vec[2];
    let d = -temp_q[1];
    let i = 58.0;

    while (i > 0.05) {
        const angle = rot + Math.sin(t * 1.0 + temp_q[1] * 5.0) * pulse;
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        temp_q_rot[0] = temp_q[0] * c + temp_q[2] * s;
        temp_q_rot[1] = temp_q[1];
        temp_q_rot[2] = -temp_q[0] * s + temp_q[2] * c;

        const two_i = i + i;
        let qx = ((temp_q_rot[0] % two_i) + two_i) % two_i;
        let qy = ((temp_q_rot[1] % two_i) + two_i) % two_i;
        let qz = ((temp_q_rot[2] % two_i) + two_i) % two_i;
        qx -= i; qy -= i; qz -= i;
        qx = Math.abs(qx); qy = Math.abs(qy); qz = Math.abs(qz);

        const i9 = i * 0.9;
        temp_q[0] = i9 - qx; temp_q[1] = i9 - qy; temp_q[2] = i9 - qz;
        d = Math.max(d, Math.min(temp_q[0], temp_q[1], temp_q[2]));
        i *= scale;
    }
    return d;
};

export const useFlightStore = () => {
    const [activeShaderCode] = useState(DEFAULT_SHADER_CODE);
    const [uniforms, setUniforms] = useState<{ [key: string]: number }>(DEFAULT_UNIFORMS);
    const uniformsRef = useRef(uniforms);

    // Camera Refs
    const cameraRef = useRef<CameraData>({ position: [...INITIAL_CAMERA_POS], rotation: [...INITIAL_CAMERA_ROT], roll: 0 });
    const renderCameraRef = useRef<CameraData>({ position: [...INITIAL_CAMERA_POS], rotation: [...INITIAL_CAMERA_ROT], roll: 0 });
    const cameraVelocityRef = useRef<[number, number, number]>([0, 0, 0]);
    const cameraAngularVelocityRef = useRef<[number, number]>([0, 0]);

    // State
    const keysPressed = useRef(new Set<string>());
    const [pressedKeys, setPressedKeys] = useState(new Set<string>());
    const [viewMode, setViewModeState] = useState<ViewMode>('chase');
    const viewModeTransitionRef = useRef({ current: 1.0, target: 1.0 });
    const [viewModeTransition, setViewModeTransition] = useState(1.0);
    const [isHdEnabled, setIsHdEnabled] = useState(false);

    // Physics Config
    const controlConfig = {
        invertStrafe: true, invertForward: true, invertYaw: false,
        forwardVelocity: 0.3, strafeVelocity: 0.3, ascendVelocity: 0.3, pitchVelocity: 0.3, yawVelocity: 0.3
    };

    // Sound & Ship Config
    const [soundConfig, setSoundConfig] = useState<SoundConfig>(DEFAULT_SOUND_CONFIG);
    const soundConfigRef = useRef(soundConfig);
    const [shipConfig, setShipConfig] = useState<ShipConfig>(DEFAULT_SHIP_CONFIG);
    const shipConfigRef = useRef(shipConfig);
    const { modulations: _mods, ...initEffective } = shipConfig;
    const effectiveShipConfigRef = useRef(initEffective);

    // Audio Context Refs
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioNodesRef = useRef<any>(null);
    const accumulatedTimeRef = useRef(0);
    const nextMelodyTimeRef = useRef(0);
    const nextArpTimeRef = useRef(0);
    const nextRhythmTimeRef = useRef(0);
    const arpNoteIndexRef = useRef(0);
    const arpInternalDirectionRef = useRef(1);

    // Optimization Refs
    const audioInputsRef = useRef<Record<ModulationSource, number>>({ speed: 0, acceleration: 0, altitude: 0, descent: 0, turning: 0, turningSigned: 0, heading: 0, pitch: 0, proximity: 0, time: 0 });
    const audioTargetAccumulatorsRef = useRef<Record<ModulationTarget, number>>({} as any);
    const tempProposedPosRef = useRef(new Float32Array(3));
    const previousSpeedRef = useRef(0);
    const cameraRollRef = useRef(0);

    useEffect(() => { uniformsRef.current = uniforms; }, [uniforms]);
    useEffect(() => { soundConfigRef.current = soundConfig; }, [soundConfig]);
    useEffect(() => { shipConfigRef.current = shipConfig; }, [shipConfig]);

    const setViewMode = useCallback((mode: ViewMode) => {
        setViewModeState(mode);
        viewModeTransitionRef.current.target = mode === 'chase' ? 1.0 : 0.0;
    }, []);

    const playRhythm = useCallback((nodes: any, time: number) => {
        const ctx = audioContextRef.current!;
        const osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.setValueAtTime(120, time); osc.frequency.exponentialRampToValueAtTime(30, time + 0.2);
        const g = ctx.createGain(); g.gain.setValueAtTime(1.0, time); g.gain.exponentialRampToValueAtTime(0.01, time + 0.4);
        osc.connect(g); g.connect(nodes.rhythm.gain);
        osc.start(time); osc.stop(time + 0.5); setTimeout(() => osc.disconnect(), 600);
    }, []);

    const playArp = useCallback((nodes: any, time: number, cfg: SoundConfig, octaves: number, dirMod: number) => {
        const ctx = audioContextRef.current!;
        const scale = SCALES[cfg.melody.scale];
        const totalNotes = scale.length * Math.max(1, Math.round(octaves));

        // Direction Logic
        let dir = cfg.arp.direction;
        if (dirMod > 0.3) dir = 'up'; else if (dirMod < -0.3) dir = 'down';

        if (dir === 'up') arpNoteIndexRef.current = (arpNoteIndexRef.current + 1) % totalNotes;
        else if (dir === 'down') arpNoteIndexRef.current = (arpNoteIndexRef.current - 1 + totalNotes) % totalNotes;
        else if (dir === 'updown') {
            arpNoteIndexRef.current += arpInternalDirectionRef.current;
            if (arpNoteIndexRef.current >= totalNotes - 1) { arpNoteIndexRef.current = totalNotes - 1; arpInternalDirectionRef.current = -1; }
            else if (arpNoteIndexRef.current <= 0) { arpNoteIndexRef.current = 0; arpInternalDirectionRef.current = 1; }
        }

        const idx = Math.max(0, Math.min(totalNotes - 1, arpNoteIndexRef.current));
        const note = scale[idx % scale.length] + (Math.floor(idx / scale.length) + 1) * 12;
        const freq = mtof(note);

        const osc = ctx.createOscillator(); osc.type = 'triangle'; osc.frequency.value = freq;
        const env = ctx.createGain(); env.gain.setValueAtTime(0, time);
        env.gain.linearRampToValueAtTime(0.8, time + 0.01); env.gain.exponentialRampToValueAtTime(0.05, time + 0.3);
        osc.connect(nodes.arp.filter); osc.disconnect(); osc.connect(env); env.connect(nodes.arp.filter);
        osc.start(time); osc.stop(time + 0.4); setTimeout(() => osc.disconnect(), 500);
    }, []);


    // --- AUDIO INIT ---
    const initAudio = useCallback(() => {
        if (audioContextRef.current) return;
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = ctx;

        const cfg = soundConfigRef.current;
        const masterGain = ctx.createGain();
        masterGain.gain.value = cfg.masterVolume;
        const limiter = ctx.createDynamicsCompressor();
        masterGain.connect(limiter);
        limiter.connect(ctx.destination);

        const nodes: any = { masterGain };

        // Reverb
        let reverbNode: any;
        if (cfg.reverb.enabled) {
            reverbNode = { input: ctx.createGain(), output: ctx.createGain(), setTone: (f: number) => verbFilter?.frequency.setTargetAtTime(f, ctx.currentTime, 0.1) };
            const convolver = ctx.createConvolver();
            const length = ctx.sampleRate * cfg.reverb.decay;
            const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
            for (let i = 0; i < length; i++) {
                const env = Math.pow(1 - i / length, 4);
                impulse.getChannelData(0)[i] = (Math.random() * 2 - 1) * env * 0.8;
                impulse.getChannelData(1)[i] = (Math.random() * 2 - 1) * env * 0.8;
            }
            convolver.buffer = impulse;
            const verbFilter = ctx.createBiquadFilter();
            verbFilter.type = 'lowpass'; verbFilter.frequency.value = cfg.reverb.tone;
            reverbNode.input.connect(verbFilter); verbFilter.connect(convolver); convolver.connect(reverbNode.output);
            reverbNode.output.connect(masterGain); reverbNode.output.gain.value = cfg.reverb.mix;
            nodes.reverb = reverbNode;
        }

        // Drone
        if (cfg.drone.enabled) {
            const dg = ctx.createGain(); dg.gain.value = cfg.drone.gain;
            const df = ctx.createBiquadFilter(); df.type = 'lowpass'; df.frequency.value = cfg.drone.filter;
            const baseFreq = mtof(38);
            const osc1 = ctx.createOscillator(); osc1.type = 'sawtooth'; osc1.frequency.value = baseFreq;
            const osc2 = ctx.createOscillator(); osc2.type = 'sawtooth'; osc2.frequency.value = baseFreq * 1.01;
            osc1.connect(df); osc2.connect(df); df.connect(dg); dg.connect(masterGain);
            if (reverbNode) dg.connect(reverbNode.input);
            osc1.start(); osc2.start();
            nodes.drone = { filter: df, gain: dg, osc1, osc2, baseFreq };
        }

        // Atmosphere
        if (cfg.atmosphere.enabled) {
            const ag = ctx.createGain(); ag.gain.value = cfg.atmosphere.gain;
            const af = ctx.createBiquadFilter(); af.type = 'lowpass'; af.frequency.value = 400;
            const bSize = ctx.sampleRate * 8;
            const buf = ctx.createBuffer(2, bSize, ctx.sampleRate);
            for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < bSize; i++)d[i] = Math.random() * 2 - 1; }
            const noise = ctx.createBufferSource(); noise.buffer = buf; noise.loop = true;
            noise.connect(af); af.connect(ag); ag.connect(masterGain);
            if (reverbNode) { const s = ctx.createGain(); s.gain.value = 0.3; ag.connect(s); s.connect(reverbNode.input); }
            noise.start();
            nodes.atmosphere = { filter: af, gain: ag };
        }

        // Arp
        if (cfg.arp.enabled) {
            const arg = ctx.createGain(); arg.gain.value = cfg.arp.gain;
            const arf = ctx.createBiquadFilter(); arf.type = 'lowpass'; arf.frequency.value = cfg.arp.filter;
            const dL = ctx.createDelay(); dL.delayTime.value = 0.3;
            const dR = ctx.createDelay(); dR.delayTime.value = 0.45;
            const fb = ctx.createGain(); fb.gain.value = 0.4;
            const mer = ctx.createChannelMerger(2);
            arf.connect(arg); arg.connect(masterGain); arg.connect(dL); arg.connect(dR);
            dL.connect(fb); dR.connect(fb); fb.connect(dL);
            dL.connect(fb); dR.connect(fb); fb.connect(dL);
            dL.connect(mer, 0, 0); dR.connect(mer, 0, 1); mer.connect(masterGain);
            if (reverbNode) arg.connect(reverbNode.input);
            nodes.arp = { gain: arg, filter: arf };
        }

        // Rhythm
        if (cfg.rhythm.enabled) {
            const rg = ctx.createGain(); rg.gain.value = cfg.rhythm.gain;
            rg.connect(masterGain);
            if (reverbNode) { const s = ctx.createGain(); s.gain.value = 0.6; rg.connect(s); s.connect(reverbNode.input); }
            nodes.rhythm = { gain: rg };
        }

        audioNodesRef.current = nodes;
        const now = ctx.currentTime;
        nextMelodyTimeRef.current = now + 2; nextArpTimeRef.current = now + 0.5; nextRhythmTimeRef.current = now + 0.1;
    }, []);

    const getBaseValue = useCallback((cfg: SoundConfig, target: string) => {
        if (target === 'masterVolume') return cfg.masterVolume;
        const path = target.split('.');
        const cat = path[0] as keyof SoundConfig;
        const prop = path[1];
        if (cfg[cat] && typeof cfg[cat] === 'object') return (cfg[cat] as any)[prop];
        return 0;
    }, []);

    // --- GAME LOOP ---
    useEffect(() => {
        let frameId: number;
        let lastTime = 0;

        const gameLoop = (timestamp: number) => {
            if (lastTime === 0) lastTime = timestamp;
            const dt = Math.min((timestamp - lastTime) / 1000.0, 0.1);
            lastTime = timestamp;
            accumulatedTimeRef.current += dt;

            const ship = shipConfigRef.current;
            const sound = soundConfigRef.current;
            const keys = keysPressed.current;

            // Input
            let fwd = (keys.has('w') ? 1 : 0) - (keys.has('s') ? 1 : 0); if (controlConfig.invertForward) fwd = -fwd;
            let str = (keys.has('d') ? 1 : 0) - (keys.has('a') ? 1 : 0); if (controlConfig.invertStrafe) str = -str;
            let asc = (keys.has(' ') ? 1 : 0) - (keys.has('shift') ? 1 : 0);
            let pitchInput = (keys.has('arrowdown') ? 1 : 0) - (keys.has('arrowup') ? 1 : 0);
            let yawInput = (keys.has('arrowright') ? 1 : 0) - (keys.has('arrowleft') ? 1 : 0); if (controlConfig.invertYaw) yawInput = -yawInput;

            // Physics
            const FLIGHT_PITCH_OFFSET = 0.1;
            const [p, y] = cameraRef.current.rotation;
            const dirX = Math.sin(y) * Math.cos(p - FLIGHT_PITCH_OFFSET);
            const dirY = -Math.sin(p - FLIGHT_PITCH_OFFSET);
            const dirZ = Math.cos(y) * Math.cos(p - FLIGHT_PITCH_OFFSET);
            const rightX = Math.cos(y);
            const rightZ = -Math.sin(y);

            const tVX = (dirX * fwd * controlConfig.forwardVelocity + rightX * str * controlConfig.strafeVelocity);
            const tVY = (dirY * fwd * controlConfig.forwardVelocity + asc * controlConfig.ascendVelocity);
            const tVZ = (dirZ * fwd * controlConfig.forwardVelocity + rightZ * str * controlConfig.strafeVelocity);

            cameraVelocityRef.current[0] += (tVX - cameraVelocityRef.current[0]) * 0.1;
            cameraVelocityRef.current[1] += (tVY - cameraVelocityRef.current[1]) * 0.1;
            cameraVelocityRef.current[2] += (tVZ - cameraVelocityRef.current[2]) * 0.1;

            const proposedPos = tempProposedPosRef.current;
            proposedPos[0] = cameraRef.current.position[0] + cameraVelocityRef.current[0] * dt;
            proposedPos[1] = cameraRef.current.position[1] + cameraVelocityRef.current[1] * dt;
            proposedPos[2] = cameraRef.current.position[2] + cameraVelocityRef.current[2] * dt;

            // Collision Check
            const dist = getDistance(proposedPos, uniformsRef.current, accumulatedTimeRef.current);
            if (dist > 0.002) {
                cameraRef.current.position[0] = proposedPos[0];
                cameraRef.current.position[1] = proposedPos[1];
                cameraRef.current.position[2] = proposedPos[2];
            } else {
                cameraVelocityRef.current[0] = 0; cameraVelocityRef.current[1] = 0; cameraVelocityRef.current[2] = 0;
            }

            cameraAngularVelocityRef.current[0] += (pitchInput * controlConfig.pitchVelocity - cameraAngularVelocityRef.current[0]) * 0.07;
            cameraAngularVelocityRef.current[1] += (yawInput * controlConfig.yawVelocity - cameraAngularVelocityRef.current[1]) * 0.07;
            cameraRef.current.rotation[0] = Math.max(-1.57, Math.min(1.57, p + cameraAngularVelocityRef.current[0] * dt));
            cameraRef.current.rotation[1] = y + cameraAngularVelocityRef.current[1] * dt;

            cameraRollRef.current += (-yawInput * controlConfig.yawVelocity * 0.3 - cameraRollRef.current) * 0.1;
            cameraRef.current.roll = cameraRollRef.current;

            // Camera Setup
            const tr = viewModeTransitionRef.current;
            if (Math.abs(tr.target - tr.current) > 0.001) {
                tr.current += (tr.target - tr.current) * 5.0 * dt;
                setViewModeTransition(tr.current);
            }
            renderCameraRef.current = { ...cameraRef.current };

            // Audio & Rendering Data
            const v = cameraVelocityRef.current;
            const currentSpeed = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
            const accel = (currentSpeed - previousSpeedRef.current) / dt;
            previousSpeedRef.current = currentSpeed;

            const inputs = audioInputsRef.current;
            inputs.speed = currentSpeed; inputs.acceleration = accel * 0.1;
            inputs.altitude = cameraRef.current.position[1] - INITIAL_CAMERA_POS[1];
            inputs.descent = -v[1] * 2.0; inputs.turning = Math.abs(cameraAngularVelocityRef.current[1]);
            inputs.turningSigned = cameraAngularVelocityRef.current[1];
            inputs.heading = (cameraRef.current.rotation[1] % (Math.PI * 2)) / (Math.PI * 2);
            inputs.pitch = -cameraRef.current.rotation[0] / 1.57; inputs.time = timestamp / 1000.0;

            // Audio Engine Update
            if (audioContextRef.current && audioNodesRef.current && sound.enabled) {
                const acc = audioTargetAccumulatorsRef.current;
                Object.keys(MOD_RANGES).forEach(k => {
                    const mk = k as ModulationTarget;
                    acc[mk] = getBaseValue(sound, mk);
                    sound.modulations?.forEach((m: Modulation) => {
                        if (m.enabled && m.target === mk) acc[mk] += (inputs[m.source] || 0) * m.amount * MOD_RANGES[mk];
                    });
                });

                const nodes = audioNodesRef.current;
                const now = audioContextRef.current.currentTime;
                const setVal = (param: AudioParam, val: number, time = 0.1) => param.setTargetAtTime(val, now, time);

                if (nodes.drone) {
                    setVal(nodes.drone.filter.frequency, Math.max(20, acc['drone.filter']), 2.0);
                    const bf = nodes.drone.baseFreq * Math.pow(2, acc['drone.pitch'] / 12);
                    setVal(nodes.drone.osc1.frequency, bf, 0.5); setVal(nodes.drone.osc2.frequency, bf * 1.01, 0.5);
                    setVal(nodes.drone.gain.gain, Math.max(0, acc['drone.gain']));
                }
                if (nodes.atmosphere && nodes.atmosphere.gain) setVal(nodes.atmosphere.gain.gain, Math.max(0, acc['atmosphere.gain']), 1.5);
                setVal(nodes.masterGain.gain, Math.max(0, Math.min(1, acc['masterVolume'])));

                // Sequencer
                const bpm = Math.max(30, Math.min(300, acc['rhythm.bpm']));
                const arpSpeed = Math.max(0.1, Math.min(5.0, acc['arp.speed']));

                if (sound.rhythm.enabled && now >= nextRhythmTimeRef.current - 0.1) {
                    playRhythm(nodes, now);
                    nextRhythmTimeRef.current += 60 / bpm;
                }
                if (sound.arp.enabled && now >= nextArpTimeRef.current - 0.1) {
                    playArp(nodes, now, sound, acc['arp.octaves'], acc['arp.direction']);
                    nextArpTimeRef.current += (60 / bpm) / (arpSpeed * 4);
                }
            }

            // Ship Config Update
            const { modulations: _m, ...effConfig } = ship;
            ship.modulations.forEach((m: ShipModulation) => {
                if (m.enabled && effConfig[m.target as keyof typeof effConfig] !== undefined) {
                    (effConfig[m.target as keyof typeof effConfig] as number) += (inputs[m.source] || 0) * m.amount * (SHIP_MOD_RANGES[m.target as ShipModulationTarget] || 1);
                }
            });
            effectiveShipConfigRef.current = effConfig;

            frameId = requestAnimationFrame(gameLoop);
        };
        frameId = requestAnimationFrame(gameLoop);
        return () => cancelAnimationFrame(frameId);
    }, [playArp, playRhythm, getBaseValue]);

    const pressKey = (key: string) => {
        if (!audioContextRef.current) initAudio();
        if (audioContextRef.current?.state === 'suspended') audioContextRef.current.resume();
        const k = key.toLowerCase();
        keysPressed.current.add(k);
        setPressedKeys(new Set(keysPressed.current));
    };

    const releaseKey = (key: string) => {
        const k = key.toLowerCase();
        keysPressed.current.delete(k);
        setPressedKeys(new Set(keysPressed.current));
    };

    // Keyboard Listeners
    useEffect(() => {
        const d = (e: KeyboardEvent) => pressKey(e.key);
        const u = (e: KeyboardEvent) => releaseKey(e.key);
        window.addEventListener('keydown', d); window.addEventListener('keyup', u);
        return () => { window.removeEventListener('keydown', d); window.removeEventListener('keyup', u); };
    }, [initAudio]);

    // Cleanup
    useEffect(() => {
        return () => { audioContextRef.current?.close(); };
    }, []);

    return {
        activeShaderCode, uniforms, cameraRef, renderCameraRef,
        pressKey, releaseKey, pressedKeys, viewMode, setViewMode, viewModeTransition,
        isHdEnabled, setIsHdEnabled, effectiveShipConfigRef,
        cameraAngularVelocityRef, shipConfig, controlConfig
    };
};
