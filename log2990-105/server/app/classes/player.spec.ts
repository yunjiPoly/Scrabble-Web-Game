import { expect } from 'chai';
import { describe } from 'mocha';
import { Player } from '@app/classes/player';

describe('Player', () => {
    const player: Player = new Player('test');

    it('completePrivate should return correct value', () => {
        let result = player.completePrivate();
        expect(player.privateObj[1]).to.equals(true);
        expect(result).to.equals(true);

        result = player.completePrivate();
        expect(result).to.equals(false);
    });

    it('get method should return correct value', () => {
        const letters: string[] = ['a', 'b', 'b', 'e', 'i', 'x', 'k', 'j'];
        player.addAll(letters);
        const result = player.get('b');
        expect(result).to.equals(2);
    });
});
