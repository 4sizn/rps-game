import { BehaviorSubject, Observable } from 'rxjs';

export enum GameState {
    IDLE = 'IDLE',
    CHOOSING = 'CHOOSING',
    ANIMATING = 'ANIMATING',
    RESULT = 'RESULT',
    BROKEN = 'BROKEN', // Machine destroyed
    HACKED = 'HACKED'  // Machine hacked
}

export enum PlayerChoice {
    NONE = 'NONE',
    ROCK = 'ROCK',
    PAPER = 'PAPER',
    SCISSORS = 'SCISSORS'
}

export enum GameResult {
    NONE = 'NONE',
    WIN = 'WIN',
    LOSE = 'LOSE',
    DRAW = 'DRAW'
}

export class GameStore {
    private static instance: GameStore;

    private _state = new BehaviorSubject<GameState>(GameState.IDLE);
    private _result = new BehaviorSubject<GameResult>(GameResult.NONE);
    private _playerChoice = new BehaviorSubject<PlayerChoice>(PlayerChoice.NONE);
    private _cpuChoice = new BehaviorSubject<PlayerChoice>(PlayerChoice.NONE);

    private _coins = new BehaviorSubject<number>(0);
    private _isGameActive = new BehaviorSubject<boolean>(false);

    private constructor() { }

    static getInstance(): GameStore {
        if (!GameStore.instance) {
            GameStore.instance = new GameStore();
        }
        return GameStore.instance;
    }

    // Public Observables
    get state$(): Observable<GameState> { return this._state.asObservable(); }
    get result$(): Observable<GameResult> { return this._result.asObservable(); }
    get playerChoice$(): Observable<PlayerChoice> { return this._playerChoice.asObservable(); }
    get cpuChoice$(): Observable<PlayerChoice> { return this._cpuChoice.asObservable(); }
    get coins$(): Observable<number> { return this._coins.asObservable(); }
    get isGameActive$(): Observable<boolean> { return this._isGameActive.asObservable(); }

    // Actions
    setState(state: GameState) {
        console.log(`[GameStore] State Change: ${this._state.value} -> ${state}`);
        this._state.next(state);
    }

    addCoin() {
        this._coins.next(this._coins.value + 1);
        console.log(`[GameStore] Coin Inserted. Total: ${this._coins.value}`);
    }

    startGame() {
        if (this._coins.value > 0) {
            this._coins.next(this._coins.value - 1);
            this._isGameActive.next(true);
            this.setState(GameState.IDLE);
            console.log("[GameStore] Game Started! Coin used.");
            return true;
        } else {
            console.log("[GameStore] Insert Coin to play!");
            return false;
        }
    }

    endGame() {
        this._isGameActive.next(false);
    }

    setPlayerChoice(choice: PlayerChoice) {
        this._playerChoice.next(choice);
    }

    setCpuChoice(choice: PlayerChoice) {
        this._cpuChoice.next(choice);
    }

    setResult(result: GameResult) {
        this._result.next(result);
    }

    reset() {
        this.setState(GameState.IDLE);
        this.setPlayerChoice(PlayerChoice.NONE);
        this.setCpuChoice(PlayerChoice.NONE);
        this.setResult(GameResult.NONE);
    }
}
