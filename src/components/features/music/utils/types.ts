export interface Prompt {
    promptId: string;
    text: string;
    weight: number;
    color: string;
    cc: number;
}

export type PlaybackState = 'stopped' | 'playing' | 'paused' | 'loading';

export interface MidiMessage {
    type: 'noteon' | 'noteoff' | 'controlchange' | 'clock';
    channel: number;
    data1: number;
    data2: number;
}
