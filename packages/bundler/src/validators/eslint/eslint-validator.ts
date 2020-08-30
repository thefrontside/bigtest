import { subscribe, Subscribable, SymbolSubscribable, ChainableSubscription } from '@effection/subscription';
import { Channel } from '@effection/channel';
import { EslintValidatorState } from '../../types';

export class EslintValidator implements Subscribable<EslintValidatorState, void> {
  private channel = new Channel<EslintValidatorState>();

  *validate() {

  }
  
  [SymbolSubscribable]() {
    return this.channel[SymbolSubscribable]();
  }
}