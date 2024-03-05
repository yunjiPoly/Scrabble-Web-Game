import { EventEmitter } from 'events';

export class Timer extends EventEmitter {
    static readonly events = {
        updateTurn: 'updateTurn',
        updateTime: 'updateTime',
        timeElapsed: 'timeElapsed',
    };

    // Locking mechanism to prevent concurrent modifications
    private locked = false;

    private readonly turnLength: number;
    private turnState: boolean;
    private timer: NodeJS.Timeout;

    constructor(turnLength: number) {
        super();
        this.turnLength = turnLength;
        this.turnState = Boolean(Math.floor(Math.random() * 2));
    }

    /**
     * @description Set time to {@link turnLength} and start counting down
     */
    startTimer(): void {
        this.unlock();
        let currentTime = this.turnLength;
        const callback = (): void => {
            // Update time for players
            this.emit(Timer.events.updateTime, currentTime);
            if (currentTime > 0) {
                // If there is still time left, keep counting down
                currentTime--;
            } else {
                // If time has run out, trigger event
                this.emit(Timer.events.timeElapsed, this.turnState);
            }
        };
        // Call it once in do-while fashion
        callback();
        this.timer = setInterval(callback, SECOND);
    }

    /**
     * @description Stop the timer and reset time to zero
     */
    clearTimer(): void {
        clearInterval(this.timer);
        this.emit(Timer.events.updateTime, 0);
    }

    /**
     * @description Change whose turn it is
     */
    changeTurn(): void {
        if (this.locked) {
            return;
        }
        this.lock();
        this.clearTimer();
        this.turnState = !this.turnState;
        this.emit(Timer.events.updateTurn, this.turnState);
    }

    /**
     * @description Lock the timer to prevent concurrent modifications
     */
    lock(): void {
        this.locked = true;
    }

    /**
     * @description Unlock the timer
     */
    private unlock(): void {
        this.locked = false;
    }

    /**
     * @description Is the timer locked?
     */
    get isLocked(): boolean {
        return this.locked;
    }

    get turn(): boolean {
        return this.turnState;
    }
}

const SECOND = 1000;
