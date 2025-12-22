import { Scene, PointerInfo, PointerEventTypes, Vector3 } from "@babylonjs/core";
import { Subject, Observable, fromEvent } from "rxjs";
import { map, throttleTime, bufferTime, filter } from "rxjs/operators";

export class InputService {
    private static instance: InputService;

    private _pointerDown = new Subject<PointerInfo>();
    private _pointerUp = new Subject<PointerInfo>();
    private _pointerMove = new Subject<PointerInfo>();

    // Simulate tilt or shake based on mouse or device orientation
    private _tilt = new Subject<Vector3>();

    private constructor() { }

    static getInstance(): InputService {
        if (!InputService.instance) {
            InputService.instance = new InputService();
        }
        return InputService.instance;
    }

    initialize(scene: Scene) {
        scene.onPointerObservable.add((pointerInfo) => {
            switch (pointerInfo.type) {
                case PointerEventTypes.POINTERDOWN:
                    this._pointerDown.next(pointerInfo);
                    break;
                case PointerEventTypes.POINTERUP:
                    this._pointerUp.next(pointerInfo);
                    break;
                case PointerEventTypes.POINTERMOVE:
                    this._pointerMove.next(pointerInfo);
                    // Simple simulation: map pointer X to Tilt Z
                    if (pointerInfo.event instanceof PointerEvent) {
                        const x = (pointerInfo.event.clientX / window.innerWidth) * 2 - 1; // -1 to 1
                        const y = (pointerInfo.event.clientY / window.innerHeight) * 2 - 1; // -1 to 1
                        // Invert Y for tilt
                        this._tilt.next(new Vector3(-y * 0.5, 0, -x * 0.5));
                    }
                    break;
            }
        });

        // Device Motion (if supported and HTTPS)
        // placeholder for now
    }

    get onPointerDown$(): Observable<PointerInfo> {
        return this._pointerDown.asObservable();
    }

    get onPointerUp$(): Observable<PointerInfo> {
        return this._pointerUp.asObservable();
    }

    get onTilt$(): Observable<Vector3> {
        return this._tilt.asObservable();
    }
}
