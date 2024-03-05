import { Reserve } from '@app/classes/reserve';
import { expect } from 'chai';
import { stub } from 'sinon';

describe('Reserve', () => {
    let reserve: Reserve;

    beforeEach(() => {
        reserve = new Reserve();
    });

    it('drawOne should return a letter', () => {
        const result = reserve.drawOne();
        expect(result).to.not.equals(undefined);
    });
    it('drawOne should return undefined', () => {
        stub(reserve, 'size').get(() => 0);
        const result = reserve.drawOne();
        expect(result).to.equals(undefined);
    });
    it('draw should return letters', () => {
        const result = reserve.draw(2);
        if (result !== undefined) {
            expect(result[0]).to.not.equals(undefined);
            expect(result[1]).to.not.equals(undefined);
        }
    });
    it('draw should return undefined', () => {
        stub(reserve, 'size').get(() => 0);
        const result = reserve.draw(2);
        if (result === undefined) {
            expect(result).to.equals(undefined);
        }
    });
});
