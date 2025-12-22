import { Scene, Sound } from "@babylonjs/core";

export class AudioService {
    private static instance: AudioService;
    private _scene: Scene;
    private _sounds: Map<string, Sound> = new Map();

    private constructor() { }

    static getInstance(): AudioService {
        if (!AudioService.instance) {
            AudioService.instance = new AudioService();
        }
        return AudioService.instance;
    }

    initialize(scene: Scene) {
        this._scene = scene;
        // Pre-load common sounds here if needed
        this.loadSound('rps', 'assets/sounds/rps.mp3');
    }

    loadSound(name: string, url: string, options?: any) {
        if (this._sounds.has(name)) return;

        const sound = new Sound(name, url, this._scene, () => {
            console.log(`[AudioService] Loaded sound: ${name}`);
        }, options);

        this._sounds.set(name, sound);
    }

    playSound(name: string) {
        const sound = this._sounds.get(name);
        if (sound) {
            sound.play();
        } else {
            console.warn(`[AudioService] Sound not found: ${name}`);
        }
    }

    stopSound(name: string) {
        const sound = this._sounds.get(name);
        if (sound) {
            sound.stop();
        }
    }
}
