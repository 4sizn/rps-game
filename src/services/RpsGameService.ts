import { GameStore, GameState, PlayerChoice, GameResult } from "../store/GameStore";

export class RpsGameService {
    private static instance: RpsGameService;
    private _store: GameStore;

    private constructor() {
        this._store = GameStore.getInstance();
    }

    static getInstance(): RpsGameService {
        if (!RpsGameService.instance) {
            RpsGameService.instance = new RpsGameService();
        }
        return RpsGameService.instance;
    }

    public playRound(choice: PlayerChoice) {
        // Validate state
        // if (!this._store.isGameActive.value) return; // Need to expose value or just rely on UI

        this._store.setState(GameState.CHOOSING);
        this._store.setPlayerChoice(choice);

        // Random CPU Choice
        const options = [PlayerChoice.ROCK, PlayerChoice.PAPER, PlayerChoice.SCISSORS];
        const cpuChoice = options[Math.floor(Math.random() * options.length)];
        this._store.setCpuChoice(cpuChoice);

        // Calculate Result
        const result = this.calculateResult(choice, cpuChoice);

        this._store.setResult(result);
        this._store.setState(GameState.RESULT);

        console.log(`[RpsGameService] Player: ${choice}, CPU: ${cpuChoice} -> ${result}`);
    }

    private calculateResult(player: PlayerChoice, cpu: PlayerChoice): GameResult {
        if (player === cpu) return GameResult.DRAW;

        if (
            (player === PlayerChoice.ROCK && cpu === PlayerChoice.SCISSORS) ||
            (player === PlayerChoice.PAPER && cpu === PlayerChoice.ROCK) ||
            (player === PlayerChoice.SCISSORS && cpu === PlayerChoice.PAPER)
        ) {
            return GameResult.WIN;
        }

        return GameResult.LOSE;
    }
}
