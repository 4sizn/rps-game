import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Color4 } from "@babylonjs/core";

export class SceneService {
    private static instance: SceneService;
    private _engine: Engine;
    private _scene: Scene;
    private _camera: ArcRotateCamera;

    private constructor() { }

    static getInstance(): SceneService {
        if (!SceneService.instance) {
            SceneService.instance = new SceneService();
        }
        return SceneService.instance;
    }

    initialize(canvas: HTMLCanvasElement): Scene {
        this._engine = new Engine(canvas, true);
        this._scene = new Scene(this._engine);

        // Clear Color (Dark Background)
        this._scene.clearColor = new Color4(0.1, 0.1, 0.1, 1);

        // Camera setup (ArcRotateCamera for orbiting)
        this._camera = new ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 2.5, 10, Vector3.Zero(), this._scene);
        this._camera.attachControl(canvas, true);
        this._camera.lowerRadiusLimit = 5;
        this._camera.upperRadiusLimit = 20;
        this._camera.wheelDeltaPercentage = 0.01;

        // Light setup
        const light = new HemisphericLight("light1", new Vector3(0, 1, 0), this._scene);
        light.intensity = 0.7;

        // Handle window resize
        window.addEventListener('resize', () => {
            this._engine.resize();
        });

        return this._scene;
    }

    startRenderLoop() {
        if (!this._engine || !this._scene) {
            console.error("[SceneService] Cannot start render loop: Engine or Scene not initialized.");
            return;
        }
        this._engine.runRenderLoop(() => {
            this._scene.render();
        });
    }

    get scene(): Scene {
        return this._scene;
    }

    get engine(): Engine {
        return this._engine;
    }

    get camera(): ArcRotateCamera {
        return this._camera;
    }
}
