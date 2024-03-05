import { Player } from '@app/classes/player';
import { Reserve } from '@app/classes/reserve';
import { expect } from 'chai';
import { ExchangeService } from './exchange.service';

class MockReserve extends Reserve {
    letters: string[];
}

describe('LetterExchangeService', () => {
    let service: ExchangeService;
    let letters: string;
    let player: Player;
    let reserve: MockReserve;

    beforeEach(() => {
        player = new Player('Joe');
        service = new ExchangeService();
        reserve = new MockReserve();
        letters = 'abc';
        reserve.letters = ['u', 'v', 't'];
    });

    it('should exchange correctly', () => {
        const arr: string[] = ['a', 'b', 'c'];
        player.addAll(arr);

        service.exchangeLetters(letters, player, reserve);

        expect(player.hand[0]).to.not.equals(undefined);
        expect(player.hand[1]).to.not.equals(undefined);
        expect(player.hand[2]).to.not.equals(undefined);
    });
});
