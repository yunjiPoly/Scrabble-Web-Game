import { expect } from 'chai';
import { createSandbox } from 'sinon';
import { Timer } from './timer';

const TURN_LENGTH = 5000;

describe('Timer', () => {
    let timer: Timer;
    let turnLength: number;
    const sandBox = createSandbox();

    beforeEach(() => {
        turnLength = TURN_LENGTH;
        timer = new Timer(turnLength);
    });

    it('startTimer should call the right functions if-stmt', () => {
        const spy = sandBox.spy(timer, 'emit');
        timer.startTimer();
        expect(spy.calledWith('updateTime', turnLength));
    });
    it('startTimer should call the right function else-stmt', () => {
        const sndTimer = new Timer(0);
        const spy = sandBox.spy(sndTimer, 'emit');
        const spyChangeTurn = sandBox.spy(sndTimer, 'changeTurn');
        timer.startTimer();
        expect(spy.calledWith('timeElapsed'));
        expect(spyChangeTurn.called);
    });
    it('clearTimer should emit right event', () => {
        timer.clearTimer();
        const spy = sandBox.spy(timer, 'emit');
        expect(spy.calledWith('updateTime', 0));
    });
    it('changeTurn should call the right functions', () => {
        const spyClearTimer = sandBox.spy(timer, 'clearTimer');
        const spyLock = sandBox.spy(timer, 'lock');
        timer.changeTurn();
        expect(spyClearTimer.called);
        expect(spyLock.called);
    });
    it('changeTurn should not call the functions', () => {
        const spyClearTimer = sandBox.spy(timer, 'clearTimer');
        const spyLock = sandBox.spy(timer, 'lock');
        timer.lock();
        timer.changeTurn();
        expect(spyClearTimer.notCalled);
        expect(spyLock.notCalled);
    });
    it('isLocked should return correct value', () => {
        const result = timer.isLocked;
        expect(result).to.equals(false);

        timer.lock();
        const result2 = timer.isLocked;
        expect(result2).to.equals(true);
    });
});
