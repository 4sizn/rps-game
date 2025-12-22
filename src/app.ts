import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import { Vector3, Color3 } from "@babylonjs/core";
import { SceneService } from "./core/SceneService";
import { InputService } from "./services/InputService";
import { AudioService } from "./services/AudioService";
import { GameStore, GameState, PlayerChoice, GameResult } from "./store/GameStore";
import { GameMachine } from "./models/GameMachine";
import { Hand } from "./models/Hand";
import { RpsGameService } from "./services/RpsGameService";

class App {
    private _machine: GameMachine;
    private _cpuHand: Hand;
    private _playerHand: Hand; // Visual representation of result

    constructor() {
        // 1. Setup Canvas
        const canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.id = "gameCanvas";
        document.body.appendChild(canvas);

        // 2. Initialize Core Services
        const sceneService = SceneService.getInstance();
        const scene = sceneService.initialize(canvas);

        InputService.getInstance().initialize(scene);
        AudioService.getInstance().initialize(scene);
        const store = GameStore.getInstance();

        // 3. Create World Objects
        this._machine = new GameMachine(scene);

        // CPU Hand (Center Top)
        this._cpuHand = new Hand(scene, new Vector3(0, 4, 0), PlayerChoice.ROCK);

        // Player Hand (Center Bottom - Result)
        this._playerHand = new Hand(scene, new Vector3(0, 1, 0), PlayerChoice.ROCK);

        // 4. Setup Input & Logic Binding
        InputService.getInstance().onTilt$.subscribe(tiltVec => {
            this._machine.tilt(tiltVec);
        });

        // Simple GUI for interaction (Prototype Phase)
        this.createGUI(store);

        // Game Loop Logic
        store.state$.subscribe(state => {
            switch (state) {
                case GameState.IDLE:
                    console.log("Game Idle");
                    break;
                case GameState.RESULT:
                    console.log("Game Result Shown");
                    break;
            }
        });

        store.playerChoice$.subscribe(choice => {
            if (choice !== PlayerChoice.NONE) {
                this._playerHand.setPose(choice);
            }
        });

        store.cpuChoice$.subscribe(choice => {
            if (choice !== PlayerChoice.NONE) {
                this._cpuHand.setPose(choice);
            }
        });

        // 5. Start Render Loop
        sceneService.startRenderLoop();
    }

    // Temporary HTML UI for picking (until 3D buttons are fully ready)
    private createGUI(store: GameStore) {
        const div = document.createElement("div");
        div.style.position = "absolute";
        div.style.bottom = "20px";
        div.style.width = "100%";
        div.style.textAlign = "center";

        // Coin Display
        const coinDisplay = document.createElement("div");
        coinDisplay.style.color = "white";
        coinDisplay.style.fontSize = "24px";
        coinDisplay.style.marginBottom = "10px";
        coinDisplay.innerText = "Coins: 0";
        div.appendChild(coinDisplay);

        store.coins$.subscribe(coins => {
            coinDisplay.innerText = `Coins: ${coins}`;
        });

        // Add Coin Button
        const addCoinBtn = document.createElement("button");
        addCoinBtn.innerText = "INSERT COIN";
        addCoinBtn.style.margin = "10px";
        addCoinBtn.style.padding = "10px 20px";
        addCoinBtn.style.fontSize = "20px";
        addCoinBtn.style.backgroundColor = "#ffd700"; // Gold
        addCoinBtn.onclick = () => {
            store.addCoin();
            AudioService.getInstance().playSound("rps");
            // Auto start game if not active and coin inserted?
            // For now, let's say "Insert Coin" adds credit, and maybe a "Start" button checks coin
            // OR simply: Insert Coin -> Ready to Play.

            // As per request: "addCoin을 넣으면... rps.mp3를 실행하고, 게임이 실행되며"
            if (store.startGame()) {
                // Game Started
            }
        };
        div.appendChild(addCoinBtn);

        const choices = [PlayerChoice.ROCK, PlayerChoice.PAPER, PlayerChoice.SCISSORS];
        const choiceBtns: HTMLButtonElement[] = [];

        choices.forEach(c => {
            const btn = document.createElement("button");
            btn.innerText = c;
            btn.style.margin = "10px";
            btn.style.padding = "10px 20px";
            btn.style.fontSize = "20px";
            btn.disabled = true; // Disabled initially
            btn.onclick = () => {
                // Delegate to Service
                RpsGameService.getInstance().playRound(c);

                // Disable buttons after choice
                choiceBtns.forEach(b => b.disabled = true);
            };
            div.appendChild(btn);
            choiceBtns.push(btn);
        });

        const resetBtn = document.createElement("button");
        resetBtn.innerText = "RESET / NEXT ROUND";
        resetBtn.style.margin = "10px";
        resetBtn.style.display = "none";
        resetBtn.onclick = () => {
            store.reset();
            // Consuming coin for next round needs to happen if we want strictly 1 coin per round
            // If we already started, we just reset state to IDLE.
            // If we want "Insert Coin -> 1 Game", then reset should bring back to "Needs Coin" or allow replay if user has more coins.

            // Simplest interpretation: Ready for next choice if game is active.
            // If game is over (one round), we might want to check coins again.
            // Let's assume 1 Coin = 1 Round.
            store.endGame();
            resetBtn.style.display = "none";
        };
        div.appendChild(resetBtn);

        // React to Game State
        store.isGameActive$.subscribe(active => {
            choiceBtns.forEach(b => b.disabled = !active);
            addCoinBtn.disabled = active; // Disable coin insert while playing? Or allow stacking? Let's disable for simplicity of flow
        });

        store.state$.subscribe(state => {
            if (state === GameState.RESULT) {
                resetBtn.style.display = "inline";

                // Show Alert or Overlay (Using subscription here instead of direct call in service keeps view logic in view)
                // But wait, the previous implementation had alert in playRound.
                // Ideally, we should subscribe to result$ separately, but let's leave alert logic here for now or depend on the Result State.
            }
        });

        // Listen to result to show alert
        store.result$.subscribe(result => {
            if (result !== GameResult.NONE) {
                // Small delay to let UI update state (prototype hack)
                setTimeout(() => alert(`Result: ${result}!`), 100);
            }
        });
    }
}
new App();