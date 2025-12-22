import { Mesh, MeshBuilder, Scene, Vector3, Color3, StandardMaterial, ActionManager, ExecuteCodeAction } from "@babylonjs/core";
import { GameStore, GameState } from "../store/GameStore";

export class GameMachine {
    private _mesh: Mesh;
    private _screws: Mesh[] = [];
    private _scene: Scene;

    constructor(scene: Scene) {
        this._scene = scene;
        this.createMachine();
    }

    private createMachine() {
        // Main Body
        this._mesh = MeshBuilder.CreateBox("machineBody", { width: 4, height: 6, depth: 2 }, this._scene);
        this._mesh.position.y = 3;

        const mat = new StandardMaterial("machineMat", this._scene);
        mat.diffuseColor = new Color3(0.2, 0.2, 0.8);
        this._mesh.material = mat;

        // Screws (Interactive points)
        this.addScrew(new Vector3(1.5, 5.5, -1.05));
        this.addScrew(new Vector3(-1.5, 5.5, -1.05));
        this.addScrew(new Vector3(1.5, 0.5, -1.05));
        this.addScrew(new Vector3(-1.5, 0.5, -1.05));
    }

    private addScrew(position: Vector3) {
        const screw = MeshBuilder.CreateSphere("screw", { diameter: 0.3 }, this._scene);
        screw.position = position;
        screw.parent = this._mesh; // Attach to body

        const mat = new StandardMaterial("screwMat", this._scene);
        mat.diffuseColor = new Color3(0.6, 0.6, 0.6);
        screw.material = mat;

        // Interaction
        screw.actionManager = new ActionManager(this._scene);
        screw.actionManager.registerAction(new ExecuteCodeAction(
            ActionManager.OnPickTrigger,
            () => {
                this.unscrew(screw);
            }
        ));

        this._screws.push(screw);
    }

    public unscrew(screw: Mesh) {
        // Simple animation or disposal
        screw.dispose();
        console.log("[GameMachine] Screw removed!");

        // Example: If all screws removed, trigger 'BROKEN' state?
        const remaining = this._screws.filter(s => !s.isDisposed());
        if (remaining.length === 0) {
            GameStore.getInstance().setState(GameState.BROKEN);
        }
    }

    public tilt(vector: Vector3) {
        if (!this._mesh || this._mesh.isDisposed()) return;

        // Apply tilt rotation
        this._mesh.rotation.z = vector.x * 0.5; // Tilt left/right
        this._mesh.rotation.x = vector.z * 0.5; // Tilt fwd/back
    }

    public shake() {
        // Visual shake effect
    }
}
