/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { PlaybackState, Prompt } from './types';
import { AudioChunk, GoogleGenAI, LiveMusicFilteredPrompt, LiveMusicServerMessage, LiveMusicSession } from '@google/genai';
// Simple Audio Helpers (Inlining decode functions for simplicity or we can create another file if needed)

// --- Inline Audio Helpers ---

function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

// Convert INT16 PCM to Float32 AudioBuffer
async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const buffer = ctx.createBuffer(
        numChannels,
        data.length / 2 / numChannels,
        sampleRate,
    );

    const dataInt16 = new Int16Array(data.buffer);
    const l = dataInt16.length;
    const dataFloat32 = new Float32Array(l);
    for (let i = 0; i < l; i++) {
        dataFloat32[i] = dataInt16[i] / 32768.0;
    }
    // Extract interleaved channels
    if (numChannels === 0) {
        buffer.copyToChannel(dataFloat32, 0);
    } else {
        for (let i = 0; i < numChannels; i++) {
            const channel = dataFloat32.filter(
                (_, index) => index % numChannels === i,
            );
            buffer.copyToChannel(channel, i);
        }
    }

    return buffer;
}

function throttle(func: Function, limit: number) {
    let inThrottle: boolean;
    return function (this: any, ...args: any[]) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// --- LiveMusicHelper ---

export class LiveMusicHelper extends EventTarget {

    private ai: GoogleGenAI;
    private model: string;

    private session: LiveMusicSession | null = null;
    private sessionPromise: Promise<LiveMusicSession> | null = null;

    private connectionError = true;

    private filteredPrompts = new Set<string>();
    private nextStartTime = 0;
    private bufferTime = 2;

    public readonly audioContext: AudioContext;
    public extraDestination: AudioNode | null = null;

    private outputNode: GainNode;
    private playbackState: PlaybackState = 'stopped';

    private prompts: Map<string, Prompt>;

    constructor(ai: GoogleGenAI, model: string) {
        super();
        this.ai = ai;
        this.model = model;
        this.prompts = new Map();
        this.audioContext = new AudioContext({ sampleRate: 48000 });
        this.outputNode = this.audioContext.createGain();
    }

    private getSession(): Promise<LiveMusicSession> {
        if (!this.sessionPromise) this.sessionPromise = this.connect();
        return this.sessionPromise;
    }

    private async connect(): Promise<LiveMusicSession> {
        this.sessionPromise = this.ai.live.music.connect({
            model: this.model,
            callbacks: {
                onmessage: async (e: LiveMusicServerMessage) => {
                    if (e.setupComplete) {
                        this.connectionError = false;
                    }
                    if (e.filteredPrompt) {
                        this.filteredPrompts = new Set([...this.filteredPrompts, e.filteredPrompt.text!])
                        this.dispatchEvent(new CustomEvent<LiveMusicFilteredPrompt>('filtered-prompt', { detail: e.filteredPrompt }));
                    }
                    if (e.serverContent?.audioChunks) {
                        await this.processAudioChunks(e.serverContent.audioChunks);
                    }
                },
                onerror: () => {
                    this.connectionError = true;
                    this.stop();
                    this.dispatchEvent(new CustomEvent('error', { detail: 'Connection error, please restart audio.' }));
                },
                onclose: () => {
                    this.connectionError = true;
                    this.stop();
                    this.dispatchEvent(new CustomEvent('error', { detail: 'Connection error, please restart audio.' }));
                },
            },
        });
        return this.sessionPromise;
    }

    private setPlaybackState(state: PlaybackState) {
        this.playbackState = state;
        this.dispatchEvent(new CustomEvent('playback-state-changed', { detail: state }));
    }

    private async processAudioChunks(audioChunks: AudioChunk[]) {
        if (this.playbackState === 'paused' || this.playbackState === 'stopped') return;

        const audioBuffer = await decodeAudioData(
            decode(audioChunks[0].data!),
            this.audioContext,
            48000,
            2,
        );

        const source = this.audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.outputNode);

        if (this.nextStartTime === 0) {
            this.nextStartTime = this.audioContext.currentTime + this.bufferTime;
            setTimeout(() => {
                this.setPlaybackState('playing');
            }, this.bufferTime * 1000);
        }

        if (this.nextStartTime < this.audioContext.currentTime) {
            this.setPlaybackState('loading');
            this.nextStartTime = 0;
            return;
        }
        source.start(this.nextStartTime);
        this.nextStartTime += audioBuffer.duration;
    }

    public get activePrompts() {
        return Array.from(this.prompts.values())
            .filter((p) => {
                return !this.filteredPrompts.has(p.text) && p.weight !== 0;
            })
    }

    public readonly setWeightedPrompts = throttle(async (prompts: Map<string, Prompt>) => {
        this.prompts = prompts;

        if (this.activePrompts.length === 0) {
            this.dispatchEvent(new CustomEvent('error', { detail: 'There needs to be one active prompt to play.' }));
            this.pause();
            return;
        }

        // store the prompts to set later if we haven't connected yet
        // there should be a user interaction before calling setWeightedPrompts
        if (!this.session) return;

        const weightedPrompts = this.activePrompts.map((p) => {
            return { text: p.text, weight: p.weight };
        });
        try {
            await this.session.setWeightedPrompts({
                weightedPrompts,
            });
        } catch (e: any) {
            console.error(e);
            this.dispatchEvent(new CustomEvent('error', { detail: e.message }));
            this.pause();
        }
    }, 200);

    public async play() {
        this.setPlaybackState('loading');
        this.session = await this.getSession();
        await this.setWeightedPrompts(this.prompts);
        this.audioContext.resume();
        this.session.play();
        this.outputNode.connect(this.audioContext.destination);
        if (this.extraDestination) this.outputNode.connect(this.extraDestination);
        this.outputNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        this.outputNode.gain.linearRampToValueAtTime(1, this.audioContext.currentTime + 0.1);
    }

    public pause() {
        if (this.session) this.session.pause();
        this.setPlaybackState('paused');
        this.outputNode.gain.setValueAtTime(1, this.audioContext.currentTime);
        this.outputNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.1);
        this.nextStartTime = 0;
        this.outputNode = this.audioContext.createGain();
    }

    public stop() {
        if (this.session) this.session.stop();
        this.setPlaybackState('stopped');
        this.outputNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        this.outputNode.gain.linearRampToValueAtTime(1, this.audioContext.currentTime + 0.1);
        this.nextStartTime = 0;
        this.session = null;
        this.sessionPromise = null;
    }

    public async playPause() {
        switch (this.playbackState) {
            case 'playing':
                return this.pause();
            case 'paused':
            case 'stopped':
                return this.play();
            case 'loading':
                return this.stop();
        }
    }

}
