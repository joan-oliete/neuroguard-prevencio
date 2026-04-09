export interface Slider {
    name: string;
    variableName: string;
    min: number;
    max: number;
    step: number;
    defaultValue: number;
    description?: string;
}

export interface ControlConfig {
    invertStrafe?: boolean;
    invertForward?: boolean;
    invertAscend?: boolean;
    invertPitch?: boolean;
    invertYaw?: boolean;
    forwardVelocity?: number;
    strafeVelocity?: number;
    ascendVelocity?: number;
    pitchVelocity?: number;
    yawVelocity?: number;
}

// Expanded Inputs
export type ModulationSource =
    | 'speed'        // 0.0 to ~1.0+
    | 'acceleration' // Delta speed
    | 'altitude'     // Height relative to start
    | 'descent'      // Downward velocity
    | 'turning'      // Yaw rotation speed
    | 'turningSigned'
    | 'heading'      // Compass direction
    | 'pitch'        // Camera look up/down angle
    | 'proximity'    // Closeness to obstacles
    | 'time';        // Always increasing seconds

// Expanded Outputs
export type ModulationTarget =
    | 'masterVolume'
    | 'drone.gain' | 'drone.filter' | 'drone.pitch'
    | 'atmosphere.gain'
    | 'arp.gain' | 'arp.speed' | 'arp.filter' | 'arp.octaves' | 'arp.direction'
    | 'rhythm.gain' | 'rhythm.filter' | 'rhythm.bpm'
    | 'melody.gain' | 'melody.density'
    | 'reverb.mix' | 'reverb.tone';

export interface Modulation {
    id: string;
    enabled: boolean;
    source: ModulationSource;
    target: ModulationTarget;
    amount: number; // -1.0 to 1.0
}

export interface ReverbConfig {
    enabled: boolean;
    mix: number; // 0 to 1
    decay: number; // seconds
    tone: number; // Hz
}

export interface ArpConfig {
    enabled: boolean;
    gain: number;
    speed: number; // 0.1 to 2.0 factor
    octaves: 1 | 2 | 3;
    filter: number; // Base filter cutoff
    direction: 'up' | 'down' | 'updown' | 'random';
}

export interface RhythmConfig {
    enabled: boolean;
    gain: number;
    bpm: number;
    filter: number;
}

export interface SoundConfig {
    enabled: boolean;
    masterVolume: number;
    reverb: ReverbConfig;
    drone: {
        enabled: boolean;
        gain: number;
        filter: number;
        pitch: number;
    };
    atmosphere: {
        enabled: boolean;
        gain: number;
        texture: 'smooth' | 'grit';
    };
    melody: {
        enabled: boolean;
        gain: number;
        density: number;
        scale: 'dorian' | 'phrygian' | 'lydian';
    };
    arp: ArpConfig;
    rhythm: RhythmConfig;
    modulations: Modulation[];
}

export interface CameraData {
    position: [number, number, number];
    rotation: [number, number];
    roll: number;
}

export type ViewMode = 'cockpit' | 'chase';

export type ShipModulationTarget =
    | 'complexity'
    | 'fold1' | 'fold2' | 'fold3'
    | 'scale' | 'stretch' | 'taper' | 'twist'
    | 'asymmetryX' | 'asymmetryY' | 'asymmetryZ'
    | 'twistAsymX' | 'scaleAsymX' | 'fold1AsymX' | 'fold2AsymX';

export interface ShipModulation {
    id: string;
    enabled: boolean;
    source: ModulationSource;
    target: ShipModulationTarget;
    amount: number;
}

export interface ShipConfig {
    complexity: number;
    fold1: number;
    fold2: number;
    fold3: number;
    scale: number;
    stretch: number;
    taper: number;
    twist: number;
    asymmetryX: number;
    asymmetryY: number;
    asymmetryZ: number;
    twistAsymX: number;
    scaleAsymX: number;
    fold1AsymX: number;
    fold2AsymX: number;

    chaseDistance?: number;
    chaseVerticalOffset?: number;
    pitchOffset?: number;
    generalScale?: number;
    translucency?: number;
    modulations: ShipModulation[];
}
