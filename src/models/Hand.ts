import { Mesh, MeshBuilder, Scene, Vector3, Color3, StandardMaterial } from "@babylonjs/core";
import { PlayerChoice } from "../store/GameStore";

export class Hand {
    private _mesh: Mesh;
    private _scene: Scene;

    constructor(scene: Scene, position: Vector3, choice: PlayerChoice = PlayerChoice.ROCK) {
        this._scene = scene;
        this.createHand(choice);
        this._mesh.position = position;
    }

    private createHand(choice: PlayerChoice) {
        if (this._mesh) this._mesh.dispose();

        // Prototype meshes
        switch (choice) {
            case PlayerChoice.ROCK:
                this._mesh = MeshBuilder.CreateSphere("rock", { diameter: 1 }, this._scene);
                break;
            case PlayerChoice.PAPER:
                this._mesh = MeshBuilder.CreateBox("paper", { width: 1, height: 0.2, depth: 1 }, this._scene);
                break;
            case PlayerChoice.SCISSORS:
                this._mesh = MeshBuilder.CreateCylinder("scissors", { diameter: 0.5, height: 1.5 }, this._scene);
                break;
            default:
                this._mesh = MeshBuilder.CreateSphere("unknown", { diameter: 0.5 }, this._scene);
                break;
        }

        const mat = new StandardMaterial("handMat", this._scene);
        mat.diffuseColor = new Color3(0.8, 0.6, 0.4); // Skin tone-ish
        this._mesh.material = mat;
    }

    public setPose(choice: PlayerChoice) {
        const pos = this._mesh.position.clone();
        this.createHand(choice);
        this._mesh.position = pos;
    }

    public animateShake() {
        // Todo: Add animation
    }
}
