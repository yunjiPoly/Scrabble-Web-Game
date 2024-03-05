import { Player } from '@app/classes/player';
import { Reserve } from '@app/classes/reserve';
import { Service } from 'typedi';

@Service()
export class ExchangeService {
    /**
     * @description Exchange letters in hand with letters from reserve
     * @param letters The letters that are meant to be exchanged
     * @param player The player that requested the exchange
     * @param reserve The current state of the reserve to make the exchange
     */
    exchangeLetters(letters: string, player: Player, reserve: Reserve): void {
        letters.split('').forEach((oldLetter) => {
            player.remove(oldLetter);
            reserve.receiveOne(oldLetter);
            const newLetter = reserve.drawOne();
            if (newLetter !== undefined) {
                player.add(newLetter);
            }
        });
    }
}
